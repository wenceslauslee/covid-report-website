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
      loading: true
    };
  }

  componentDidMount() {
    fetch('https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/rank?infoKey=stateRanking')
      .then(res => res.json())
      .then(rdata => {
        const filtered = _.filter(rdata.rankByCases, d => {
          return d.stateNameFullProper !== /*'-----'*/null && d.detailedInfo.activePercentage !== 'NaN';
        });

        var activeCount = 0;
        var activeChange = 0;
        var deathCount = 0;
        var deathChange = 0;
        _.each(filtered, f => {
          activeCount += f.detailedInfo.activeCount;
          activeChange += f.detailedInfo.activeChange;
          deathCount += f.detailedInfo.deathCount;
          deathChange += f.detailedInfo.deathChange;
        })
        this.setState({
          data: [{
            country: 'USA',
            activeCount: activeCount,
            activeChange: `+${activeChange}`,
            deathCount: deathCount,
            deathChange: `+${deathChange}`
          }],
          validDate: rdata.reportDate,
          loading: false
        });
      })
      .catch(err => {
        console.log(err);
      });
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
        </div>
      );
    }
  }
}

export default USOverallTable;
