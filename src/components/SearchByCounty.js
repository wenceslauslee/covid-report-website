import Button from 'react-bootstrap/Button';
import { Component } from 'react';
import Form from 'react-bootstrap/Form';
import Formatter from '../utils/Formatter';
import Grapher from '../utils/Grapher';
import moment from 'moment';
import React from 'react';
import Select from 'react-select';
import { Spinner } from 'react-bootstrap';
import _ from 'lodash';

class SearchByCounty extends Component {
  constructor(props) {
    super(props);

    this.submitPlot = this.submitPlot.bind(this);
    this.handleTrackerChanged = this.handleTrackerChanged.bind(this);

    this.state = {
      loading: true,
      trackers: [null, null, null, null]
    };

    this.styles = {};
    this.data = {};
    this.series = {};
    this.countyCache = {};

    this.data.selectedCounties = [];
    this.data.groupedOptions = [];

  }

  componentDidMount() {
    fetch('https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/rank?infoKey=stateToCounty')
      .then(res => res.json())
      .then(rdata => {
        const groupedOptions = _.map(rdata.mappings, m => {
          const label = m.state;
          const options = _.map(m.counties, c => {
            return {
              value: c.fips,
              label: c.name
            }
          });

          return {
            label: label,
            options: options
          };
        });

        this.data.groupedOptions = groupedOptions;
      })
      .catch(err => {
        console.log(err);
      })
      .then(() => {
        this.setState(prevState => ({
          ...prevState,
          loading: false,
        }));
      });
  }

  async submitPlot(event) {
    event.preventDefault();

    if (this.data.selectedCounties.length === 0) {
      return;
    }

    this.setState(prevState => ({
      ...prevState,
      loading: true
    }));

    const promises = this.data.selectedCounties.map(async countyObj => {
      return await this.submitCounty(countyObj);
    });
    const allCounties = await Promise.all(promises);

    const results = Grapher.combineData(allCounties);

    const keys = ['time'];
    const keysWithoutTime = [];
    const countyColumns = ['time'];
    this.data.selectedCounties.forEach(countyObj => {
      keys.push(countyObj.value);
      keysWithoutTime.push(countyObj.value);
      countyColumns.push(countyObj.label);
    });

    const legendColumns = ['time'];
    const colorColumns = ['#000000'];
    for (var i = 1; i < keys.length; i++) {
      legendColumns.push(keys[i]);
      colorColumns.push(Grapher.getColor(i - 1));
    }

    this.data.keys = keys;
    this.data.columns = countyColumns;
    this.data.validDate = results.currentDate;
    this.data.timestamp = results.reportTimestamp;

    this.data.detailedInfo = {};
    this.data.detailedInfo.caseCountSeries = Grapher.getTimeSeries('CaseCount', keys, results.caseCount);
    this.data.detailedInfo.deathCountSeries = Grapher.getTimeSeries('CaseCountDailyIncrease', keys, results.deathCount);
    this.data.detailedInfo.caseCountIncreaseSeries = Grapher.getTimeSeries('DeathCount', keys, results.caseCountIncrease);
    this.data.detailedInfo.deathCountIncreaseSeries = Grapher.getTimeSeries('DeathCountDailyIncrease', keys, results.deathCountIncrease);
    this.data.detailedInfo.caseCountMax = results.caseCountMax;
    this.data.detailedInfo.deathCountMax = results.deathCountMax;
    this.data.detailedInfo.caseCountIncreaseMax = results.caseCountIncreaseMax;
    this.data.detailedInfo.deathCountIncreaseMax = results.deathCountIncreaseMax;

    this.styles = {
      legendStyle: Grapher.getLegendStyle(legendColumns, colorColumns),
      lineStyle: Grapher.getLineStyle(colorColumns, keys),
      axisStyle: Grapher.getAxisStyle()
    };

    this.setState(prevState => ({
      ...prevState,
      loading: false
    }));
  }

