import BootstrapTable from 'react-bootstrap-table-next';
import { Component } from 'react';
import Formatter from '../utils/Formatter';
import React from 'react';
import { Spinner } from 'react-bootstrap';
import _ from 'lodash';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

class CountyRankTable extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      validDate: '',
      timestamp: '',
      loading: true
    };
  }

  async componentDidMount() {
    var i = 0;
    while (i < 1) {
      await this.fetchAndProcessData(i);
      i++;
    }
  }

  fetchAndProcessData(pageValue) {
    return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/rank?infoKey=countyRanking&pageValue=${pageValue}`)
      .then(res => res.json())
      .then(rdata => {
        this.processData(rdata, pageValue);
      })
      .catch(err => {
        console.log(err);
      });
  }

  processData(rdata, pageValue) {
    const filtered = _.filter(rdata.rankByCases, d => {
      return d.stateNameFullProper !== /*'-----'*/null && d.detailedInfo.activePercentage !== 'NaN';
    });

    _.each(filtered, f => {
      f.countyDisplayName = `${f.countyName}, ${f.stateNameShortProper}`;
      f.detailedInfo.activeRankChange =
        Formatter.modifyChangeRank(f.detailedInfo.activeRankPast - f.detailedInfo.activeRank);
      f.detailedInfo.deathRankChange =
        Formatter.modifyChangeRank(f.detailedInfo.deathRankPast - f.detailedInfo.deathRank);

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
    });

    this.setState({
      data: this.state.data.concat(filtered),
      validDate: rdata.reportDate,
      timestamp: rdata.reportTimestamp,
      loading: false
    });
  }

  indexN(cell, row, rowIndex) {
    return (<div>{ rowIndex + 1 }</div>);
  }

  render() {
    const columns = [
      {
        dataField: 'any',
        text: '#',
        formatter: this.indexN
      },
      {
        dataField: 'countyDisplayName',
        text: 'County'
      },
      {
        dataField: 'detailedInfo.activeCount',
        text: 'Case Count'
      },
      {
        dataField: 'detailedInfo.activeRankChange',
        text: '-',
        style: Formatter.getCellStyle
      },
      {
        dataField: 'detailedInfo.activeChange',
        text: 'Daily Increase'
      },
      {
        dataField: 'detailedInfo.liveActiveChange',
        text: 'Live',
        style: {
          color: '#ff0000',
          fontWeight: 'bold'
        }
      },
      {
        dataField: 'detailedInfo.activePercentage',
        text: '% Of People'
      },
      {
        dataField: 'detailedInfo.deathCount',
        text: 'Death Count'
      },
      {
        dataField: 'detailedInfo.liveDeathChange',
        text: 'Live',
        style: {
          color: '#ff0000',
          fontWeight: 'bold'
        }
      },
      {
        dataField: 'detailedInfo.deathRankChange',
        text: '-',
        style: Formatter.getCellStyle
      },
      {
        dataField: 'detailedInfo.deathChange',
        text: 'Daily Increase',
      },
      {
        dataField: 'detailedInfo.deathPercentage',
        text: '% Of People'
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
            * New York City reflects data from all 5 counties combined. (Bronx, Kings, Manhattan, Queens, Richmond)
          </p>
          <p align='left'>
            * All data (except live) reflects situation accurately up till
            <span style={{ 'fontWeight': 'bold'}}> { this.state.validDate } 23:59:59 EST</span>
            . Live reflects situation from then till now.
            <span style={{ 'fontStyle': 'italic', 'fontWeight': 'bold' }}> (Last updated: { Formatter.getTimestamp(this.state.timestamp) })
            </span>
          </p>
          <BootstrapTable bootstrap4={ true } keyField='county-rank-table'
            data={ this.state.data } columns={ columns }/>
        </div>
      );
    }
  }
}

export default CountyRankTable;
