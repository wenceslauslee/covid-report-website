import Button from 'react-bootstrap/Button';
import { Component } from 'react';
import data from '../data/data.json';
import Form from 'react-bootstrap/Form';
import Formatter from '../utils/Formatter';
import Grapher from '../utils/Grapher';
import moment from 'moment';
import React from 'react';
import Select from 'react-select';
import { Spinner } from 'react-bootstrap';
import _ from 'lodash';

class SearchByState extends Component {
  constructor(props) {
    super(props);

    this.submitPlot = this.submitPlot.bind(this);
    this.handleTrackerChanged = this.handleTrackerChanged.bind(this);
    this.handleCheckerChanged = this.handleCheckerChanged.bind(this);

    this.state = {
      loading: false,
      trackers: [null, null, null, null, null, null],
      checkers: [false, true, true, false, false, false, false]
    };

    this.styles = {};
    this.data = {};
    this.series = {};
    this.stateCache = {};

    const stateValues = _.map(data.states, s => {
      return {
        label: s,
        value: s.toLowerCase()
      };
    });

    this.data.stateValues = stateValues;
    this.data.selectedStates = [];
  }

  componentDidMount() {}

  async submitPlot(event) {
    event.preventDefault();

    if (this.data.selectedStates.length === 0) {
      return;
    }

    this.setState(prevState => ({
      ...prevState,
      loading: true
    }));

    const promises = this.data.selectedStates.map(async stateObj => {
      return await this.submitState(stateObj);
    });
    this.data.allStates = await Promise.all(promises);

    this.prepareData();

    this.setState(prevState => ({
      ...prevState,
      loading: false
    }));
  }

  prepareData() {
    const stateColumns = ['time'];
    this.data.selectedStates.forEach(stateObj => {
      stateColumns.push(stateObj.label);
    });

    const legendColumns = ['time'];
    const colorColumns = ['#000000'];
    for (var i = 1; i < stateColumns.length; i++) {
      legendColumns.push(stateColumns[i].toLowerCase());
      colorColumns.push(Grapher.getColor(i - 1));
    }
    const keys = stateColumns.map(state => state.toLowerCase());
    const results = Grapher.combineAllData(this.data.allStates, keys, this.state.checkers[0]);

    this.data.keys = keys;
    this.data.columns = stateColumns;
    this.data.validDate = results.currentDate;
    this.data.timestamp = results.reportTimestamp;
    this.data.series = results.series;
    this.data.max = results.max;

    this.styles = {
      legendStyle: Grapher.getLegendStyle(legendColumns, colorColumns),
      lineStyle: Grapher.getLineStyle(colorColumns, keys),
      axisStyle: Grapher.getAxisStyle()
    };
  }

