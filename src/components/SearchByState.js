import Button from 'react-bootstrap/Button';
import { Component } from 'react';
import data from '../data/data.json';
import Form from 'react-bootstrap/Form';
import Formatter from '../utils/Formatter';
import Grapher from '../utils/Grapher';
import React from 'react';
import Select from 'react-select';
import { Spinner } from 'react-bootstrap';
import _ from 'lodash';

const stateCache = {};

class SearchByState extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateValues: [],
      selectedStates: [],
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

  componentDidMount() {
    const stateValuesModified = _.map(data.states, s => {
      return {
        label: s,
        value: s.toLowerCase()
      };
    });

    this.setState(prevState => ({
      ...prevState,
      stateValues: stateValuesModified,
      selectedStates: []
    }));
  }

  async submitPlot(event) {
    event.preventDefault();

    if (this.state.selectedStates.length === 0) {
      return;
    }

    this.setState(prevState => ({
      ...prevState,
      loading: true
    }));

    const promises = this.state.selectedStates.map(async stateObj => {
      return await this.submitState(stateObj);
    });
    const allStates = await Promise.all(promises);

    const results = this.combineDataAcrossStates(allStates);
    const stateColumns = ['time'];
    this.state.selectedStates.forEach(stateObj => {
      stateColumns.push(stateObj.label);
    });

    const legendColumns = ['time'];
    const colorColumns = ['#000000'];
    for (var i = 1; i < stateColumns.length; i++) {
      legendColumns.push(stateColumns[i].toLowerCase());
      colorColumns.push(Grapher.getColor(i - 1));
    }

    this.setState(prevState => ({
      ...prevState,
      loading: false,
      showTables: true,
      columns: stateColumns,
      validDate: allStates[0].currentDate,
      timestamp: allStates[0].reportTimestamp,
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

  submitState(stateObj) {
    const stateSanitized = encodeURIComponent(stateObj.value);

    if (!Object.prototype.hasOwnProperty.call(stateCache, stateSanitized)) {
      return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=state&key=${stateSanitized}`)
        .then(res => res.json())
        .then(rdata => {
          const results = {
            dataPoints: rdata.dataPoints,
            currentDate: rdata.currentDate,
            reportTimestamp: rdata.reportTimestamp
          };
          stateCache[stateSanitized] = results;

          return results;
        })
        .catch(err => {
          console.log(err);
        });
    }

    return stateCache[stateSanitized];
  }

  combineDataAcrossStates(allStates) {
    const results = {};
    const caseCount = [];
    var caseCountMax = 0;
    const caseCountIncrease = [];
    var caseCountIncreaseMax = 0;
    const deathCount = [];
    var deathCountMax = 0;
    const deathCountIncrease = [];
    var deathCountIncreaseMax = 0;

    for (var index in allStates[0].dataPoints) {
      caseCount.push([(allStates[0].dataPoints)[index][0]]);
      caseCountIncrease.push([(allStates[0].dataPoints)[index][0]]);
      deathCount.push([(allStates[0].dataPoints)[index][0]]);
      deathCountIncrease.push([(allStates[0].dataPoints)[index][0]]);
    }

    for (var i = 0; i < allStates.length; i++) {
      for (var j = 0; j < allStates[i].dataPoints.length; j++) {
        caseCountMax = Math.max(caseCountMax, (allStates[i].dataPoints)[j][1]);
        caseCount[j].push((allStates[i].dataPoints)[j][1]);
        deathCountMax = Math.max(deathCountMax, (allStates[i].dataPoints)[j][2]);
        deathCount[j].push((allStates[i].dataPoints)[j][2]);
        caseCountIncreaseMax = Math.max(caseCountIncreaseMax, (allStates[i].dataPoints)[j][3]);
        caseCountIncrease[j].push((allStates[i].dataPoints)[j][3]);
        deathCountIncreaseMax = Math.max(deathCountIncreaseMax, (allStates[i].dataPoints)[j][4]);
        deathCountIncrease[j].push((allStates[i].dataPoints)[j][4]);
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
      currentState.selectedStates = objects;

      this.setState(currentState);
    };

    return (
      <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1200px' }}>
        <p align='left'>Select up to 4 states.</p>
        <div style={{ display: 'flex' }}>
          <Form style={{ display: 'flex' }}>
            <Select
              options={ this.state.stateValues }
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
              * Data reflects situation at
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

export default SearchByState;
