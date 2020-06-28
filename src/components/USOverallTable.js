import BootstrapTable from 'react-bootstrap-table-next';
import Button from 'react-bootstrap/Button';
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
      loading: true,
      caseCountTracker: null,
      deathCountTracker: null
    };

    this.handleTrackerChanged1 = this.handleTrackerChanged1.bind(this);
    this.handleTrackerChanged2 = this.handleTrackerChanged2.bind(this);
    this.refresh = this.refresh.bind(this);

    this.styles = this.initializeStyles();
    this.data = {};
    this.series = {};
    this.columns = this.initializeColumns();
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    this.setState(prevState => ({
      ...prevState,
      loading: true
    }));

    return fetch('https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=state&key=usa')
      .then(res => res.json())
      .then(rdata => {
        const caseCountDataPoints = _.map(rdata.dataPoints, d => {
          return [d[0], d[1], d[3], d[5]];
        });
        const deathCountDataPoints = _.map(rdata.dataPoints, d => {
          return [d[0], d[2], d[4], d[6]];
        });

        this.data = {
          detailedInfo: [{
            country: 'USA',
            activeCount: rdata.detailedInfo.activeCount,
            activeChange: `+${rdata.detailedInfo.activeChange}`,
            liveActiveChange: `+${rdata.detailedInfo.liveActiveChange}`,
            deathCount: rdata.detailedInfo.deathCount,
            deathChange: `+${rdata.detailedInfo.deathChange}`,
            liveDeathChange: `+${rdata.detailedInfo.liveDeathChange}`,
          }],
          validDate: rdata.currentDate,
          timestamp: rdata.reportTimestamp,
        }
        this.series = {
          caseCount: this.initializeSeries(caseCountDataPoints),
          deathCount: this.initializeSeries(deathCountDataPoints)
        };

        this.setState({
          loading: false
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  initializeStyles() {
    const columns = ['time', 'count', 'increase', 'moving'];
    const columnColors = ['#000000', '#0000ff', '#c4b8b7', '#ff0000'];

    return {
      legendStyle: Grapher.getLegendStyle(columns, columnColors),
      lineStyle: styler([
        { key: 'time', color: '#0000ff', width: 1 },
        { key: 'count', color: '#0000ff', width: 2 },
        { key: 'increase', color: '#c4b8b7', width: 1 },
        { key: 'moving', color: '#ff0000', width: 2 },
      ]),
      axisStyle: {
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
      }
    }
  }

  initializeSeries(dataPoints) {
    const lineSeries = new TimeSeries(
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

    return {
      lineSeries: lineSeries,
      timeSeries: timeSeries
    }
  }

  initializeColumns() {
    return [
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
        text: 'Daily Increase'
      },
      {
        dataField: 'liveActiveChange',
        text: 'Live',
        style: {
          color: '#ff0000',
          fontWeight: 'bold'
        }
      },
      {
        dataField: 'deathCount',
        text: 'Death Count'
      },
      {
        dataField: 'deathChange',
        text: 'Daily Increase'
      },
      {
        dataField: 'liveDeathChange',
        text: 'Live',
        style: {
          color: '#ff0000',
          fontWeight: 'bold'
        }
      }
    ];
  }

  getCaseCountGraph() {
    return this.getGraph('Case', this.series.caseCount.lineSeries, this.series.caseCount.timeSeries,
      this.state.caseCountTracker, this.handleTrackerChanged1);
  }

  getDeathCountGraph() {
    return this.getGraph('Death', this.series.deathCount.lineSeries, this.series.deathCount.timeSeries,
      this.state.deathCountTracker, this.handleTrackerChanged2);
  }

  getGraph(chartName, lineSeries, timeSeries, tracker, handleTrackerChanged) {
    if (!this.state.loading) {
      let dateValue, countValue, increaseValue, movingValue;
      if (tracker) {
        const index = lineSeries.bisect(tracker);
        const trackerEvent = lineSeries.at(index);
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
        <ChartContainer title={ `${chartName} Counts and Daily Increases` } timeRange={ lineSeries.range() }
          width={ 600 } showGrid={ true } titleStyle={{ fill: '#000000', fontWeight: 500 }}
          timeAxisStyle={ this.styles.axisStyle } minTime={ lineSeries.range().begin() }
          maxTime={ lineSeries.range().end() } timeAxisTickCount={ 5 } onTrackerChanged={ handleTrackerChanged }>
          <TimeAxis format='day'/>
          <ChartRow height='400'>
            <YAxis id='y1' label='Count' min={ 0 } max={ Formatter.getMaxValue(lineSeries.max('count')) } width='60'
              type='linear' style={ this.styles.axisStyle } showGrid/>
            <Charts>
              <BarChart axis='y2' series={ timeSeries } columns={ ['increase'] } style={ this.styles.lineStyle } />
              <LineChart axis='y1' series={ lineSeries } columns={ ['count'] } style={ this.styles.lineStyle }
                interpolation='curveBasis'/>
              <LineChart axis='y2' series={ lineSeries } columns={ ['moving'] } style={ this.styles.lineStyle }
                interpolation='curveBasis'/>
            </Charts>
            <YAxis id='y2' label='Daily Increase' min={ 0 } max={ Formatter.getMaxValue(lineSeries.max('increase')) }
              width='60' type='linear' showGrid={ false } style={ this.styles.axisStyle } />
          </ChartRow>
        </ChartContainer>
        <div style={{ justifyContent: 'flex-end' }}>
          <Legend type='line' style={ this.styles.legendStyle } categories={ legend } align='right' stack={ false }/>
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

  refresh() {
    this.fetchData();
  }

  render() {
    if (this.state.loading) {
      return (
        <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1000px' }}>
          <Spinner animation='border' />
        </div>
      );
    } else {
      return (
        <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1000px' }}>
          <div>
            <p align='left'>
              * All data (except live) reflects situation accurately up till
              <span style={{ 'fontWeight': 'bold'}}> { this.data.validDate } 23:59:59 EST</span>
              . Live reflects situation from then till now.
              <span style={{ 'fontStyle': 'italic', 'fontWeight': 'bold' }}> (Last updated: { Formatter.getTimestamp(this.data.timestamp) })
              </span>
            </p>
          </div>
          <div style={{ display: 'flex' }}>
            <Button variant='secondary' onClick={ this.refresh }>Refresh</Button>
          </div>
          <div style={{ marginTop: '20px' }}>
            <BootstrapTable bootstrap4={ true } keyField='us-overall-table'
              data={ this.data.detailedInfo } columns={ this.columns }>
            </BootstrapTable>
          </div>
          <div style={{ display: 'flex', minWidth: '1200px' }}>
            <div style={{ 'marginTop': '20px', 'marginBottom': '10px' }}>
              { this.getCaseCountGraph() }
            </div>
            <div style={{ marginLeft: '30px', marginTop: '20px', marginBottom: '10px' }}>
              { this.getDeathCountGraph() }
            </div>
          </div>
        </div>
      );
    }
  }
}

export default USOverallTable;
