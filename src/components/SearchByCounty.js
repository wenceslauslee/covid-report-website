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

const countyCache = {};

class SearchByCounty extends Component {
  constructor() {
    super();
    this.state = {
      groupedOptions: [],
      selectedCounties: [],
      showTables: false,
      loading: false,
      columns: [],
      validDate: '',
      timestamp: '',
      caseCountDataPoints: [],
      caseCountMax: 0,
      caseCountTracker: null,
      caseCountIncreaseDataPoints: [],
      caseCountIncreaseMax: 0,
      caseCountIncreaseTracker: null,
      deathCountDataPoints: [],
      deathCountMax: 0,
      deathCountTracker: null,
      deathCountIncreaseDataPoints: [],
      deathCountIncreaseMax: 0,
      deathCountIncreaseTracker: null,
      legendStyle: {}
    };

    this.submitPlot = this.submitPlot.bind(this);
    this.handleTrackerChanged1 = this.handleTrackerChanged1.bind(this);
    this.handleTrackerChanged2 = this.handleTrackerChanged2.bind(this);
    this.handleTrackerChanged3 = this.handleTrackerChanged3.bind(this);
    this.handleTrackerChanged4 = this.handleTrackerChanged4.bind(this);
  }

  async componentDidMount() {
    await fetch('https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/rank?infoKey=stateToCounty')
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

        this.setState(prevState => ({
          ...prevState,
          groupedOptions: groupedOptions,
          selectedCounties: []
        }));
      })
      .catch(err => {
        console.log(err);
      });
  }

  async submitPlot(event) {
    event.preventDefault();

    if (this.state.selectedCounties.length === 0) {
      return;
    }

    this.setState(prevState => ({
      ...prevState,
      loading: true
    }));

    const promises = this.state.selectedCounties.map(async countyObj => {
      return await this.submitCounty(countyObj);
    });
    const allCounties = await Promise.all(promises);

    const results = Grapher.combineData(allCounties);
    const countyColumns = ['time'];
    this.state.selectedCounties.forEach(countyObj => {
      countyColumns.push(countyObj.label);
    });

    const legendColumns = ['time'];
    const colorColumns = ['#000000'];
    for (var i = 1; i < countyColumns.length; i++) {
      legendColumns.push(countyColumns[i].toLowerCase());
      colorColumns.push(Grapher.getColor(i - 1));
    }

    this.setState(prevState => ({
      ...prevState,
      loading: false,
      showTables: true,
      columns: countyColumns,
      validDate: results.currentDate,
      timestamp: results.reportTimestamp,
      caseCountDataPoints: results.caseCount,
      caseCountMax: results.caseCountMax,
      caseCountIncreaseDataPoints: results.caseCountIncrease,
      caseCountIncreaseMax: results.caseCountIncreaseMax,
      deathCountDataPoints: results.deathCount,
      deathCountMax: results.deathCountMax,
      deathCountIncreaseDataPoints: results.deathCountIncrease,
      deathCountIncreaseMax: results.deathCountIncreaseMax,
      legendStyle: Grapher.getLegendStyle(legendColumns, colorColumns)
    }));
  }

  submitCounty(countyObj) {
    const countySanitized = encodeURIComponent(countyObj.value);

    if (!Object.prototype.hasOwnProperty.call(countyCache, countySanitized) ||
        moment() - moment(countyCache[countySanitized].reportTimestamp) >= 600000) {
      return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=county&key=${countySanitized}`)
        .then(res => res.json())
        .then(rdata => {
          const results = {
            dataPoints: rdata.dataPoints,
            currentDate: rdata.currentDate,
            reportTimestamp: rdata.reportTimestamp
          };
          countyCache[countySanitized] = results;

          return results;
        })
        .catch(err => {
          console.log(err);
        });
    }

    return countyCache[countySanitized];
  }

  getCaseCountGraph() {
    return Grapher.getGraph(
      this.state, 'CaseCount', 'Case Count', this.state.caseCountDataPoints, this.state.caseCountTracker,
      this.handleTrackerChanged1, this.state.caseCountMax);
  }

  getCaseCountIncreaseGraph() {
    return Grapher.getGraph(
      this.state, 'CaseCountDailyIncrease', 'Case Count Daily Increase', this.state.caseCountIncreaseDataPoints,
      this.state.caseCountIncreaseTracker, this.handleTrackerChanged2, this.state.caseCountIncreaseMax);
  }

  getDeathCountGraph() {
    return Grapher.getGraph(
      this.state, 'DeathCount', 'Death Count', this.state.deathCountDataPoints, this.state.deathCountTracker,
      this.handleTrackerChanged3, this.state.deathCountMax);
  }

  getDeathCountIncreaseGraph() {
    return Grapher.getGraph(
      this.state, 'DeathCountDailyIncrease', 'Death Count Daily Increase', this.state.deathCountIncreaseDataPoints,
      this.state.deathCountIncreaseTracker, this.handleTrackerChanged4, this.state.deathCountIncreaseMax);
  }

  handleTrackerChanged1(tracker) {
    this.setState(prevState => ({
      ...prevState,
      caseCountTracker: tracker,
    }));
  }

  handleTrackerChanged2(tracker) {
    this.setState(prevState => ({
      ...prevState,
      caseCountIncreaseTracker: tracker,
    }));
  }

  handleTrackerChanged3(tracker) {
    this.setState(prevState => ({
      ...prevState,
      deathCountTracker: tracker,
    }));
  }

  handleTrackerChanged4(tracker) {
    this.setState(prevState => ({
      ...prevState,
      deathCountIncreaseTracker: tracker,
    }));
  }

  render() {
    const onChange = (objects, action) => {
      if (objects !== null && objects !== undefined && objects.length > 4) {
        objects.shift();
      }

      this.setState(prevState => ({
        ...prevState,
        selectedCounties: objects,
      }));
    };

    return (
      <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1200px' }}>
        <p align='left'>Select up to 4 counties.</p>
        <div style={{ display: 'flex' }}>
          <Form style={{ display: 'flex' }}>
            <Select
              options={ this.state.groupedOptions }
              isMulti
              className='basic-multi-select'
              onChange= { onChange }
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
        { (this.state.showTables && !this.state.loading) ?
          <div style={{ marginTop: '30px' }}>
            <p align='left'>
              * All data reflects situation accurately up till
              <span style={{ 'fontWeight': 'bold'}}> { this.state.validDate } 23:59:59 EST</span>
              <span style={{ 'fontStyle': 'italic' }}> (Last updated: { Formatter.getTimestamp(this.state.timestamp) })</span>
            </p>
          </div> :
          ''
        }
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
      </div>
    );
  }
}

export default SearchByCounty;
