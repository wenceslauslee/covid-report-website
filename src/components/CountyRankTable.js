import BootstrapTable from 'react-bootstrap-table-next';
import { Component } from 'react';
import data from '../data/data.json';
import Formatter from '../utils/Formatter';
import React from 'react';
import Select from 'react-select';
import { Spinner } from 'react-bootstrap';
import _ from 'lodash';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

class CountyRankTable extends Component {
  constructor(props) {
    super(props);

    this.getCellStyle = this.getCellStyle.bind(this);
    this.onStateChange = this.onStateChange.bind(this);

    this.state = {
      data: [],
      validDate: '',
      timestamp: '',
      stateValues: [],
      stateValueInput: 'default',
      loading: true,
      sortable: false
    };

    this.rankingCache = {};
  }

  async componentDidMount() {
    await this.fetchAndProcessData('countyRanking', 0);

    const defaultValues = [{
      label: '-----',
      value: 'default'
    }];
    const dataValues = _.map(data.states, s => {
      return {
        label: s,
        value: s.toLowerCase()
      };
    });
    const stateValues = defaultValues.concat(dataValues);

    this.setState(prevState => ({
      ...prevState,
      stateValues: stateValues
    }));
  }

  fetchAndProcessData(infoKey, pageValue) {
    return fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/rank?infoKey=${infoKey}&pageValue=${pageValue}`)
      .then(res => res.json())
      .then(rdata => {
        this.processData(rdata, pageValue);
      })
      .catch(err => {
        console.log(err);
      });
  }

  processData(rdata, pageValue) {
    this.rankingCache = {};

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

      const activeDiff = (pageValue === 0) ?
        f.detailedInfo.activeRankPast - f.detailedInfo.activeRank :
        f.detailedInfo.localActiveRankPast - f.detailedInfo.localActiveRank;
      if (activeDiff !== 0) {
        f.countyDisplayName = `${f.countyName}, ${f.stateNameShortProper} (${Formatter.modifyChangeRank(activeDiff)})`;
        this.rankingCache[f.fips] = (activeDiff > 0);
      } else {
        f.countyDisplayName = `${f.countyName}, ${f.stateNameShortProper}`;
      }
    });

    const sortable = (pageValue !== 0);

    this.setState({
      data: filtered,
      validDate: rdata.reportDate,
      timestamp: rdata.reportTimestamp,
      loading: false,
      sortable: sortable
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

  getHeaderSortingStyle(column, sortOrder, isLastSorting, colIndex) {
    if (isLastSorting) {
      return {
        backgroundColor: '#c8e6c9'
      };
    }

    return {};
  }

  onStateChange(objects, action) {
    if (this.state.stateValueInput === objects.value) {
      return;
    }

    this.setState(prevState => ({
      ...prevState,
      stateValueInput: objects.value,
      loading: true
    }));

    if (objects.value === 'default') {
      this.fetchAndProcessData('countyRanking', 0);
    } else {
      this.fetchAndProcessData(objects.value, 1);
    }
  };

  render() {
    const columns = [
      {
        dataField: 'any',
        text: '#',
        formatter: this.indexN
      },
      {
        dataField: 'countyDisplayName',
        text: 'County',
        sort: this.state.sortable,
        headerSortingStyle: this.getHeaderSortingStyle,
        style: this.getCellStyle
      },
      {
        dataField: 'detailedInfo.activeCount',
        text: 'Case Count',
        sort: this.state.sortable,
        headerSortingStyle: this.getHeaderSortingStyle
      },
      {
        dataField: 'detailedInfo.activeChange',
        text: 'Daily Increase',
        sort: this.state.sortable,
        sortFunc: Formatter.sortFunc,
        headerSortingStyle: this.getHeaderSortingStyle
      },
      {
        dataField: 'detailedInfo.liveActiveChange',
        text: 'Live',
        sort: this.state.sortable,
        sortFunc: Formatter.sortFunc,
        headerSortingStyle: this.getHeaderSortingStyle,
        style: {
          color: '#ff0000',
          fontWeight: 'bold'
        }
      },
      {
        dataField: 'detailedInfo.activePercentage',
        text: '% Of People',
        sort: this.state.sortable,
        headerSortingStyle: this.getHeaderSortingStyle
      },
      {
        dataField: 'detailedInfo.deathCount',
        text: 'Death Count',
        sort: this.state.sortable
      },
      {
        dataField: 'detailedInfo.deathChange',
        text: 'Daily Increase',
        sort: this.state.sortable,
        sortFunc: Formatter.sortFunc,
        headerSortingStyle: this.getHeaderSortingStyle
      },
      {
        dataField: 'detailedInfo.liveDeathChange',
        text: 'Live',
        sort: this.state.sortable,
        sortFunc: Formatter.sortFunc,
        headerSortingStyle: this.getHeaderSortingStyle,
        style: {
          color: '#ff0000',
          fontWeight: 'bold'
        }
      },
      {
        dataField: 'detailedInfo.deathPercentage',
        text: '% Of People',
        sort: this.state.sortable,
        headerSortingStyle: this.getHeaderSortingStyle
      }
    ];

    const defaultSorted = [{
      dataField: 'detailedInfo.activeCount',
      order: 'desc'
    }];

    return (
      <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1000px' }}>
        <div style={{ display: 'flex' }}>
          <p align='left'>
            * New York City reflects data from all 5 counties combined. (Bronx, Kings, Manhattan, Queens, Richmond)
          </p>
        </div>
        <p align='left'>
          * All data (except live) reflects situation accurately up till
          <span style={{ 'fontWeight': 'bold'}}> { this.state.loading ? '---' : `${this.state.validDate} 23:59:59 EST` }</span>
          . Live reflects situation from then till now.
          <span style={{ 'fontStyle': 'italic', 'fontWeight': 'bold' }}> (Last updated: { this.state.loading ? '---' : Formatter.getTimestamp(this.state.timestamp) })
          </span>
        </p>
        <div style={{ paddingBottom: '20px', maxWidth: '150px' }}>
          <Select
            options={ this.state.stateValues }
            placeholder='Filter by state'
            SingleValue
            className='basic-single-select'
            onChange= { this.onStateChange }
          />
        </div>
        { this.state.loading ?
            <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1000px' }}>
              <Spinner animation='border' />
            </div> :
            <div>
              <BootstrapTable bootstrap4={ true } keyField='county-rank-table' data={ this.state.data }
                columns={ columns } defaultSorted={ defaultSorted }/>
            </div>
        }
      </div>
    );
  }
}

export default CountyRankTable;
