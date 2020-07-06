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
    this.getHeaderStyle = this.getHeaderStyle.bind(this);

    this.state = {
      loading: false,
      postalCodeValueInput: '',
      countyValueInput: null,
      trackers: [null]
    };

    this.styles = this.initializeStyles();
    this.data = {};
    this.series = {};

    const stateValues = _.map(data.states, s => {
      return {
        label: s,
        value: s.toLowerCase()
      };
    });

    this.data.stateValues = stateValues;
  }

  componentDidMount() {
  }

  initializeStyles() {
    const columns = ['time', 'cases', 'deaths', 'caseIncrease', 'deathIncrease', 'caseAverage', 'deathAverage'];
    const columnColors = ['#000000', '#0000ff', '#0000ff', '#c4b8b7', '#c4b8b7', '#ff0000', '#ff0000'];

    return {
      legendStyle: Grapher.getLegendStyle(columns, columnColors),
      lineStyle: styler([
        { key: 'time', color: '#0000ff', width: 1 },
        { key: 'cases', color: '#0000ff', width: 2 },
        { key: 'deaths', color: '#0000ff', width: 2 },
        { key: 'caseIncrease', color: '#c4b8b7', width: 2 },
        { key: 'deathIncrease', color: '#c4b8b7', width: 2 },
        { key: 'caseAverage', color: '#ff0000', width: 2 },
        { key: 'deathAverage', color: '#ff0000', width: 2 },
      ]),
      axisStyle: {
        label: {
            stroke: 'none',
            fill: '#000000',
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
      }
    }
  }

  initializeSeries(dataPoints) {
    const lineSeries = new TimeSeries(
      {
        name: 'CovidStats',
        columns: ['time', 'cases', 'deaths', 'caseIncrease', 'deathIncrease', 'caseAverage', 'deathAverage'],
        points: dataPoints
      }
    );
    const timeSeries = new TimeSeries(
      {
        name: 'CovidStatsBar',
        columns: ['index', 'caseIncrease', 'deathIncrease'],
        points: _.map(dataPoints, d => {
          return [Index.getIndexString('1d', d[0]), d[3], d[4]];
        })
      }
    );

    return {
      lineSeries: lineSeries,
      timeSeries: timeSeries
    }
  }

  onChangePostalCode(event) {
    const input = event.target.value;
    this.setState(prevState => ({
      ...prevState,
      postalCodeValueInput: input
    }));
  }

  async submitPostalCode(event) {
    event.preventDefault();

    this.setState(prevState => ({
      ...prevState,
      loading: true
    }));

    const postalCode = this.state.postalCodeValueInput;

    return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=postal&key=${postalCode}`)
      .then(res => res.json())
      .then(rdata => {
        if (rdata.fips === null || rdata.fips === undefined) {
          this.data.postalCodeErrorMessage = `'${postalCode}' is not a valid postal code.`;
        } else {
          this.data.tableData = this.getTableData(rdata);
          this.data.postalCodeErrorMessage = '';
          this.data.asOfDate = `As of: ${rdata.currentDate} 23:59:59 EST`;
          this.data.countyStateName = `${rdata.countyName}, ${rdata.stateNameFull}`;
          this.data.timestamp = rdata.reportTimestamp;
          this.data.dataPoints = rdata.dataPoints;
          this.data.dangerColor = Formatter.getDangerColorRanking(
            rdata.detailedInfo.activeChange, rdata.detailedInfo.population);

          this.series = this.initializeSeries(rdata.dataPoints);
        }
      })
      .catch(err => {
        console.log(err);
      })
      .then(() => {
        this.setState(prevState => ({
          ...prevState,
          loading: false
        }));
      });
  }

  onStateChange1(objects, action) {
    this.data.stateValueInput1 = objects.value;
  };

  submitState(event) {
    event.preventDefault();

    this.setState(prevState => ({
      ...prevState,
      loading: true
    }));

    const state = encodeURIComponent(this.data.stateValueInput1);

    return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=state&key=${state}`)
      .then(res => res.json())
      .then(rdata => {
        this.data.tableData = this.getTableData(rdata);
        this.data.postalCodeErrorMessage = '';
        this.data.asOfDate = `As of: ${rdata.currentDate} 23:59:59 EST`;
        this.data.countyStateName = `${rdata.stateNameFullProper}`;
        this.data.timestamp = rdata.reportTimestamp;
        this.data.dataPoints = rdata.dataPoints;
        this.data.dangerColor = Formatter.getDangerColorRanking(
            rdata.detailedInfo.activeChange, rdata.detailedInfo.population);

        this.series = this.initializeSeries(rdata.dataPoints);
      })
      .catch(err => {
        console.log(err);
      })
      .then(() => {
        this.setState(prevState => ({
          ...prevState,
          loading: false
        }));
      });
  }

  onStateChange2(objects, action) {
    this.setState(prevState => ({
      ...prevState,
      countyValueInput: null
    }));

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

        this.data.stateValueInput2 = objects.value;
        this.data.countyValues = countyValues;
        this.data.countyValueMap = countyValueMap;

        this.setState(prevState => ({
          ...prevState,
          countyValueInput: (countyValues.length > 0 ? countyValues[0] : null),
        }));
      })
      .catch(err => {
        console.log(err);
      });
  };

  onCountyChange(objects, action) {
    this.setState(prevState => ({
      ...prevState,
      countyValueInput: objects
    }));
  };

  submitStateCounty(event) {
    event.preventDefault();

    this.setState(prevState => ({
      ...prevState,
      loading: true
    }));

    const fips = this.data.countyValueMap[this.state.countyValueInput.value];

    return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=county&key=${fips}`)
      .then(res => res.json())
      .then(rdata => {
        this.data.tableData = this.getTableData(rdata);
        this.data.postalCodeErrorMessage = '';
        this.data.asOfDate = `As of: ${rdata.currentDate} 23:59:59 EST`;
        this.data.countyStateName = `${rdata.countyName}, ${rdata.stateNameFull}`;
        this.data.timestamp = rdata.reportTimestamp;
        this.data.dataPoints = rdata.dataPoints;
        this.data.dangerColor = Formatter.getDangerColorRanking(
            rdata.detailedInfo.activeChange, rdata.detailedInfo.population);

        this.series = this.initializeSeries(rdata.dataPoints);
      })
      .catch(err => {
        console.log(err);
      })
      .then(() => {
        this.setState(prevState => ({
          ...prevState,
          loading: false
        }));
      });
  }

  getTableData(rdata) {
    var activeRank = `${rdata.detailedInfo.activeRank}/${rdata.detailedInfo.rankCount}`;
    const countryActiveRankDiff = rdata.detailedInfo.activeRankPast - rdata.detailedInfo.activeRank;
    if (countryActiveRankDiff !== 0) {
      activeRank = `${activeRank} (${Formatter.modifyChangeRank(countryActiveRankDiff)})`;
    }

    var deathRank = `${rdata.detailedInfo.deathRank}/${rdata.detailedInfo.rankCount}`;
    const countryDeathRankDiff = rdata.detailedInfo.deathRankPast - rdata.detailedInfo.deathRank;
    if (countryDeathRankDiff !== 0) {
      deathRank = `${deathRank} (${Formatter.modifyChangeRank(countryDeathRankDiff)})`;
    }

    const data = [
      {
        key: 'Total population',
        value: rdata.detailedInfo.population
      },
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
        value: (rdata.detailedInfo.liveActiveChange >= 0) ? `+${rdata.detailedInfo.liveActiveChange}` : rdata.detailedInfo.liveActiveChange,
        style: {
          color: '#ff0000',
          fontWeight: 'bold'
        }
      },
      {
        key: '% of population',
        value: `${rdata.detailedInfo.activePercentage}%`
      },
      {
        key: 'Rank in country',
        value: activeRank,
        style: {
          color: this.getRankingColor(countryActiveRankDiff)
        }
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
        value: (rdata.detailedInfo.liveDeathChange >= 0) ? `+${rdata.detailedInfo.liveDeathChange}` : rdata.detailedInfo.liveDeathChange,
        style: {
          color: '#ff0000',
          fontWeight: 'bold'
        }
      },
      {
        key: '% of population',
        value: `${rdata.detailedInfo.deathPercentage}%`
      },
      {
        key: 'Rank in country',
        value: deathRank,
        style: {
          color: this.getRankingColor(countryActiveRankDiff)
        }
      }
    ];

    if (Object.prototype.hasOwnProperty.call(rdata.detailedInfo, 'localActiveRank')) {
      var localActiveRank = `${rdata.detailedInfo.localActiveRank}/${rdata.detailedInfo.localRankCount}`;
      const stateActiveRankDiff = rdata.detailedInfo.localActiveRankPast - rdata.detailedInfo.localActiveRank;
      if (stateActiveRankDiff !== 0) {
        localActiveRank = `${localActiveRank} (${Formatter.modifyChangeRank(stateActiveRankDiff)})`;
      }

      var localDeathRank = `${rdata.detailedInfo.localDeathRank}/${rdata.detailedInfo.localRankCount}`;
      const stateDeathRankDiff = rdata.detailedInfo.localDeathRankPast - rdata.detailedInfo.localDeathRank;
      if (stateDeathRankDiff !== 0) {
        localDeathRank = `${localDeathRank} (${Formatter.modifyChangeRank(stateDeathRankDiff)})`;
      }

      data.splice(5, 0, { key: 'Rank in state', value: localActiveRank, color: this.getRankingColor(stateActiveRankDiff) });
      data.splice(11, 0, { key: 'Rank in state', value: localDeathRank, color: this.getRankingColor(stateDeathRankDiff) });
    }

    return data;
  }

  getRankingColor(diff) {
    return (diff === 0) ? 'black' : ((diff > 0) ? 'red' : 'green')
  }

  getHeaderStyle(column, columnIndex) {
    return { backgroundColor: this.data.dangerColor };
  }

  getCellStyle(cell, row, rowIndex, colIndex) {
    if (Object.prototype.hasOwnProperty.call(row, 'style')) {
      return row.style;
    }

    return Formatter.getCellStyle(cell, row, rowIndex, colIndex);
  }

  getDetailedTable() {
    if (!this.state.loading && this.data.tableData !== undefined) {
      const columns = [
        {
          dataField: 'key',
          text: this.data.asOfDate,
          headerStyle: this.getHeaderStyle
        },
        {
          dataField: 'value',
          text: this.data.countyStateName,
          headerStyle: this.getHeaderStyle,
          style: this.getCellStyle
        }
      ];

      return <div>
        <p align='left'>
          * Header color indicates COVID-19 risks as defined <a href='https://www.npr.org/sections/health-shots/2020/07/01/885263658/green-yellow-orange-or-red-this-new-tool-shows-covid-19-risk-in-your-county'>here</a>.<br/>
          <span style={{ 'fontStyle': 'italic', 'fontWeight': 'bold' }}>
            (Last updated: { Formatter.getTimestamp(this.data.timestamp) })
          </span>
        </p>
        <BootstrapTable bootstrap4={ true } keyField='detailed-table' data={ this.data.tableData } columns={ columns }>
        </BootstrapTable>
      </div>
    }

    return null;
  }

  getDetailedGraph() {
    if (!this.state.loading && this.data.dataPoints !== undefined) {
      let dateValue, caseValue, deathValue, caseIncreaseValue, deathIncreaseValue, caseAverageValue, deathAverageValue;
      if (this.state.trackers[0] !== null) {
        const index = this.series.lineSeries.bisect(this.state.trackers[0]);
        const trackerEvent = this.series.lineSeries.at(index);
        const utcDate = trackerEvent.timestamp();
        dateValue = `${utcDate.getFullYear()}-${('0' + (utcDate.getMonth() + 1)).slice(-2)}-${('0' + utcDate.getDate()).slice(-2)}`;
        caseValue = `${trackerEvent.get('cases')}`;
        caseIncreaseValue = `${trackerEvent.get('caseIncrease')}`;
        caseAverageValue = `${trackerEvent.get('caseAverage')}`;
        deathValue = `${trackerEvent.get('deaths')}`;
        deathIncreaseValue = `${trackerEvent.get('deathIncrease')}`;
        deathAverageValue = `${trackerEvent.get('deathAverage')}`;
      }
      const legend1 = [
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
          key: 'caseIncrease',
          label: 'Case Daily Increase',
          value: caseIncreaseValue,
        },
        {
          key: 'caseAverage',
          label: 'Case Moving Average',
          value: caseAverageValue
        }
      ];
      const legend2 = [
        {
          key: 'deaths',
          label: 'Death Counts',
          value: deathValue
        },
        {
          key: 'deathIncrease',
          label: 'Death Daily Increase',
          value: deathIncreaseValue,
        },
        {
          key: 'deathAverage',
          label: 'Death Moving Average',
          value: deathAverageValue
        }
      ];

      return <div>
        <ChartContainer title='Case/Death Counts and Daily Increases' timeRange={ this.series.lineSeries.range() }
          width={ 800 } showGrid={ true } titleStyle={{ fill: '#000000', fontWeight: 500 }}
          timeAxisStyle={ this.styles.axisStyle } minTime={ this.series.lineSeries.range().begin() }
          maxTime={ this.series.lineSeries.range().end() } timeAxisTickCount={ 5 }
          onTrackerChanged={ tracker => this.handleTrackerChanged(tracker, 0) }>
          <TimeAxis format='day'/>
          <ChartRow height='400'>
            <YAxis id='y1' label='Case Count' min={ 0 }
              max={ Formatter.getMaxValue(this.series.lineSeries.max('cases')) } width='60' type='linear'
              showGrid style={ this.styles.axisStyle } />
            <Charts>
              <BarChart axis='y2' series={ this.series.timeSeries } columns={ ['caseIncrease'] }
                style={ this.styles.lineStyle } />
              <LineChart axis='y1' series={ this.series.lineSeries } columns={ ['cases'] }
                style={ this.styles.lineStyle } interpolation='curveBasis'/>
              <LineChart axis='y2' series={ this.series.lineSeries } columns={ ['caseAverage'] }
                style={ this.styles.lineStyle } interpolation='curveBasis'/>
            </Charts>
            <YAxis id='y2' label='Daily Increase' min={ 0 }
              max={ Formatter.getMaxValue(this.series.timeSeries.max('caseIncrease')) } width='60' type='linear'
              showGrid={ false } style={ this.styles.axisStyle } />
          </ChartRow>
          <ChartRow height='250'>
            <YAxis id='y1' label='Death Count' min={ 0 }
              max={ Formatter.getMaxValue(this.series.lineSeries.max('deaths')) } width='60' type='linear' showGrid
              style={ this.styles.axisStyle } />
            <Charts>
              <BarChart axis='y2' series={ this.series.timeSeries } columns={ ['deathIncrease'] }
                style={ this.styles.lineStyle } />
              <LineChart axis='y1' series={ this.series.lineSeries } columns={ ['deaths'] }
                style={ this.styles.lineStyle } interpolation='curveBasis'/>
              <LineChart axis='y2' series={ this.series.lineSeries } columns={ ['deathAverage'] }
                style={ this.styles.lineStyle } interpolation='curveBasis'/>
            </Charts>
            <YAxis id='y2' label='Daily Increase' min={ 0 }
              max={ Formatter.getMaxValue(this.series.timeSeries.max('deathIncrease')) } width='60' type='linear'
              showGrid={ false } style={ this.styles.axisStyle } />
          </ChartRow>
        </ChartContainer>
        <div style={{ justifyContent: 'flex-end' }}>
          <Legend type='line' style={ this.styles.legendStyle } categories={ legend1 } align='right' stack={ false }/>
        </div>
        <div style={{ justifyContent: 'flex-end' }}>
          <Legend type='line' style={ this.styles.legendStyle } categories={ legend2 } align='right' stack={ false }/>
        </div>
      </div>;
    }

    return null;
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
    return (
      <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1200px' }}>
        <div style={{ display: 'flex' }}>
          <Form style={{ display: 'flex' }}>
            <Form.Control type='postal' placeholder='Enter postal code...' onChange={ this.onChangePostalCode }
              value={ this.state.postalCodeValueInput }/>
            <Button variant='primary' type='submit' style={{ 'marginLeft': '10px' }} onClick={ this.submitPostalCode }>
              Submit
            </Button>
          </Form>
          <p style={{ 'marginLeft': '25px' }}> { this.data.postalCodeErrorMessage }</p>
        </div>
        <div style={{ display: 'flex', marginTop: '25px' }}>
          <Form style={{ display: 'flex' }}>
            <Select
              options={ this.data.stateValues }
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
              options={ this.data.stateValues }
              placeholder='Select a state...'
              SingleValue
              className='basic-single-select'
              onChange= { this.onStateChange2 }
            />
            <div style={{ marginLeft: '10px' }}>
              <Select
                options={ this.data.countyValues }
                placeholder='Select a county...'
                SingleValue
                className='basic-single-select'
                onChange= { this.onCountyChange }
                value= { this.state.countyValueInput }
                isDisabled= { this.state.countyValueInput === null }
              />
            </div>
            <Button variant='primary' type='submit' style={{ 'marginLeft': '10px' }} onClick= { this.submitStateCounty }>
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
