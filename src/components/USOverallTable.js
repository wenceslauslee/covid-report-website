import BootstrapTable from 'react-bootstrap-table-next';
import { BarChart, Charts, ChartContainer, ChartRow, YAxis, LineChart, Legend, TimeAxis, styler }
  from 'react-timeseries-charts';
import { Component } from 'react';
import Formatter from '../utils/Formatter';
import Grapher from '../utils/Grapher';
import React from 'react';
import { Spinner } from 'react-bootstrap';
import { Index, TimeSeries } from 'pondjs';
import _ from 'lodash';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

class USOverallTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      validDate: '',
      timestamp: '',
      loading: true,
      caseCountDataPoints: [],
      caseCountTracker: null,
      deathCountDataPoints: [],
      deathCountTracker: null
    };

    this.handleTrackerChanged1 = this.handleTrackerChanged1.bind(this);
    this.handleTrackerChanged2 = this.handleTrackerChanged2.bind(this);

    const columns = ['time', 'count', 'increase', 'moving'];
    const columnColors = ['#000000', '#0000ff', '#c4b8b7', '#ff0000'];
    this.legendStyle = Grapher.getLegendStyle(columns, columnColors);
  }

  componentDidMount() {
    fetch('https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=state&key=usa')
      .then(res => res.json())
      .then(rdata => {
        const caseCountDataPoints = _.map(rdata.dataPoints, d => {
          return [d[0], d[1], d[3], d[5]];
        });
        const deathCountDataPoints = _.map(rdata.dataPoints, d => {
          return [d[0], d[2], d[4], d[6]];
        });

        this.setState({
          data: [{
            country: 'USA',
            activeCount: rdata.detailedInfo.activeCount,
            activeChange: `+${rdata.detailedInfo.activeChange}`,
            deathCount: rdata.detailedInfo.deathCount,
            deathChange: `+${rdata.detailedInfo.deathChange}`
          }],
          validDate: rdata.currentDate,
          timestamp: rdata.reportTimestamp,
          loading: false,
          caseCountDataPoints: caseCountDataPoints,
          deathCountDataPoints: deathCountDataPoints
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  getCaseCountGraph() {
    return this.getGraph(this.state.caseCountDataPoints, 'Case', this.state.caseCountTracker,
      this.handleTrackerChanged1);
  }

  getDeathCountGraph() {
    return this.getGraph(this.state.deathCountDataPoints, 'Death', this.state.deathCountTracker,
      this.handleTrackerChanged2);
  }

  getGraph(dataPoints, chartName, tracker, handleTrackerChanged) {
    if (!this.state.loading) {
      const series = new TimeSeries(
        {
          name: 'USStats',
          columns: ['time', 'count', 'increase', 'moving'],
          points: dataPoints
        }
      );
      const timeSeries = new TimeSeries(
        {
          name: 'USStatsBar',
          columns: ['index', 'increase'],
          points: _.map(dataPoints, d => {
            return [Index.getIndexString('1d', d[0]), d[2]];
          })
        }
      );
      const style = styler([
        { key: 'time', color: '#0000ff', width: 1 },
        { key: 'count', color: '#0000ff', width: 2 },
        { key: 'increase', color: '#c4b8b7', width: 1 },
        { key: 'moving', color: '#ff0000', width: 2 },
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
            opacity: 0.3
        }
      };

      let dateValue, countValue, increaseValue, movingValue;
      if (tracker) {
        const index = series.bisect(tracker);
        const trackerEvent = series.at(index);
        const utcDate = trackerEvent.timestamp();
        dateValue = `${utcDate.getFullYear()}-${('0' + (utcDate.getMonth() + 1)).slice(-2)}-${('0' + utcDate.getDate()).slice(-2)}`;
        countValue = `${trackerEvent.get('count')}`;
        increaseValue = `${trackerEvent.get('increase')}`;
        movingValue = `${trackerEvent.get('moving')}`;
      }
      const legend = [
        {
          key: 'time',
          label: 'Date',
          value: dateValue
        },
        {
          key: 'count',
          label: `${chartName} Counts`,
          value: countValue
        },
        {
          key: 'increase',
          label: 'Daily Increase',
          value: increaseValue
        },
        {
          key: 'moving',
          label: '7-Day Moving Average',
          value: movingValue
        }
      ];

      return <div>
        <ChartContainer title={ `${chartName} Counts and Daily Increases` } timeRange={ series.range() }
          width={ 600 } showGrid={ true } titleStyle={{ fill: '#000000', fontWeight: 500 }} timeAxisStyle={ darkAxis }
          minTime={ series.range().begin() } maxTime={ series.range().end() } timeAxisTickCount={ 5 }
          onTrackerChanged={ handleTrackerChanged }>
          <TimeAxis format='day'/>
          <ChartRow height='400'>
            <YAxis id='y1' label='Count' min={ 0 } max={ Formatter.getMaxValue(series.max('count')) } width='60'
              type='linear' showGrid style={ darkAxis } />
            <Charts>
              <BarChart axis='y2' series={ timeSeries } columns={ ['increase'] } style={ style } />
              <LineChart axis='y1' series={ series } columns={ ['count'] } style={ style }
                interpolation='curveBasis'/>
              <LineChart axis='y2' series={ series } columns={ ['moving'] } style={ style }
                interpolation='curveBasis'/>
            </Charts>
            <YAxis id='y2' label='Daily Increase' min={ 0 } max={ Formatter.getMaxValue(series.max('increase')) }
              width='60' type='linear' showGrid={ false } style={ darkAxis } />
          </ChartRow>
        </ChartContainer>
        <div style={{ justifyContent: 'flex-end' }}>
          <Legend type='line' style={ this.legendStyle } categories={ legend } align='right' stack={ false }/>
        </div>
      </div>;
    }

    return null;
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
      deathCountTracker: tracker,
    }));
  }

  render() {
    const columns = [
      {
        dataField: 'country',
        text: 'Country'
      },
      {
        dataField: 'activeCount',
        text: 'Case Count'
      },
      {
        dataField: 'activeChange',
        text: 'Daily Change'
      },
      {
        dataField: 'deathCount',
        text: 'Death Count'
      },
      {
        dataField: 'deathChange',
        text: 'Daily Change'
      }
    ];

    if (this.state.loading) {
      return (
        <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1000px' }}>
          <Spinner animation='border' />
        </div>
      );
    } else {
      return (
        <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1000px' }}>
          <p align='left'>
            * Data reflects situation at
            <span style={{ 'fontWeight': 'bold'}}> { this.state.validDate } 23:59:59 EST</span>
            <span style={{ 'fontStyle': 'italic' }}> (Last updated: { Formatter.getTimestamp(this.state.timestamp) })</span>
          </p>
          <BootstrapTable bootstrap4={ true } keyField='us-overall-table'
            data={ this.state.data } columns={ columns }>
          </BootstrapTable>
          <div style={{ display: 'flex', minWidth: '1200px' }}>
            <div style={{ 'marginTop': '30px', 'marginBottom': '10px' }}>
              { this.getCaseCountGraph() }
            </div>
            <div style={{ marginLeft: '30px', marginTop: '30px', marginBottom: '10px' }}>
              { this.getDeathCountGraph() }
            </div>
        </div>
        </div>
      );
    }
  }
}

export default USOverallTable;
