import BootstrapTable from 'react-bootstrap-table-next';
import Button from 'react-bootstrap/Button';
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
    this.refresh = this.refresh.bind(this);

    this.state = {
      initialLoading: true,
      loading: true
    };

    this.rankingCache = {};
    this.data = {};
    this.columns = this.initializeColumns();
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    this.rankingCache = {};

    fetch('https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/rank?infoKey=stateRanking')
      .then(res => res.json())
      .then(rdata => {
        const filtered = _.filter(rdata.rankByCases, d => {
          return d.stateNameFullProper !== '-----' && d.detailedInfo.activePercentage !== 'NaN';
        });

        _.each(filtered, f => {
          if (f.detailedInfo.activeChange >= 0) {
            f.dangerColor = Formatter.getDangerColorRanking(f.detailedInfo.averageActiveChange, f.detailedInfo.population);
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

        this.data.detailedInfo = filtered;
        this.data.validDate = rdata.reportDate;
        this.data.timestamp = rdata.reportTimestamp;

        this.setState({
          initialLoading: false,
          loading: false
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  initializeColumns() {
    const headerSortingStyle = { backgroundColor: '#c8e6c9' };

    return [
      {
        dataField: 'any',
        text: '#',
        formatter: this.indexN,
        style: this.getIndexStyle
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
        sortFunc: Formatter.sortFunc,
        headerSortingStyle
      },
      {
        dataField: 'detailedInfo.liveActiveChange',
        text: 'Live',
        sort: true,
        sortFunc: Formatter.sortFunc,
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
        sortFunc: Formatter.sortPercentage,
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
        sortFunc: Formatter.sortFunc,
        headerSortingStyle
      },
      {
        dataField: 'detailedInfo.liveDeathChange',
        text: 'Live',
        sort: true,
        sortFunc: Formatter.sortFunc,
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
        sortFunc: Formatter.sortPercentage,
        headerSortingStyle
      }
    ];
  }

  indexN(cell, row, rowIndex) {
    return (<div>{ rowIndex + 1 }</div>);
  }

  getIndexStyle(cell, row, rowIndex, colIndex) {
    return { backgroundColor: row.dangerColor };
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

  refresh() {
    this.setState(prevState => ({
      ...prevState,
      loading: true
    }));

    this.fetchData();
  }

  render() {
    const defaultSorted = [{
      dataField: 'detailedInfo.activeCount',
      order: 'desc'
    }];

    if (this.state.initialLoading) {
      return (
        <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1000px' }}>
          <Spinner animation='border' />
        </div>
      );
    }

    return (
      <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1000px' }}>
        <div>
          <div style={{ display: 'flex' }}>
            <p align='left'>
              * First column index coloring indicates COVID-19 risks as defined <a href='https://www.npr.org/sections/health-shots/2020/07/01/885263658/green-yellow-orange-or-red-this-new-tool-shows-covid-19-risk-in-your-county'>here</a>.
            </p>
          </div>
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
          { this.state.loading ?
              <div style={{ marginLeft: '20px' }}>
                <Spinner animation='border' />
              </div> :
              ''
          }
        </div>
        <div style={{ marginTop: '20px' }}>
          <BootstrapTable bootstrap4={ true } keyField='state-rank-table'
            data={ this.data.detailedInfo } columns={ this.columns } defaultSorted={ defaultSorted }>
          </BootstrapTable>
        </div>
      </div>
    );
  }
}

export default StateRankTable;