  submitCounty(countyObj) {
    const countySanitized = encodeURIComponent(countyObj.value);

    if (!Object.prototype.hasOwnProperty.call(this.countyCache, countySanitized) ||
        moment() - moment(this.countyCache[countySanitized].reportTimestamp) >= 600000) {
      return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=county&key=${countySanitized}`)
        .then(res => res.json())
        .then(rdata => {
          const results = {
            dataPoints: rdata.dataPoints,
            currentDate: rdata.currentDate,
            reportTimestamp: rdata.reportTimestamp
          };
          this.countyCache[countySanitized] = results;

          return results;
        })
        .catch(err => {
          console.log(err);
        });
    }

    return this.countyCache[countySanitized];
  }

  getCaseCountGraph() {
    return Grapher.getGraph(
      this.data.keys, this.data.columns, 'Case Count', this.data.detailedInfo.caseCountSeries,
      this.data.detailedInfo.caseCountMax, this.state.trackers[0], tracker => this.handleTrackerChanged(tracker, 0),
      this.styles);
  }

  getCaseCountIncreaseGraph() {
    return Grapher.getGraph(
      this.data.keys, this.data.columns, 'Case Count Daily Increase 7-Day Average',
      this.data.detailedInfo.caseCountIncreaseSeries, this.data.detailedInfo.caseCountIncreaseMax,
      this.state.trackers[1], tracker => this.handleTrackerChanged(tracker, 1), this.styles);
  }

  getDeathCountGraph() {
    return Grapher.getGraph(
      this.data.keys, this.data.columns, 'Death Count', this.data.detailedInfo.deathCountSeries,
      this.data.detailedInfo.deathCountMax, this.state.trackers[2], tracker => this.handleTrackerChanged(tracker, 2),
      this.styles);
  }

  getDeathCountIncreaseGraph() {
    return Grapher.getGraph(
      this.data.keys, this.data.columns, 'Death Count Daily Increase 7-Day Average',
      this.data.detailedInfo.deathCountIncreaseSeries, this.data.detailedInfo.deathCountIncreaseMax,
      this.state.trackers[3], tracker => this.handleTrackerChanged(tracker, 3), this.styles);
  }

  handleTrackerChanged(tracker, index) {
    const trackers = this.state.trackers;
    trackers[index] = tracker;

    this.setState(prevState => ({
      ...prevState,
      trackers: trackers
    }));
  }

  render() {
    const onChange = (objects, action) => {
      if (objects !== null && objects !== undefined && objects.length > 4) {
        objects.shift();
      }
      this.data.selectedCounties = objects;
    };

    return (
      <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1200px' }}>
        <p align='left'>Select up to 4 counties.</p>
        <div style={{ display: 'flex' }}>
          <Form style={{ display: 'flex' }}>
            <Select
              options={ this.data.groupedOptions }
              isMulti
              className='basic-multi-select'
              onChange= { onChange }
              isDisabled= { this.state.loading }
            />
            <Button variant='warning' type='submit' style={{ 'marginLeft': '10px' }} onClick={ this.submitPlot }>
              Plot!
            </Button>
          </Form>
        </div>
        { this.state.loading ?
            <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1000px', marginTop: '80px' }}>
              <Spinner animation='border' />
            </div> :
            ''
        }
        { (this.data.detailedInfo !== undefined && this.data.detailedInfo.caseCountSeries !== undefined && !this.state.loading) ?
          <div>
            <div style={{ marginTop: '30px' }}>
              <p align='left'>
                * All data reflects situation accurately up till
                <span style={{ 'fontWeight': 'bold'}}> { this.state.validDate } 23:59:59 EST</span>
                <span style={{ 'fontStyle': 'italic' }}> (Last updated: { Formatter.getTimestamp(this.state.timestamp) })</span>
              </p>
            </div>
            <div style={{ display: 'flex', minWidth: '1200px' }}>
              <div style={{ 'marginTop': '30px', 'marginBottom': '10px' }}>
                { this.getCaseCountGraph() }
              </div>
              <div style={{ marginLeft: '30px', marginTop: '30px', marginBottom: '10px' }}>
                { this.getCaseCountIncreaseGraph() }
              </div>
            </div>
            <div style={{ display: 'flex', minWidth: '1200px' }}>
              <div style={{ 'marginTop': '30px', 'marginBottom': '10px' }}>
                { this.getDeathCountGraph() }
              </div>
              <div style={{ marginLeft: '30px', marginTop: '30px', marginBottom: '10px' }}>
                { this.getDeathCountIncreaseGraph() }
              </div>
            </div>
          </div> :
          ''
        }
      </div>
    );
  }
}

export default SearchByCounty;
