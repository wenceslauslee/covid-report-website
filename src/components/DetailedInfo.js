import BootstrapTable from 'react-bootstrap-table-next';
import Button from 'react-bootstrap/Button';
import { Component } from 'react';
import Form from 'react-bootstrap/Form';
import React from 'react';
import Select from 'react-select';
import _ from 'lodash';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

class DetailedInfo extends Component {
  constructor(props) {
    super(props);
    this.enterPostalCode = this.enterPostalCode.bind(this);
    this.submitPostalCode = this.submitPostalCode.bind(this);

    this.state = {
      showTable: false,
      tableInfo: {},
      postalCodeValueInput: '',
      postalCodeErrorMessage: '',
      countyStateName: ''
    };
  }

  componentDidMount() {

  }

  getDetailedTable() {
    if (this.state.showTable) {
      const columns = [
        {
          dataField: 'key',
          text: ''
        },
        {
          dataField: 'value',
          text: this.state.countyStateName
        }
      ];

      return <BootstrapTable bootstrap4={ true } keyField='detailed-table'
        data={ this.state.tableInfo } columns={ columns }>
        </BootstrapTable>
    }

    return null;
  }

  enterPostalCode(event) {
    const value = event.target.value;
    this.setState(prevState => ({
      ...prevState,
      postalCodeValueInput: value
    }));
  }

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

        const tableData = [
          {
            key: "Active case count",
            value: rdata.detailedInfo.activeCount
          },
          {
            key: "Active case count change",
            value: rdata.detailedInfo.activeChange
          },
          {
            key: "Active count of population %",
            value: rdata.detailedInfo.activePercentage
          },
          {
            key: "Active case rankings by county",
            value: rdata.detailedInfo.activeRank
          },
          {
            key: "Active case rankings by county change",
            value: rdata.detailedInfo.activeRank
          },
          {
            key: "Death count",
            value: rdata.detailedInfo.deathCount
          },
          {
            key: "Death count change over a day",
            value: rdata.detailedInfo.deathChange
          },
          {
            key: "Death count of population %",
            value: rdata.detailedInfo.deathPercentage
          },
          {
            key: "Death count rankings by county",
            value: rdata.detailedInfo.deathRank
          },
          {
            key: "Death count rankings by county change",
            value: rdata.detailedInfo.deathRank
          }
        ]

        this.setState(prevState => ({
          ...prevState,
          postalCodeErrorMessage: '',
          showTable: true,
          tableInfo: tableData,
          countyStateName: `${rdata.countyName}, ${rdata.stateNameFull}`
        }));
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <div>
        <div style={{ display: "flex" }}>
          <Form style={{ display: "flex" }}>
            <Form.Control type="postal" placeholder="Enter postal code" onChange={ this.enterPostalCode } value={ this.state.postalCodeValueInput }/>
            <Button variant="primary" type="submit" style={{ 'margin-left': '10px' }} onClick={ this.submitPostalCode }>
              Submit
            </Button>
          </Form>
          <p style={{ 'margin-left': '25px' }}> { this.state.postalCodeErrorMessage }</p>
        </div>
        <div style={{ 'margin-top': '10px', 'margin-bottom': '10px' }}>
          <p>OR</p>
        </div>
        <div style={{ display: "flex" }}>
          <Form>
            <Form.Control type="state" placeholder="Enter state" />
          </Form>
          <Button variant="primary" type="submit" style={{ 'margin-left': '10px' }}>
            Submit
          </Button>
        </div>
        <div style={{ 'margin-top': '10px', 'margin-bottom': '10px' }}>
          <p>OR</p>
        </div>
        <div style={{ display: "flex" }}>
          <Form>
            <Form.Control type="state" placeholder="Enter state" />
          </Form>
          <Form style={{ 'margin-left': '10px' }}>
            <Form.Control type="county" placeholder="Enter county" />
          </Form>
          <Button variant="primary" type="submit" style={{ 'margin-left': '10px' }}>
            Submit
          </Button>
        </div>
        <div style={{ 'margin-top': '30px', 'margin-bottom': '10px' }}>
          { this.getDetailedTable() }
        </div>
        <div style={{ 'margin-top': '30px', 'margin-bottom': '10px' }}>
          <p>MORE INFORMATION TO COME! WIP!</p>
        </div>
      </div>
    );
  }
}

export default DetailedInfo;
