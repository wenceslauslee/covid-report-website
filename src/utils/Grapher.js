import { Charts, ChartContainer, ChartRow, YAxis, LineChart, Legend, TimeAxis, styler } from 'react-timeseries-charts';
import Formatter from '../utils/Formatter';
import moment from 'moment';
import React from 'react';
import { TimeSeries } from 'pondjs';
import _ from 'lodash';

const Grapher = {
  getColor(order) {
    return this.getColors()[order];
  },

  getColors() {
    return ['#0000ff', '#ff0000', '#2bcc12', '#770b9c'];
  },

  getAxisStyle() {
    return {
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
  },

  getLineStyle(colors, keys) {
    var style = [];

    style.push({
      key: 'time',
      color: '#000000',
      width: 2
    });

    for (var j = 1; j < keys.length; j++) {
      style.push({
        key: keys[j],
        color: colors[j],
        width: 2
      });
    }

    return styler(style);
  },

  getTimeSeries(seriesName, keys, dataPoints) {
    return new TimeSeries(
      {
        name: seriesName,
        columns: keys,
        points: dataPoints
      }
    );
  },

  getGraph(keyColumns, labelColumns, titleName, dataSeries, dataMax, tracker, handleTrackerChanged, styles) {
    let dateValue;
    const stateLegendValues = [];
    if (tracker) {
      const index = dataSeries.bisect(tracker);
      const trackerEvent = dataSeries.at(index);
      const utcDate = trackerEvent.timestamp();
      dateValue = `${utcDate.getFullYear()}-${('0' + (utcDate.getMonth() + 1)).slice(-2)}-${('0' +
        utcDate.getDate()).slice(-2)}`;

      for (var i = 1; i < keyColumns.length; i++) {
        stateLegendValues.push(`${trackerEvent.get(keyColumns[i])}`);
      }
    }

    const legend = [];
    const yColumns = [];

    legend.push({
      key: 'time',
      label: 'Date',
      value: dateValue
    });

    for (var j = 1; j < labelColumns.length; j++) {
      const lvalue = (stateLegendValues.length === 0) ? undefined : stateLegendValues[j - 1];
      legend.push({
        key: keyColumns[j],
        label: labelColumns[j],
        value: lvalue
      });
      yColumns.push(keyColumns[j]);
    }

    return (
      <div>
        <ChartContainer title={ titleName } timeRange={ dataSeries.range() }
          width={ 600 } showGrid={ true } titleStyle={{ fill: '#000000', fontWeight: 500 }}
          timeAxisStyle={ styles.axisStyle } minTime={ dataSeries.range().begin() } maxTime={ dataSeries.range().end() }
          timeAxisTickCount={ 5 } onTrackerChanged={ handleTrackerChanged }>
          <TimeAxis format='day'/>
          <ChartRow height='400'>
            <YAxis id='y' label='Count' min={ 0 } max={ dataMax } width='60' type='linear' showGrid
              style={ styles.axisStyle } />
             <Charts>
              <LineChart axis='y' series={ dataSeries } columns={ yColumns } style={ styles.lineStyle }
                interpolation='curveBasis'/>
            </Charts>
          </ChartRow>
        </ChartContainer>
        <div style={{ justifyContent: 'flex-end' }}>
          <Legend type='line' style={ styles.legendStyle } categories={ legend } align='right' stack={ false }/>
        </div>
      </div>
    );
  },

  getLegendStyle(keys, color) {
    const legendStyle = {};

    for (var i = 0; i < keys.length; i++) {
      legendStyle[keys[i]] = {
        symbol: this.getSymbolStyle(color[i]),
        label: this.getLabelStyle(),
        value: this.getValueStyle()
      };
    }

    return legendStyle;
  },

  getSymbolStyle(color) {
    return {
      normal: {opacity: 1.0, stroke: color, strokeWidth: 1, cursor: 'pointer'},
      highlighted: {opacity: 1.0, stroke: color, strokeWidth: 1, cursor: 'pointer'},
      selected: {opacity: 1.0, stroke: color, strokeWidth: 1, cursor: 'pointer'},
      muted: {opacity: 1.0, stroke: color, strokeWidth: 1, cursor: 'pointer'},
    };
  },

  getLabelStyle() {
    return {
      normal: {fontSize: 'normal', color: '#333', paddingRight: 10, cursor: 'pointer', opacity: 1.0},
      highlighted: {fontSize: 'normal', color: '#333', paddingRight: 10, cursor: 'pointer', opacity: 1.0},
      selected: {fontSize: 'normal', color: '#333', paddingRight: 10, cursor: 'pointer', opacity: 1.0},
      muted: {fontSize: 'normal', color: '#333', paddingRight: 10, cursor: 'pointer', opacity: 1.0},
    };
  },

  getValueStyle() {
    return {
      normal: {fontSize: 'smaller', color: '#333', cursor: 'pointer', opacity: 1.0},
      highlighted: {fontSize: 'smaller', color: '#333', cursor: 'pointer', opacity: 1.0},
      selected: {fontSize: 'smaller', color: '#333', cursor: 'pointer', opacity: 1.0},
      muted: {fontSize: 'smaller', color: '#333', cursor: 'pointer', opacity: 1.0}
    };
  },

  combineData(allStates) {
    const results = {};
    const caseCount = [];
    var caseCountMax = 0;
    const caseCountIncrease = [];
    var caseCountIncreaseMax = 0;
    const deathCount = [];
    var deathCountMax = 0;
    const deathCountIncrease = [];
    var deathCountIncreaseMax = 0;

    const maxPointCount = (_.maxBy(allStates, s => s.dataPoints.length)).dataPoints.length;
    var currentDate = '';
    var reportTimestamp = '';
    for (var k = 0; k < allStates.length; k++) {
      if (allStates[k].dataPoints.length === maxPointCount) {
        if (reportTimestamp === '' || moment(reportTimestamp) < moment(allStates[k].reportTimestamp)) {
          currentDate = allStates[k].currentDate;
          reportTimestamp = allStates[k].reportTimestamp;
        }
      } else {
        while (allStates[k].dataPoints.length < maxPointCount) {
          allStates[k].dataPoints.push(allStates[k].dataPoints[allStates[k].dataPoints.length - 1]);
        }
      }
    }

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
        caseCountIncreaseMax = Math.max(caseCountIncreaseMax, (allStates[i].dataPoints)[j][5]);
        caseCountIncrease[j].push((allStates[i].dataPoints)[j][5]);
        deathCountIncreaseMax = Math.max(deathCountIncreaseMax, (allStates[i].dataPoints)[j][6]);
        deathCountIncrease[j].push((allStates[i].dataPoints)[j][6]);
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
    results.currentDate = currentDate;
    results.reportTimestamp = reportTimestamp;

    return results;
  },

  // [0] Case count
  // [1] Death count
  // [2] Case increase
  // [3] Death increase
  // [4] Case average increase
  // [5] Death average increase
  combineAllData(allStates, keys) {
    const results = {};
    const points = [[], [], [], [], [], []];
    const max = [0, 0, 0, 0, 0, 0];

    const maxPointCount = (_.maxBy(allStates, s => s.dataPoints.length)).dataPoints.length;
    var currentDate = '';
    var reportTimestamp = '';
    for (var k = 0; k < allStates.length; k++) {
      if (allStates[k].dataPoints.length === maxPointCount) {
        if (reportTimestamp === '' || moment(reportTimestamp) < moment(allStates[k].reportTimestamp)) {
          currentDate = allStates[k].currentDate;
          reportTimestamp = allStates[k].reportTimestamp;
        }
      } else {
        while (allStates[k].dataPoints.length < maxPointCount) {
          allStates[k].dataPoints.push(allStates[k].dataPoints[allStates[k].dataPoints.length - 1]);
        }
      }
    }

    for (var index in allStates[0].dataPoints) {
      points[0].push([(allStates[0].dataPoints)[index][0]]);
      points[1].push([(allStates[0].dataPoints)[index][0]]);
      points[2].push([(allStates[0].dataPoints)[index][0]]);
      points[3].push([(allStates[0].dataPoints)[index][0]]);
      points[4].push([(allStates[0].dataPoints)[index][0]]);
      points[5].push([(allStates[0].dataPoints)[index][0]]);
    }

    for (var i = 0; i < allStates.length; i++) {
      for (var j = 0; j < allStates[i].dataPoints.length; j++) {
        max[0] = Math.max(max[0], (allStates[i].dataPoints)[j][1]);
        points[0][j].push((allStates[i].dataPoints)[j][1]);
        max[1] = Math.max(max[1], (allStates[i].dataPoints)[j][2]);
        points[1][j].push((allStates[i].dataPoints)[j][2]);
        max[2] = Math.max(max[2], (allStates[i].dataPoints)[j][3]);
        points[2][j].push((allStates[i].dataPoints)[j][3]);
        max[3] = Math.max(max[3], (allStates[i].dataPoints)[j][4]);
        points[3][j].push((allStates[i].dataPoints)[j][4]);
        max[4] = Math.max(max[4], (allStates[i].dataPoints)[j][5]);
        points[4][j].push((allStates[i].dataPoints)[j][5]);
        max[5] = Math.max(max[5], (allStates[i].dataPoints)[j][6]);
        points[5][j].push((allStates[i].dataPoints)[j][6]);
      }
    }
    const maxFormatted = _.map(max, m => Formatter.getMaxValue(m));
    const series = [];

    series.push(Grapher.getTimeSeries('CaseCount', keys, points[0]));
    series.push(Grapher.getTimeSeries('DeathCount', keys, points[1]));
    series.push(Grapher.getTimeSeries('CaseCountDailyIncrease', keys, points[2]));
    series.push(Grapher.getTimeSeries('DeathCountDailyIncrease', keys, points[3]));
    series.push(Grapher.getTimeSeries('CaseCountAverageDailyIncrease', keys, points[4]));
    series.push(Grapher.getTimeSeries('DeathCountAverageDailyIncrease', keys, points[5]));

    results.series = series;
    results.max = maxFormatted;
    results.currentDate = currentDate;
    results.reportTimestamp = reportTimestamp;

    return results;
  }
}

export default Grapher