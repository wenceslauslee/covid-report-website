import BootstrapTable from 'react-bootstrap-table-next';
import Button from 'react-bootstrap/Button';
import { BarChart, Charts, ChartContainer, ChartRow, YAxis, LineChart, Legend, TimeAxis, styler }
  from 'react-timeseries-charts';
import { Component } from 'react';
import data from '../data/data.json';
import Form from 'react-bootstrap/Form';
import Formatter from '../utils/Formatter';
import Grapher from '../utils/Grapher';
import React from 'react';
import Select from 'react-select';
import { Spinner } from 'react-bootstrap';
import { Index, TimeSeries } from 'pondjs';
import _ from 'lodash';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

class DetailedInfo extends Component {
  constructor(props) {
    super(props);

    this.onChangePostalCode = this.onChangePostalCode.bind(this);
    this.submitPostalCode = this.submitPostalCode.bind(this);
    this.onStateChange1 = this.onStateChange1.bind(this);
    this.submitState = this.submitState.bind(this);
    this.onStateChange2 = this.onStateChange2.bind(this);
    this.onCountyChange = this.onCountyChange.bind(this);
    this.submitStateCounty = this.submitStateCounty.bind(this);
    this.handleTrackerChanged = this.handleTrackerChanged.bind(this);

    this.state = {
      showTable: false,
      tableInfo: {},
      postalCodeValueInput: '',
      postalCodeErrorMessage: '',
      countyStateName: '',
      stateValues: [],
      stateValueInput1: '',
      stateValueInput2: '',
      countyValues: [],
      countyValueMap: {},
      countyValueInput: '',
      countyValueFips: '',
      date: '',
      timestamp: '',
      dataPoints: [],
      tracker: null,
      x: null,
      y: null,
      loading: false
    };

    const columns = ['time', 'cases', 'deaths', 'increase'];
    const columnColors = ['#000000', '#0000ff', '#ff0000', '#c4b8b7'];
    this.legendStyle = Grapher.getLegendStyle(columns, columnColors);
  }

  componentDidMount() {
    const stateValues = _.map(data.states, s => {
      return {
        label: s,
        value: s.toLowerCase()
      };
    });

    this.setState(prevState => ({
      ...prevState,
      stateValues: stateValues
    }));
  }

  onChangePostalCode(event) {
    const value = event.target.value;
    this.setState(prevState => ({
      ...prevState,
      postalCodeValueInput: value
    }));
  }

  onStateChange1(objects, action) {
    this.setState(prevState => ({
      ...prevState,
      stateValueInput1: objects.value
    }));
  };

