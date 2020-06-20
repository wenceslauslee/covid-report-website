import { Component } from 'react';
import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { Spinner } from 'react-bootstrap';
import _ from 'lodash';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

class USOverallTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      validDate: '',
      loading: true,
      dataPoints: []
    };
  }

  componentDidMount() {
    fetch('https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=state&key=usa')
      .then(res => res.json())
      .then(rdata => {
        this.setState({
          data: [{
            country: 'USA',
            activeCount: rdata.detailedInfo.activeCount,
            activeChange: `+${rdata.detailedInfo.activeChange}`,
            deathCount: rdata.detailedInfo.deathCount,
            deathChange: `+${rdata.detailedInfo.deathChange}`
          }],
          validDate: rdata.currentDate,
          loading: false,
          dataPoints: rdata.dataPoints
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  getDetailedGraph() {
    if (this.state.showTable && !this.state.loading) {
      const series = new TimeSeries(
        {
          name: "CovidStats",
          columns: ["time", "cases", "deaths", "increase"],
          points: this.state.dataPoints
        }
      );
      const style = styler([
        { key: "time", color: "#0000ff", width: 1 },
        { key: "cases", color: "#0000ff", width: 1 },
        { key: "deaths", color: "#ff0000", width: 1 },
        { key: "increase", color: "#ff0000", width: 1 },
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
        <ChartContainer title='Case/Death Counts and Daily Case Increases' timeRange={ series.range() }
          width={ 600 } showGrid={ true } titleStyle={{ fill: '#000000', fontWeight: 500 }} timeAxisStyle={ darkAxis }
          minTime={ series.range().begin() } maxTime={ series.range().end() } timeAxisTickCount={ 5 }
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
      </div>;
    }

    return null;
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
          <Spinner animation="border" />
        </div>
      );
    } else {
      return (
        <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1000px' }}>
          <p align="left"> * Data reflects situation at <span style={{ 'fontWeight': 'bold'}}>{ this.state.validDate } 23:59:59 PM EST</span>.</p>
          <BootstrapTable bootstrap4={ true } keyField='us-overall-table'
            data={ this.state.data } columns={ columns }>
          </BootstrapTable>
          <div style={{ display: 'flex', minWidth: '1200px' }}>
            <div style={{ 'marginTop': '30px', 'marginBottom': '10px' }}>
              { this.getCaseCountGraph() }
            </div>
            <div style={{ marginLeft: '30px', marginTop: '30px', marginBottom: '10px' }}>
              { this.getCaseCountIncreaseGraph() }
            </div>
        </div>
        </div>
      );
    }
  }
}

export default USOverallTable;
