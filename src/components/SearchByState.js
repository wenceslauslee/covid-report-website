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

const legend = [
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
];

class SearchByState extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateValues: [],
      selectedStates: [],
      caseCountDataPoints: [],
      deathCountDataPoints: [],
      dailyIncreaseDataPoints: [],
      caseCountMax: 1000,
      deathCountMax: 1000,
      dailyIncreaseMax: 1000,
      loading: false
    };
  }

  componentDidMount() {
    const stateValuesModified = _.map(data.states, s => {
      return {
        label: s,
        value: s.toLowerCase()
      };
    });

    this.setState({
      stateValues: stateValuesModified,
      selectedStates: []
    });
  }

  getCaseCountGraph() {
    const series = new TimeSeries(
      {
        name: "CaseCount",
        columns: ["time"],
        points: this.state.caseCountDataPoints
      }
    );

    return (
      <div>
        <ChartContainer title='Case/Death Counts and Daily Case Increases' timeRange={ series.range() }
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
          <Legend type="line" style={ style } categories={ legend } align='right' stack={ false }/>
        </div>
      </div>
    );
  }

  getDeathCountGraph() {
    const series = new TimeSeries(
      {
        name: "DeathCount",
        columns: ["time", "cases", "deaths", "increase"],
        points: this.state.deathCountDataPoints
      }
    );

    return (
      <div>
        <ChartContainer title='Case/Death Counts and Daily Case Increases' timeRange={ series.range() }
          width={ 400 } showGrid={ true } titleStyle={{ fill: '#000000', fontWeight: 500 }} timeAxisStyle={ darkAxis }
          minTime={ series.range().begin() } maxTime={ series.range().end() } timeAxisTickCount={ 10 }
          onBackgroundClick={ () => this.setSelection(null) } onTrackerChanged={ this.handleTrackerChanged }>
          <TimeAxis format="day"/>
          <ChartRow height='400'>
            <YAxis id="y" label="Count" min={ 0 } max={ this.state.dataMax } width="60" type="linear" showGrid
              style={ darkAxis } />
             <Charts>
              <LineChart axis="y" series={ series } columns={ ['cases', 'deaths'] } style={ style }
                interpolation='curveBasis' selection={ this.state.selection } onSelectionChange={ this.setSelection }/>
            </Charts>
          </ChartRow>
        </ChartContainer>
        <div style={{ justifyContent: 'flex-end' }}>
          <Legend type="line" style={ style } categories={ legend } align='right' stack={ false }
            selection={ this.state.selection } onSelectionChange={ this.setSelection }/>
        </div>
      </div>
    );
  }

  getDailyIncreaseGraph() {
    const series = new TimeSeries(
      {
        name: "CovidStats",
        columns: ["time", "cases", "deaths", "increase"],
        points: this.state.dailyIncreaseDataPoints
      }
    );

    return (
      <div>
        <ChartContainer title='Case/Death Counts and Daily Case Increases' timeRange={ series.range() }
          width={ 400 } showGrid={ true } titleStyle={{ fill: '#000000', fontWeight: 500 }} timeAxisStyle={ darkAxis }
          minTime={ series.range().begin() } maxTime={ series.range().end() } timeAxisTickCount={ 10 }
          onBackgroundClick={ () => this.setSelection(null) } onTrackerChanged={ this.handleTrackerChanged }>
          <TimeAxis format="day"/>
          <ChartRow height='400'>
            <YAxis id="y" label="Count" min={ 0 } max={ this.state.dataMax } width="60" type="linear" showGrid
              style={ darkAxis } />
             <Charts>
              <LineChart axis="y" series={ series } columns={ ['cases', 'deaths'] } style={ style }
                interpolation='curveBasis' selection={ this.state.selection } onSelectionChange={ this.setSelection }/>
            </Charts>
          </ChartRow>
        </ChartContainer>
        <div style={{ justifyContent: 'flex-end' }}>
          <Legend type="line" style={ style } categories={ legend } align='right' stack={ false }
            selection={ this.state.selection } onSelectionChange={ this.setSelection }/>
        </div>
      </div>
    );
  }

  async submitPlot(event) {
    event.preventDefault();

    const state = encodeURIComponent(this.state.stateValueInput1);
    this.setState(prevState => ({
      ...prevState,
      loading: true
    }));
    return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=state&key=${state}`)
      .then(res => res.json())
      .then(rdata => {
        const tableData = this.getTableData(rdata);

        this.setState(prevState => ({
          ...prevState,
          postalCodeErrorMessage: '',
          showTable: true,
          tableInfo: tableData,
          countyStateName: `${rdata.stateNameFullProper}`,
          date: `As of: ${rdata.currentDate} 23:59:59 PM EST`,
          dataPoints: rdata.dataPoints,
          dataMax: this.getMaxValue(rdata.dataPoints),
          loading: false
        }));
      })
      .catch(err => {
        console.log(err);
      });
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
            { this.getDeathCountGraph() }
          </div>
          <div style={{ marginLeft: '30px', marginTop: '30px', marginBottom: '10px' }}>
            { this.getDailyIncreaseGraph() }
          </div>
        </div>
      </div>
    );
  }
}

export default SearchByState;