  submitState(stateObj) {
    const stateSanitized = encodeURIComponent(stateObj.value);

    if (!Object.prototype.hasOwnProperty.call(this.stateCache, stateSanitized) ||
        moment() - moment(this.stateCache[stateSanitized].reportTimestamp) >= 600000) {
      return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=state&key=${stateSanitized}`)
        .then(res => res.json())
        .then(rdata => {
          const results = {
            dataPoints: rdata.dataPoints,
            currentDate: rdata.currentDate,
            reportTimestamp: rdata.reportTimestamp,
            detailedInfo: rdata.detailedInfo
          };
          this.stateCache[stateSanitized] = results;

          return results;
        })
        .catch(err => {
          console.log(err);
        });
    }

    return this.stateCache[stateSanitized];
  }

  getCaseCountGraph() {
    return Grapher.getGraph(
      this.data.keys, this.data.columns, 'Case Count', this.data.series[0], this.data.max[0], this.state.trackers[0],
      tracker => this.handleTrackerChanged(tracker, 0), this.styles);
  }

  getDeathCountGraph() {
    return Grapher.getGraph(
      this.data.keys, this.data.columns, 'Death Count', this.data.series[1], this.data.max[1], this.state.trackers[1],
      tracker => this.handleTrackerChanged(tracker, 1), this.styles);
  }

  getCaseCountIncreaseGraph() {
    return Grapher.getGraph(
      this.data.keys, this.data.columns, 'Case Count Daily Increase', this.data.series[2], this.data.max[2],
      this.state.trackers[2], tracker => this.handleTrackerChanged(tracker, 2), this.styles);
  }

  getDeathCountIncreaseGraph() {
    return Grapher.getGraph(
      this.data.keys, this.data.columns, 'Death Count Daily Increase', this.data.series[3], this.data.max[3],
      this.state.trackers[3], tracker => this.handleTrackerChanged(tracker, 3), this.styles);
  }

  getCaseCountAverageIncreaseGraph() {
    return Grapher.getGraph(
      this.data.keys, this.data.columns, 'Case Count Daily Increase 7-Day Average', this.data.series[4],
      this.data.max[4], this.state.trackers[4], tracker => this.handleTrackerChanged(tracker, 4), this.styles);
  }

  getDeathCountAverageIncreaseGraph() {
    return Grapher.getGraph(
      this.data.keys, this.data.columns, 'Death Count Daily Increase 7-Day Average', this.data.series[5],
      this.data.max[5], this.state.trackers[5], tracker => this.handleTrackerChanged(tracker, 5), this.styles);
  }

  handleTrackerChanged(tracker, index) {
    const trackers = this.state.trackers;
    trackers[index] = tracker;

    this.setState(prevState => ({
      ...prevState,
      trackers: trackers
    }));
  }

  handleCheckerChanged(index) {
    const current = this.state.checkers;
    current[index] = !current[index];

    if (index === 0 && this.data.allStates !== undefined) {
      this.prepareData();
    }

    this.setState(prevState => ({
      ...prevState,
      checkers: current
    }));
  }

  render() {
    const onChange = (objects, action) => {
      if (objects !== null && objects !== undefined && objects.length > 4) {
        objects.shift();
      }
      this.data.selectedStates = objects;
    };

    return (
      <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1200px' }}>
        <div style={{ display: 'flex' }}>
          <p align='left'>Select up to 4 states.</p>
        </div>
        <div style={{ display: 'flex', marginBottom: '10px' }}>
          <Form.Check type='checkbox' label='Per 100K population'
              checked={ this.state.checkers[0] } onChange={ () => this.handleCheckerChanged(0) } />
          <Form.Check type='checkbox' style={{ marginLeft: '10px' }} label='Case Count'
              checked={ this.state.checkers[1] } onChange={ () => this.handleCheckerChanged(1) } />
          <Form.Check type='checkbox' style={{ marginLeft: '10px' }} label='Death Count'
              checked={ this.state.checkers[2] } onChange={ () => this.handleCheckerChanged(2) } />
          <Form.Check type='checkbox' style={{ marginLeft: '10px' }} label='Case Increase'
              checked={ this.state.checkers[3] } onChange={ () => this.handleCheckerChanged(3) } />
          <Form.Check type='checkbox' style={{ marginLeft: '10px' }} label='Death Increase'
              checked={ this.state.checkers[4] } onChange={ () => this.handleCheckerChanged(4) } />
          <Form.Check type='checkbox' style={{ marginLeft: '10px' }} label='Case 7-Day Average Increase'
              checked={ this.state.checkers[5] } onChange={ () => this.handleCheckerChanged(5) } />
          <Form.Check type='checkbox' style={{ marginLeft: '10px' }} label='Death 7-Day Average Increase'
              checked={ this.state.checkers[6] } onChange={ () => this.handleCheckerChanged(6) } />
        </div>
        <div style={{ display: 'flex' }}>
          <Form style={{ display: 'flex' }}>
            <Select
              options={ this.data.stateValues }
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
        { (this.data.series !== undefined && !this.state.loading) ?
          <div>
            <div style={{ marginTop: '30px' }}>
              <p align='left'>
                * All data reflects situation accurately up till
                <span style={{ 'fontWeight': 'bold'}}> { this.data.validDate } 23:59:59 EST</span>
                <span style={{ 'fontStyle': 'italic' }}> (Last updated: { Formatter.getTimestamp(this.data.timestamp) })</span>
              </p>
            </div>
            { Grapher.alignGraphs(this.state.checkers, this.getCaseCountGraph(), this.getDeathCountGraph(),
                this.getCaseCountIncreaseGraph(), this.getDeathCountIncreaseGraph(),
                this.getCaseCountAverageIncreaseGraph(), this.getDeathCountAverageIncreaseGraph()) }
          </div> :
          ''
        }
      </div>
    );
  }
}

export default SearchByState;