  async submitPostalCode(event) {
    event.preventDefault();

    const postalCode = this.state.postalCodeValueInput;
    this.setState(prevState => ({
      ...prevState,
      loading: true
    }));
    return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=postal&key=${postalCode}`)
      .then(res => res.json())
      .then(rdata => {
        if (rdata.fips === null || rdata.fips === undefined) {
          this.setState(prevState => ({
            ...prevState,
            postalCodeErrorMessage: `'${postalCode}' is not a valid postal code.`,
            showTable: false,
            loading: false
          }));

          return;
        }

        const tableData = this.getTableData(rdata);

        this.setState(prevState => ({
          ...prevState,
          postalCodeErrorMessage: '',
          showTable: true,
          tableInfo: tableData,
          countyStateName: `${rdata.countyName}, ${rdata.stateNameFull}`,
          date: `As of: ${rdata.currentDate} 23:59:59 EST`,
          timestamp: rdata.reportTimestamp,
          dataPoints: rdata.dataPoints,
          loading: false
        }));
      })
      .catch(err => {
        console.log(err);
      });
  }

  onStateChange2(objects, action) {
    const stateName = encodeURIComponent(objects.value);

    return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/rank?infoKey=${stateName}`)
      .then(res => res.json())
      .then(rdata => {
        const countyValues = [];
        const countyValueMap = {};

        _.each(rdata.mappings, m => {
          countyValueMap[m.name.toLowerCase()] = m.fips;
          countyValues.push({
            label: m.name,
            value: m.name.toLowerCase()
          });
        });

        this.setState(prevState => ({
          ...prevState,
          stateValueInput2: objects.value,
          countyValues: countyValues,
          countyValueMap: countyValueMap,
          countyValueInput: null,
          countyValueFips: ''
        }));
      })
      .catch(err => {
        console.log(err);
      });
  };

  onCountyChange(objects, action) {
    this.setState(prevState => ({
      ...prevState,
      countyValueFips: this.state.countyValueMap[objects.value.toLowerCase()],
      countyValueInput: objects
    }));
  };

  async submitState(event) {
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
          date: `As of: ${rdata.currentDate} 23:59:59 EST`,
          timestamp: rdata.reportTimestamp,
          dataPoints: rdata.dataPoints,
          loading: false
        }));
      })
      .catch(err => {
        console.log(err);
      });
  }

  async submitStateCounty(event) {
    event.preventDefault();

    const fips = this.state.countyValueFips;
    this.setState(prevState => ({
      ...prevState,
      loading: true
    }));
    return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=county&key=${fips}`)
      .then(res => res.json())
      .then(rdata => {
        const tableData = this.getTableData(rdata);

        this.setState(prevState => ({
          ...prevState,
          postalCodeErrorMessage: '',
          showTable: true,
          tableInfo: tableData,
          countyStateName: `${rdata.countyName}, ${rdata.stateNameFull}`,
          date: `As of: ${rdata.currentDate} 23:59:59 EST`,
          timestamp: rdata.reportTimestamp,
          dataPoints: rdata.dataPoints,
          loading: false
        }));
      })
      .catch(err => {
        console.log(err);
      });
  }

  getTableData(rdata) {
    return [
      {
        key: 'Active case count',
        value: rdata.detailedInfo.activeCount
      },
      {
        key: 'Daily increase over past day',
        value: (rdata.detailedInfo.activeChange >= 0) ? `+${rdata.detailedInfo.activeChange}` : rdata.detailedInfo.activeChange
      },
      {
        key: 'Live increase since then',
        value: (rdata.detailedInfo.liveActiveChange >= 0) ? `+${rdata.detailedInfo.liveActiveChange}` : rdata.detailedInfo.liveActiveChange
      },
      {
        key: '% of population',
        value: `${rdata.detailedInfo.activePercentage}%`
      },
      {
        key: 'Rank in country',
        value: rdata.detailedInfo.activeRank
      },
      {
        key: 'Change in rank over past day',
        value: Formatter.modifyChangeRank(rdata.detailedInfo.activeRankPast - rdata.detailedInfo.activeRank)
      },
      {
        key: 'Death count',
        value: rdata.detailedInfo.deathCount
      },
      {
        key: 'Daily increase over past day',
        value: (rdata.detailedInfo.deathChange >= 0) ? `+${rdata.detailedInfo.deathChange}` : rdata.detailedInfo.deathChange
      },
      {
        key: 'Live increase since then',
        value: (rdata.detailedInfo.liveDeathChange >= 0) ? `+${rdata.detailedInfo.liveDeathChange}` : rdata.detailedInfo.liveDeathChange
      },
      {
        key: '% of population',
        value: `${rdata.detailedInfo.deathPercentage}%`
      },
      {
        key: 'Rank in country',
        value: rdata.detailedInfo.deathRank
      },
      {
        key: 'Change in rank over past day',
        value: Formatter.modifyChangeRank(rdata.detailedInfo.deathRankPast - rdata.detailedInfo.deathRank)
      }
    ];
  }

  getCellStyle(cell, row, rowIndex, colIndex) {
    if (row.key === 'Live increase since then') {
      return {
        color: '#ff0000',
        fontWeight: 'bold'
      };
    }

    return Formatter.getCellStyle(cell, row, rowIndex, colIndex);
  }

  getDetailedTable() {
    if (this.state.showTable && !this.state.loading) {
      const columns = [
        {
          dataField: 'key',
          text: this.state.date
        },
        {
          dataField: 'value',
          text: this.state.countyStateName,
          style: this.getCellStyle
        }
      ];

      return <div>
        <p align='left'>
          <span style={{ 'fontStyle': 'italic', 'fontWeight': 'bold' }}>
            (Last updated: { Formatter.getTimestamp(this.state.timestamp) })
          </span>
        </p>
        <BootstrapTable bootstrap4={ true } keyField='detailed-table' data={ this.state.tableInfo } columns={ columns }>
        </BootstrapTable>
      </div>
    }

    return null;
  }

  getDetailedGraph() {
    if (this.state.showTable && !this.state.loading) {
      const series = new TimeSeries(
        {
          name: 'CovidStats',
          columns: ['time', 'cases', 'deaths', 'increase'],
          points: this.state.dataPoints
        }
      );
      const timeSeries = new TimeSeries(
        {
          name: 'CovidStatsBar',
          columns: ['index', 'increase'],
          points: _.map(this.state.dataPoints, d => {
            return [Index.getIndexString('1d', d[0]), d[3]];
          })
        }
      );
      const style = styler([
        { key: 'time', color: '#0000ff', width: 1 },
        { key: 'cases', color: '#0000ff', width: 2 },
        { key: 'deaths', color: '#ff0000', width: 2 },
        { key: 'increase', color: '#c4b8b7', width: 2 },
      ]);
      const darkAxis = {
        label: {
            stroke: 'none',
            fill: '#000000', // Default label color
            fontWeight: 200,
            fontSize: 14,
            font: 'Goudy Bookletter 1911\', sans-serif'
        },
        values: {
            stroke: 'none',
            fill: '#000000',
            fontWeight: 100,
            fontSize: 11,
            font: 'Goudy Bookletter 1911\', sans-serif'
        },
        ticks: {
            fill: 'none',
            stroke: '#000000',
            opacity: 0.2
        },
        axis: {
            fill: 'none',
            stroke: '#000000',
            opacity: 0.25
        }
      };

      let dateValue, caseValue, deathValue, increaseValue;
      if (this.state.tracker) {
        const index = series.bisect(this.state.tracker);
        const trackerEvent = series.at(index);
        const utcDate = trackerEvent.timestamp();
        dateValue = `${utcDate.getFullYear()}-${('0' + (utcDate.getMonth() + 1)).slice(-2)}-${('0' + utcDate.getDate()).slice(-2)}`;
        caseValue = `${trackerEvent.get('cases')}`;
        deathValue = `${trackerEvent.get('deaths')}`;
        increaseValue = `${trackerEvent.get('increase')}`;
      }
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

      return <div>
        <ChartContainer title='Case/Death Counts and Daily Increases' timeRange={ series.range() }
          width={ 800 } showGrid={ true } titleStyle={{ fill: '#000000', fontWeight: 500 }} timeAxisStyle={ darkAxis }
          minTime={ series.range().begin() } maxTime={ series.range().end() } timeAxisTickCount={ 5 }
          onTrackerChanged={ this.handleTrackerChanged }>
          <TimeAxis format='day'/>
          <ChartRow height='400'>
            <YAxis id='y1' label='Case Count' min={ 0 } max={ Formatter.getMaxValue(series.max('cases')) } width='60'
              type='linear' showGrid style={ darkAxis } />
            <Charts>
              <BarChart axis='y2' series={ timeSeries } columns={ ['increase'] } style={ style } />
              <LineChart axis='y1' series={ series } columns={ ['cases'] } style={ style }
                interpolation='curveBasis'/>
            </Charts>
            <YAxis id='y2' label='Daily Increase' min={ 0 } max={ Formatter.getMaxValue(timeSeries.max('increase')) }
              width='60' type='linear' showGrid={ false } style={ darkAxis } />
          </ChartRow>
          <ChartRow height='200'>
            <YAxis id='y1' label='Death Count' min={ 0 } max={ Formatter.getMaxValue(series.max('deaths')) } width='60'
              type='linear' showGrid style={ darkAxis } />
            <Charts>
              <LineChart axis='y1' series={ series } columns={ ['deaths'] } style={ style }
                interpolation='curveBasis'/>
            </Charts>
          </ChartRow>
        </ChartContainer>
        <div style={{ justifyContent: 'flex-end' }}>
          <Legend type='line' style={ this.legendStyle } categories={ legend } align='right' stack={ false }/>
        </div>
      </div>;
    }

    return null;
  }

  handleTrackerChanged(tracker) {
    if (!tracker) {
      this.setState(prevState => ({
        ...prevState,
        tracker: tracker,
        x: null,
        y: null
      }));
    } else {
      this.setState(prevState => ({
        ...prevState,
        tracker: tracker
      }));
    }
  }

  render() {
    return (
      <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1200px' }}>
        <div style={{ display: 'flex' }}>
          <Form style={{ display: 'flex' }}>
            <Form.Control type='postal' placeholder='Enter postal code...' onChange={ this.onChangePostalCode } value={ this.state.postalCodeValueInput }/>
            <Button variant='primary' type='submit' style={{ 'marginLeft': '10px' }} onClick={ this.submitPostalCode }>
              Submit
            </Button>
          </Form>
          <p style={{ 'marginLeft': '25px' }}> { this.state.postalCodeErrorMessage }</p>
        </div>
        <div style={{ display: 'flex', marginTop: '25px' }}>
          <Form style={{ display: 'flex' }}>
            <Select
              options={ this.state.stateValues }
              placeholder='Select a state...'
              SingleValue
              className='basic-single-select'
              onChange= { this.onStateChange1 }
            />
            <Button variant='primary' type='submit' style={{ 'marginLeft': '10px' }} onClick={ this.submitState }>
              Submit
            </Button>
          </Form>
        </div>
        <div style={{ display: 'flex', marginTop: '25px' }}>
          <Form style={{ display: 'flex' }}>
            <Select
              options={ this.state.stateValues }
              placeholder='Select a state...'
              SingleValue
              className='basic-single-select'
              onChange= { this.onStateChange2 }
            />
            <div style={{ marginLeft: '10px' }}>
              <Select
                options={ this.state.countyValues }
                placeholder='Select a county...'
                SingleValue
                className='basic-single-select'
                onChange= { this.onCountyChange }
                value={ this.state.countyValueInput }
              />
            </div>
            <Button variant='primary' type='submit' style={{ 'marginLeft': '10px' }} onClick= {this.submitStateCounty }>
              Submit
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
            { this.getDetailedTable() }
          </div>
          <div style={{ marginLeft: '30px', marginTop: '30px', marginBottom: '10px' }}>
            { this.getDetailedGraph() }
          </div>
        </div>
      </div>
    );
  }
}

export default DetailedInfo;
