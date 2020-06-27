import BootstrapTable from 'react-bootstrap-table-next';
import { Component } from 'react';
import Formatter from '../utils/Formatter';
import React from 'react';
import { Spinner } from 'react-bootstrap';
import _ from 'lodash';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

class StateRankTable extends Component {
  constructor(props) {
    super(props);

    this.getCellStyle = this.getCellStyle.bind(this);

    this.state = {
      data: [],
      validDate: '',
      timestamp: '',
      loading: true
    };

    this.rankingCache = {};
  }

  componentDidMount() {
    fetch('https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/rank?infoKey=stateRanking')
      .then(res => res.json())
      .then(rdata => {
        const filtered = _.filter(rdata.rankByCases, d => {
          return d.stateNameFullProper !== /*'-----'*/null && d.detailedInfo.activePercentage !== 'NaN';
        });

        _.each(filtered, f => {
          if (f.detailedInfo.activeChange >= 0) {
            f.detailedInfo.activeChange = `+${f.detailedInfo.activeChange}`;
          }
          if (f.detailedInfo.liveActiveChange >= 0) {
            f.detailedInfo.liveActiveChange = `+${f.detailedInfo.liveActiveChange}`;
          }
          if (f.detailedInfo.deathChange >= 0) {
            f.detailedInfo.deathChange = `+${f.detailedInfo.deathChange}`;
          }
          if (f.detailedInfo.liveDeathChange >= 0) {
            f.detailedInfo.liveDeathChange = `+${f.detailedInfo.liveDeathChange}`;
          }

          f.detailedInfo.activePercentage = `${f.detailedInfo.activePercentage}%`;
          if (f.detailedInfo.deathPercentage === '0') {
            f.detailedInfo.deathPercentage = '< 0.01%';
          } else {
            f.detailedInfo.deathPercentage = `${f.detailedInfo.deathPercentage}%`;
          }

          const activeDiff = f.detailedInfo.activeRankPast - f.detailedInfo.activeRank;
          if (activeDiff !== 0) {
            f.stateNameFullProper = `${f.stateNameFullProper} (${Formatter.modifyChangeRank(activeDiff)})`;
            this.rankingCache[f.fips] = (activeDiff > 0);
          }
        });

        this.setState({
          data: filtered,
          validDate: rdata.reportDate,
          timestamp: rdata.reportTimestamp,
          loading: false
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  indexN(cell, row, rowIndex) {
    return (<div>{ rowIndex + 1 }</div>);
  }

  getCellStyle(cell, row, rowIndex, colIndex) {
    var color = 'black';

    if (Object.prototype.hasOwnProperty.call(this.rankingCache, row.fips)) {
      color = this.rankingCache[row.fips] ? 'red' : 'green';
    }

    return {
      color: color
    };
  }

  render() {
    const headerSortingStyle = { backgroundColor: '#c8e6c9' };
    const columns = [
      {
        dataField: 'any',
        text: '#',
        formatter: this.indexN
      },
      {
        dataField: 'stateNameFullProper',
        text: 'State',
        sort: true,
        headerSortingStyle,
        style: this.getCellStyle
      },
      {
        dataField: 'detailedInfo.activeCount',
        text: 'Case Count',
        sort: true,
        headerSortingStyle
      },
      {
        dataField: 'detailedInfo.activeChange',
        text: 'Daily Increase',
        sort: true,
        sortFunc: (a, b, order, dataField) => {
          if (order === 'asc') {
            return parseInt(a) - parseInt(b);
          }
          return parseInt(b) - parseInt(a);
        },
        headerSortingStyle
      },
      {
        dataField: 'detailedInfo.liveActiveChange',
        text: 'Live',
        sort: true,
        sortFunc: (a, b, order, dataField) => {
          if (order === 'asc') {
            return parseInt(a) - parseInt(b);
          }
          return parseInt(b) - parseInt(a);
        },
        headerSortingStyle,
        style: {
          color: '#ff0000',
          fontWeight: 'bold'
        }
      },
      {
        dataField: 'detailedInfo.activePercentage',
        text: '% Of People',
        sort: true,
        headerSortingStyle
      },
      {
        dataField: 'detailedInfo.deathCount',
        text: 'Death Count',
        sort: true,
        headerSortingStyle
      },
      {
        dataField: 'detailedInfo.deathChange',
        text: 'Daily Increase',
        sort: true,
        sortFunc: (a, b, order, dataField) => {
          if (order === 'asc') {
            return parseInt(a) - parseInt(b);
          }
          return parseInt(b) - parseInt(a);
        },
        headerSortingStyle
      },
      {
        dataField: 'detailedInfo.liveDeathChange',
        text: 'Live',
        sort: true,
        sortFunc: (a, b, order, dataField) => {
          if (order === 'asc') {
            return parseInt(a) - parseInt(b);
          }
          return parseInt(b) - parseInt(a);
        },
        headerSortingStyle,
        style: {
          color: '#ff0000',
          fontWeight: 'bold'
        }
      },
      {
        dataField: 'detailedInfo.deathPercentage',
        text: '% Of People',
        sort: true,
        headerSortingStyle
      }
    ];

    const defaultSorted = [{
      dataField: 'detailedInfo.activeCount',
      order: 'desc'
    }];

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
            * All data (except live) reflects situation accurately up till
            <span style={{ 'fontWeight': 'bold'}}> { this.state.validDate } 23:59:59 EST</span>
            . Live reflects situation from then till now.
            <span style={{ 'fontStyle': 'italic', 'fontWeight': 'bold' }}> (Last updated: { Formatter.getTimestamp(this.state.timestamp) })
            </span>
          </p>
          <BootstrapTable bootstrap4={ true } keyField='state-rank-table'
            data={ this.state.data } columns={ columns } defaultSorted={ defaultSorted }>
          </BootstrapTable>
        </div>
      );
    }
  }
}

export default StateRankTable;
