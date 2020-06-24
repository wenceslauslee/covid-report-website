import { Charts, ChartContainer, ChartRow, YAxis, LineChart, Legend, TimeAxis, styler } from 'react-timeseries-charts';
import React from 'react';
import { TimeSeries } from 'pondjs';

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
const colors = ['#0000ff', '#ff0000', '#2bcc12', '#770b9c'];

const Grapher = {
  getColor(order) {
    return colors[order];
  },

  getColors() {
    return colors;
  },

  getGraph(state, seriesName, titleName, seriesDataPoints, tracker, handleTrackerChanged, dataMax, legendStyle) {
    if (state.showTables && !state.loading) {
      const lowerCaseColumns = state.columns.map(state => state.toLowerCase());
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
        color: '#000000',
        width: 2
      });

      for (var j = 1; j < state.columns.length; j++) {
        legend.push({
          key: lowerCaseColumns[j],
          label: state.columns[j],
          value: stateLegendValues[j - 1]
        });
        style.push({
          key: lowerCaseColumns[j],
          color: this.getColor(j - 1),
          width: 2
        });
        yColumns.push(lowerCaseColumns[j]);
      }
      style = styler(style);

      return (
        <div>
          <ChartContainer title={ titleName } timeRange={ series.range() }
            width={ 600 } showGrid={ true } titleStyle={{ fill: '#000000', fontWeight: 500 }} timeAxisStyle={ darkAxis }
            minTime={ series.range().begin() } maxTime={ series.range().end() } timeAxisTickCount={ 5 }
            onTrackerChanged={ handleTrackerChanged }>
            <TimeAxis format='day'/>
            <ChartRow height='400'>
              <YAxis id='y' label='Count' min={ 0 } max={ dataMax } width='60' type='linear' showGrid
                style={ darkAxis } />
               <Charts>
                <LineChart axis='y' series={ series } columns={ yColumns } style={ style }
                  interpolation='curveBasis'/>
              </Charts>
            </ChartRow>
          </ChartContainer>
          <div style={{ justifyContent: 'flex-end' }}>
            <Legend type='line' style={ state.legendStyle } categories={ legend } align='right' stack={ false }/>
          </div>
        </div>
      );
    }

    return null;
  },

  getLegendStyle(columns, color) {
    const legendStyle = {};

    for (var i = 0; i < columns.length; i++) {
      legendStyle[columns[i]] = {
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
  }
}

export default Grapher