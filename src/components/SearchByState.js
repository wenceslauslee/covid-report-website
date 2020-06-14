import Button from 'react-bootstrap/Button';
import { Charts, ChartContainer, ChartRow, YAxis, LineChart, Legend, TimeAxis, styler } from "react-timeseries-charts";
import { Component } from 'react';
import data from '../data/data.json';
import React from 'react';
import Select from 'react-select';
import { Spinner } from 'react-bootstrap';
import { TimeSeries } from 'pondjs';
import _ from 'lodash';

const style = styler([
  { key: "time", color: "#0000ff", width: 1 },
  { key: "cases", color: "#0000ff", width: 1 },
  { key: "deaths", color: "#ff0000", width: 1 },
  { key: "increase", color: "#ff0000", width: 1 }
]);

const darkAxis = {
  label: {
      stroke: "none",
      fill: "#000000", // Default label color
      fontWeight: 200,
      fontSize: 14,
      font: '"Goudy Bookletter 1911", sans-serif"'
  },
  values: {
      stroke: "none",
      fill: "#000000",
      fontWeight: 100,
      fontSize: 11,
      font: '"Goudy Bookletter 1911", sans-serif"'
  },
  ticks: {
      fill: "none",
      stroke: "#000000",
      opacity: 0.2
  },
  axis: {
      fill: "none",
      stroke: "#000000",
      opacity: 0.25
  }
};

/*const legend = [
  {
    key: 'time',
    label: 'Date',
    value: dateValue
  },
  {
    key: 'cases',
    label: 'Case Counts',
    value: caseValue
  },
  {
    key: 'deaths',
    label: 'Death Counts',
    value: deathValue
  },
  {
    key: 'increase',
    label: 'Daily Increase',
    value: increaseValue
  }
];*/

const stateCache = {};

class SearchByState extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateValues: [],
      selectedStates: [],
      showTables: false,
      loading: false,
      caseCountDataPoints: [],
      caseCountMax: 0
    };

    this.submitPlot = this.submitPlot.bind(this);
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
    console.log(results);

    this.setState(prevState => ({
      ...prevState,
      loading: false,
      showTables: true,
      caseCountDataPoints: results.caseCounts,
      caseCountMax: results.caseCountMax
    }));
  }

  submitState(stateObj) {
    const stateSanitized = encodeURIComponent(stateObj.value);

    if (!Object.prototype.hasOwnProperty.call(stateCache, stateSanitized)) {
      return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=state&key=${stateSanitized}`)
        .then(res => res.json())
        .then(rdata => {
          stateCache[stateSanitized] = rdata.dataPoints;

          return rdata.dataPoints;
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

    for (var index in allStates[0]) {
      caseCount.push([allStates[0][index][0]]);
    }

    for (var i = 0; i < allStates.length; i++) {
      for (var j = 0; j < allStates[i].length; j++) {
        caseCountMax = Math.max(caseCountMax, allStates[i][1]);
        caseCount[j].push(allStates[i][1]);
      }
    }

    results.caseCount = caseCount;
    results.caseCountMax = Math.round(caseCountMax * 1.05);
    return results;
  }

  getCaseCountGraph() {
    if (this.state.showTable && !this.state.loading) {
      const series = new TimeSeries(
        {
          name: "CaseCount",
          columns: ["time"],
          points: this.state.caseCountDataPoints
        }
      );

      return (
        <div>
          <ChartContainer title='Case Counts' timeRange={ series.range() }
            width={ 400 } showGrid={ true } titleStyle={{ fill: '#000000', fontWeight: 500 }} timeAxisStyle={ darkAxis }
            minTime={ series.range().begin() } maxTime={ series.range().end() } timeAxisTickCount={ 10 }
            onTrackerChanged={ this.handleTrackerChanged }>
            <TimeAxis format="day"/>
            <ChartRow height='400'>
              <YAxis id="y" label="Count" min={ 0 } max={ this.state.caseCountMax } width="60" type="linear" showGrid
                style={ darkAxis } />
               <Charts>
                <LineChart axis="y" series={ series } columns={ [] } style={ style }
                  interpolation='curveBasis'/>
              </Charts>
            </ChartRow>
          </ChartContainer>
          <div style={{ justifyContent: 'flex-end' }}>

          </div>
        </div>
      );
    }

    return null;
  }
  // <Legend type="line" style={ style } categories={ legend } align='right' stack={ false }/>

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
        <p align="left">Select up to 4 states.</p>
        <div style={{ display: "flex" }}>
          <form>
            <Select
              options={ this.state.stateValues }
              isMulti
              className="basic-multi-select"
              onChange= { onChange }
            />
          </form>
          <Button variant="warning" style={{ 'margin-left': '10px' }} onClick={ this.submitPlot }>Plot!</Button>
        </div>
        <div style={{ display: 'flex', minWidth: '1200px' }}>
          <div style={{ 'marginTop': '30px', 'marginBottom': '10px' }}>
            { this.getCaseCountGraph() }
          </div>
          <div style={{ marginLeft: '30px', marginTop: '30px', marginBottom: '10px' }}>
            { this.getCaseCountGraph() }
          </div>
          <div style={{ marginLeft: '30px', marginTop: '30px', marginBottom: '10px' }}>
            { this.getCaseCountGraph() }
          </div>
        </div>
      </div>
    );
  }
}

export default SearchByState;
