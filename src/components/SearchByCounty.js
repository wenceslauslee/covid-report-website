import Button from 'react-bootstrap/Button';
import { Charts, ChartContainer, ChartRow, YAxis, LineChart, Legend, TimeAxis, styler } from "react-timeseries-charts";
import { Component } from 'react';
import data from '../data/data.json';
import React from 'react';
import Select from 'react-select';
import { Spinner } from 'react-bootstrap';
import { TimeSeries } from 'pondjs';
import _ from 'lodash';

const darkAxis = {
  label: {
      stroke: "none",
      fill: "#000000",
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

const countyCache = {};

class SearchByCounty extends Component {
  constructor() {
    super();
    this.state = {
      groupedOptions: [],
      selectedCounties: []
    };
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

        console.log(groupedOptions);
        this.setState({
          groupedOptions: groupedOptions,
          selectedCounties: []
        });
      })
      .catch(err => {
        console.log(err);
      });
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
    })

    this.setState(prevState => ({
      ...prevState,
      loading: false,
      showTables: true,
      columns: stateColumns,
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

  submitState(stateObj) {
    const stateSanitized = encodeURIComponent(stateObj.value);

    if (!Object.prototype.hasOwnProperty.call(countyCache, stateSanitized)) {
      return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=state&key=${stateSanitized}`)
        .then(res => res.json())
        .then(rdata => {
          countyCache[stateSanitized] = rdata.dataPoints;

          return rdata.dataPoints;
        })
        .catch(err => {
          console.log(err);
        });
    }

    return countyCache[stateSanitized];
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

    for (var index in allStates[0]) {
      caseCount.push([allStates[0][index][0]]);
      caseCountIncrease.push([allStates[0][index][0]]);
      deathCount.push([allStates[0][index][0]]);
      deathCountIncrease.push([allStates[0][index][0]]);
    }

    for (var i = 0; i < allStates.length; i++) {
      for (var j = 0; j < allStates[i].length; j++) {
        caseCountMax = Math.max(caseCountMax, allStates[i][j][1]);
        caseCount[j].push(allStates[i][j][1]);
        deathCountMax = Math.max(deathCountMax, allStates[i][j][2]);
        deathCount[j].push(allStates[i][j][2]);
        caseCountIncreaseMax = Math.max(caseCountIncreaseMax, allStates[i][j][3]);
        caseCountIncrease[j].push(allStates[i][j][3]);
        deathCountIncreaseMax = Math.max(deathCountIncreaseMax, allStates[i][j][4]);
        deathCountIncrease[j].push(allStates[i][j][4]);
      }
    }

    results.caseCount = caseCount;
    results.caseCountMax = Math.round(caseCountMax * 1.05);
    results.caseCountIncrease = caseCountIncrease;
    results.caseCountIncreaseMax = Math.round(caseCountIncreaseMax * 1.05);
    results.deathCount = deathCount;
    results.deathCountMax = Math.round(deathCountMax * 1.05);
    results.deathCountIncrease = deathCountIncrease;
    results.deathCountIncreaseMax = Math.round(deathCountIncreaseMax * 1.05);
    return results;
  }

  getColor(order) {
    const colors = ['ff0000', '006400', 'B8860B', '4B0082'];

    return colors[order];
  }

  getGraph(seriesName, titleName, seriesDataPoints, tracker, handleTrackerChanged, dataMax) {
    if (this.state.showTables && !this.state.loading) {
      const lowerCaseColumns = this.state.columns.map(state => state.toLowerCase());
      const series = new TimeSeries(
        {
          name: seriesName,
          columns: lowerCaseColumns,
          points: seriesDataPoints
        }
      );

      let dateValue;
      const stateLegendValues = [];
      if (tracker) {
        const index = series.bisect(tracker);
        const trackerEvent = series.at(index);
        const utcDate = trackerEvent.timestamp();
        dateValue = `${utcDate.getFullYear()}-${('0' + (utcDate.getMonth() + 1)).slice(-2)}-${('0' +
          utcDate.getDate()).slice(-2)}`;

        for (var i = 1; i < lowerCaseColumns.length; i++) {
          stateLegendValues.push(`${trackerEvent.get(lowerCaseColumns[i])}`);
        }
      }

      const legend = [];
      var style = [];
      const yColumns = [];

      legend.push({
        key: 'time',
        label: 'Date',
        value: dateValue
      });
      style.push({
        key: 'time',
        color: '0000ff',
        width: 1
      });

      for (var j = 1; j < this.state.columns.length; j++) {
        legend.push({
          key: lowerCaseColumns[j],
          label: this.state.columns[j],
          value: stateLegendValues[j - 1]
        });
        style.push({
          key: lowerCaseColumns[j],
          color: this.getColor(j),
          width: 1
        });
        yColumns.push(lowerCaseColumns[j]);
      }
      style = styler(style);

      return (
        <div>
          <ChartContainer title={ titleName } timeRange={ series.range() }
            width={ 600 } showGrid={ true } titleStyle={{ fill: '#000000', fontWeight: 500 }} timeAxisStyle={ darkAxis }
            minTime={ series.range().begin() } maxTime={ series.range().end() } timeAxisTickCount={ 10 }
            onTrackerChanged={ handleTrackerChanged }>
            <TimeAxis format="day"/>
            <ChartRow height='400'>
              <YAxis id="y" label="Count" min={ 0 } max={ dataMax } width="60" type="linear" showGrid
                style={ darkAxis } />
               <Charts>
                <LineChart axis="y" series={ series } columns={ yColumns } style={ style }
                  interpolation='curveBasis'/>
              </Charts>
            </ChartRow>
          </ChartContainer>
          <div style={{ justifyContent: 'flex-end' }}>
            <Legend type="line" style={ style } categories={ legend } align='right' stack={ false }/>
          </div>
        </div>
      );
    }

    return null;
  }

  getCaseCountGraph() {
    return this.getGraph(
      'CaseCount', 'Case Count', this.state.caseCountDataPoints, this.state.caseCountTracker,
      this.handleTrackerChanged1, this.state.caseCountMax);
  }

  getCaseCountIncreaseGraph() {
    return this.getGraph(
      'CaseCountDailyIncrease', 'Case Count Daily Increase', this.state.caseCountIncreaseDataPoints,
      this.state.caseCountIncreaseTracker, this.handleTrackerChanged2, this.state.caseCountIncreaseMax);
  }

  getDeathCountGraph() {
    return this.getGraph(
      'DeathCount', 'Death Count', this.state.deathCountDataPoints, this.state.deathCountTracker,
      this.handleTrackerChanged3, this.state.deathCountMax);
  }

  getDeathCountIncreaseGraph() {
    return this.getGraph(
      'DeathCountDailyIncrease', 'Death Count Daily Increase', this.state.deathCountIncreaseDataPoints,
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
        <p align="left">Select up to 4 counties.</p>
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
        { this.state.loading ?
            <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1000px', marginTop: '80px' }}>
              <Spinner animation="border" />
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
