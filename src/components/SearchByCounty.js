import Button from 'react-bootstrap/Button';
import { Component } from 'react';
import Form from 'react-bootstrap/Form';
import Formatter from '../utils/Formatter';
import Grapher from '../utils/Grapher';
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

    const results = this.combineDataAcrossCounties(allCounties);
    const countyColumns = ['time'];
    this.state.selectedCounties.forEach(countyObj => {
      countyColumns.push(countyObj.label);
    })

    this.setState(prevState => ({
      ...prevState,
      loading: false,
      showTables: true,
      columns: countyColumns,
      caseCountDataPoints: results.caseCount,
      caseCountMax: results.caseCountMax,
      caseCountIncreaseDataPoints: results.caseCountIncrease,
      caseCountIncreaseMax: results.caseCountIncreaseMax,
      deathCountDataPoints: results.deathCount,
      deathCountMax: results.deathCountMax,
      deathCountIncreaseDataPoints: results.deathCountIncrease,
      deathCountIncreaseMax: results.deathCountIncreaseMax
    }));
  }

  submitCounty(countyObj) {
    const countySanitized = encodeURIComponent(countyObj.value);

    if (!Object.prototype.hasOwnProperty.call(countyCache, countySanitized)) {
      return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=county&key=${countySanitized}`)
        .then(res => res.json())
        .then(rdata => {
          countyCache[countySanitized] = rdata.dataPoints;

          return rdata.dataPoints;
        })
        .catch(err => {
          console.log(err);
        });
    }

    return countyCache[countySanitized];
  }

  combineDataAcrossCounties(allCounties) {
    const results = {};
    const caseCount = [];
    var caseCountMax = 0;
    const caseCountIncrease = [];
    var caseCountIncreaseMax = 0;
    const deathCount = [];
    var deathCountMax = 0;
    const deathCountIncrease = [];
    var deathCountIncreaseMax = 0;

    for (var index in allCounties[0]) {
      caseCount.push([allCounties[0][index][0]]);
      caseCountIncrease.push([allCounties[0][index][0]]);
      deathCount.push([allCounties[0][index][0]]);
      deathCountIncrease.push([allCounties[0][index][0]]);
    }

    for (var i = 0; i < allCounties.length; i++) {
      for (var j = 0; j < allCounties[i].length; j++) {
        caseCountMax = Math.max(caseCountMax, allCounties[i][j][1]);
        caseCount[j].push(allCounties[i][j][1]);
        deathCountMax = Math.max(deathCountMax, allCounties[i][j][2]);
        deathCount[j].push(allCounties[i][j][2]);
        caseCountIncreaseMax = Math.max(caseCountIncreaseMax, allCounties[i][j][3]);
        caseCountIncrease[j].push(allCounties[i][j][3]);
        deathCountIncreaseMax = Math.max(deathCountIncreaseMax, allCounties[i][j][4]);
        deathCountIncrease[j].push(allCounties[i][j][4]);
      }
    }

    results.caseCount = caseCount;
    results.caseCountMax = Formatter.getMaxValue(caseCountMax);
    results.caseCountIncrease = caseCountIncrease;
    results.caseCountIncreaseMax = Formatter.getMaxValue(caseCountIncreaseMax);
    results.deathCount = deathCount;
    results.deathCountMax = Formatter.getMaxValue(deathCountMax);
    results.deathCountIncrease = deathCountIncrease;
    results.deathCountIncreaseMax = Formatter.getMaxValue(deathCountIncreaseMax);
    return results;
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
      const currentState = this.state;
      if (objects !== null && objects !== undefined && objects.length > 4) {
        objects.shift();
      }
      currentState.selectedCounties = objects;

      this.setState(currentState);
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
            <Button variant='warning' type='submit' style={{ 'margin-left': '10px' }} onClick={ this.submitPlot }>
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
