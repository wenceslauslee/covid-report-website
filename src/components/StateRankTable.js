import { Component } from 'react';
import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import _ from 'lodash';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

class StateRankTable extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      validDate: ''
    };
  }

  componentDidMount() {
    fetch('https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/rank?infoKey=stateRanking')
      .then(res => res.json())
      .then(rdata => {
        const filtered = _.filter(rdata.rankByCases, d => {
          return d.stateNameFullProper !== /*'-----'*/null && d.detailedInfo.activePercentage !== 'NaN';
        });
        _.each(filtered, f => {
          f.detailedInfo.activeRankChange = f.detailedInfo.activeRankPast - f.detailedInfo.activeRank;
          f.detailedInfo.deathRankChange = f.detailedInfo.deathRankPast - f.detailedInfo.deathRank;
        })
        this.setState({
          data: filtered,
          validDate: rdata.reportDate
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    const columns = [
      {
        dataField: 'stateNameFullProper',
        text: 'State',
        sort: true
      },
      {
        dataField: 'detailedInfo.activeRankChange',
        text: '-'
      },
      {
        dataField: 'detailedInfo.activeCount',
        text: 'Case Count',
        sort: true
      },
      {
        dataField: 'detailedInfo.activeChange',
        text: 'Case Count Change',
        sort: true
      },
      {
        dataField: 'detailedInfo.deathRankChange',
        text: '-'
      },
      {
        dataField: 'detailedInfo.deathCount',
        text: 'Death Count',
        sort: true
      },
      {
        dataField: 'detailedInfo.activePercentage',
        text: 'Pop %',
        sort: true
      }
    ];

    const defaultSorted = [{
      dataField: 'stateNameFullProper',
      order: 'asc'
    }];

    return (
      <div>
        <p align="left"> * Data reflects situation at <span style={{ 'font-weight': 'bold'}}>{ this.state.validDate } 23:59:59 PM EST</span>.</p>
        <BootstrapTable bootstrap4="true" keyField='state-rank-table'
          data={ this.state.data } columns={ columns } defaultSorted={ defaultSorted }/>
      </div>
    );
  }
}

export default StateRankTable;
