import BootstrapTable from 'react-bootstrap-table-next';
import Button from 'react-bootstrap/Button';
import { Charts, ChartContainer, ChartRow, YAxis, LineChart, Legend, styler } from "react-timeseries-charts";
import { Component } from 'react';
import data from '../data/data.json';
import Form from 'react-bootstrap/Form';
import React from 'react';
import Select from 'react-select';
import Formatter from '../utils/Formatter';
import { TimeSeries } from 'pondjs';
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
      date: ''
    };
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
    return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=postal&key=${postalCode}`)
      .then(res => res.json())
      .then(rdata => {
        if (rdata.fips === null || rdata.fips === undefined) {
          this.setState(prevState => ({
            ...prevState,
            postalCodeErrorMessage: `'${postalCode}' is not a valid postal code.`,
            showTable: false
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
          date: `As of: ${rdata.currentDate} 23:59:59 PM EST`
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
          date: `As of: ${rdata.currentDate} 23:59:59 PM EST`
        }));
      })
      .catch(err => {
        console.log(err);
      });
  }

  async submitStateCounty(event) {
    event.preventDefault();

    const fips = this.state.countyValueFips;
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
          date: `As of: ${rdata.currentDate} 23:59:59 PM EST`
        }));
      })
      .catch(err => {
        console.log(err);
      });
  }

  getTableData(rdata) {
    return [
      {
        key: "Active case count",
        value: rdata.detailedInfo.activeCount
      },
      {
        key: "Active case count change over a day",
        value: (rdata.detailedInfo.activeChange >= 0) ? `+${rdata.detailedInfo.activeChange}` : rdata.detailedInfo.activeChange
      },
      {
        key: "Active count of population %",
        value: rdata.detailedInfo.activePercentage
      },
      {
        key: "Active case rankings",
        value: rdata.detailedInfo.activeRank
      },
      {
        key: "Change in active case rankings",
        value: Formatter.modifyChangeRank(rdata.detailedInfo.activeRankPast - rdata.detailedInfo.activeRank)
      },
      {
        key: "Death count",
        value: rdata.detailedInfo.deathCount
      },
      {
        key: "Death count change over a day",
        value: (rdata.detailedInfo.deathChange >= 0) ? `+${rdata.detailedInfo.deathChange}` : rdata.detailedInfo.deathChange
      },
      {
        key: "Death count of population %",
        value: rdata.detailedInfo.deathPercentage
      },
      {
        key: "Death count rankings",
        value: rdata.detailedInfo.deathRank
      },
      {
        key: "Change in death count rankings",
        value: Formatter.modifyChangeRank(rdata.detailedInfo.deathRankPast - rdata.detailedInfo.deathRank)
      }
    ];
  }

  getDetailedTable() {
    if (this.state.showTable) {
      const columns = [
        {
          dataField: 'key',
          text: this.state.date
        },
        {
          dataField: 'value',
          text: this.state.countyStateName,
          style: Formatter.getCellStyle
        }
      ];

      return <BootstrapTable bootstrap4={ true } keyField='detailed-table'
        data={ this.state.tableInfo } columns={ columns }>
        </BootstrapTable>
    }

    return null;
  }

  getDetailedGraph() {
    if (this.state.showTable) {
      const series = new TimeSeries(
        {
          name: "CovidStats",
          columns: ["time", "cases", "deaths"],
          points: [
            [1590624000000, 100000, 10000],
            [1590710400000, 200000, 10100],
            [1590796800000, 302000, 10200],
            [1590883200000, 403000, 10300],
          ]
        }
      );
      /*const style = {
        cases: {
          width: 2,
          stroke: 'steelblue',
          opacity: 0.25
        },
        deaths: {
          width: 2,
          stroke: 'red',
          opacity: 0.25
        }
      };*/
      const style = styler([
        { key: "cases", color: "#0000ff", width: 1 },
        { key: "deaths", color: "#ff0000", width: 1 }
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
          key: 'cases',
          label: 'Case Counts'
        },
        {
          key: 'deaths',
          label: 'Death Counts'
        }
      ];

      return <div>
        <ChartContainer title='Case/Death Counts and Daily Case Increases' timeRange={ series.range() }
        width={ 600 } showGrid={ true } titleStyle={{ fill: '#000000', fontWeight: 500 }}
        timeAxisStyle={ darkAxis }>
          <ChartRow height='400'>
            <YAxis id="y" label="Count" min={ 0 } max={ 1000000 } width="60" type="linear" showGrid
              style={ darkAxis } />
             <Charts>
              <LineChart axis="y" series={ series } columns={ ['cases', 'deaths'] } style={ style }
                interpolation='curveBasis'/>
            </Charts>
          </ChartRow>
        </ChartContainer>
        <div style={{ justifyContent: 'flex-end' }}>
          <Legend type="line" style={ style } categories={ legend } align='right'/>
        </div>
      </div>;
    }

    return null;
  }

  render() {
    return (
      <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1200px' }}>
        <div style={{ display: "flex" }}>
          <Form style={{ display: "flex" }}>
            <Form.Control type="postal" placeholder="Enter postal code..." onChange={ this.onChangePostalCode } value={ this.state.postalCodeValueInput }/>
            <Button variant="primary" type="submit" style={{ 'marginLeft': '10px' }} onClick={ this.submitPostalCode }>
              Submit
            </Button>
          </Form>
          <p style={{ 'marginLeft': '25px' }}> { this.state.postalCodeErrorMessage }</p>
        </div>
        <div style={{ display: "flex", marginTop: '25px' }}>
          <Select
            options={ this.state.stateValues }
            placeholder="Select a state..."
            SingleValue
            className="basic-single-select"
            onChange= { this.onStateChange1 }
          />
          <Button variant="primary" type="submit" style={{ 'marginLeft': '10px' }} onClick={ this.submitState }>
            Submit
          </Button>
        </div>
        <div style={{ display: "flex", marginTop: '25px' }}>
          <Select
            options={ this.state.stateValues }
            placeholder="Select a state..."
            SingleValue
            className="basic-single-select"
            onChange= { this.onStateChange2 }
          />
          <div style={{ marginLeft: '10px' }}>
            <Select
              options={ this.state.countyValues }
              placeholder="Select a county..."
              SingleValue
              className="basic-single-select"
              onChange= { this.onCountyChange }
              value={ this.state.countyValueInput }
            />
          </div>
          <Button variant="primary" type="submit" style={{ 'marginLeft': '10px' }} onClick= {this.submitStateCounty }>
            Submit
          </Button>
        </div>
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
