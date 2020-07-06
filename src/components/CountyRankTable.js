import BootstrapTable from 'react-bootstrap-table-next';
import Button from 'react-bootstrap/Button';
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
    this.refresh = this.refresh.bind(this);

    this.state = {
      initialLoading: true,
      loading: true,
      sortable: false
    };

    this.rankingCache = {};
    this.data = {};
  }

  componentDidMount() {
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
    this.data.stateValues = defaultValues.concat(dataValues);
    this.data.stateValueInput = 'default';

    this.fetchAndProcessData('countyRanking', 0);
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

    this.data.detailedInfo = filtered;
    this.data.validDate = rdata.reportDate;
    this.data.timestamp = rdata.reportTimestamp;

    this.setState({
      initialLoading: false,
      loading: false,
      sortable: sortable
    });
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

  onStateChange(objects, action) {
    if (this.data.stateValueInput === objects.value) {
      return;
    }

    this.data.stateValueInput = objects.value;

    this.refresh();
  };

  refresh(stateValueInput) {
    this.setState(prevState => ({
      ...prevState,
      loading: true
    }));

    if (this.data.stateValueInput === 'default') {
      this.fetchAndProcessData('countyRanking', 0);
    } else {
      this.fetchAndProcessData(this.data.stateValueInput, 1);
    }
  }

  render() {
    const backgroundColor = { backgroundColor: '#c8e6c9' };
    const columns = [
      {
        dataField: 'any',
        text: '#',
        formatter: this.indexN,
        style: this.getIndexStyle
      },
      {
        dataField: 'countyDisplayName',
        text: 'County',
        sort: this.state.sortable,
        headerSortingStyle: backgroundColor,
        style: this.getCellStyle
      },
      {
        dataField: 'detailedInfo.activeCount',
        text: 'Case Count',
        sort: this.state.sortable,
        headerSortingStyle: backgroundColor
      },
      {
        dataField: 'detailedInfo.activeChange',
        text: 'Daily Increase',
        sort: this.state.sortable,
        sortFunc: Formatter.sortFunc,
        headerSortingStyle: backgroundColor
      },
      {
        dataField: 'detailedInfo.liveActiveChange',
        text: 'Live',
        sort: this.state.sortable,
        sortFunc: Formatter.sortFunc,
        headerSortingStyle: backgroundColor,
        style: {
          color: '#ff0000',
          fontWeight: 'bold'
        }
      },
      {
        dataField: 'detailedInfo.activePercentage',
        text: '% Of People',
        sort: this.state.sortable,
        headerSortingStyle: backgroundColor
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
        headerSortingStyle: backgroundColor
      },
      {
        dataField: 'detailedInfo.liveDeathChange',
        text: 'Live',
        sort: this.state.sortable,
        sortFunc: Formatter.sortFunc,
        headerSortingStyle: backgroundColor,
        style: {
          color: '#ff0000',
          fontWeight: 'bold'
        }
      },
      {
        dataField: 'detailedInfo.deathPercentage',
        text: '% Of People',
        sort: this.state.sortable,
        headerSortingStyle: backgroundColor
      }
    ];

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
        <div style={{ display: 'flex' }}>
          <p align='left'>
            * New York City reflects data from all 5 counties combined. (Bronx, Kings, Manhattan, Queens, Richmond)<br/>
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
        <div style={{ paddingBottom: '20px', maxWidth: '150px', display: 'flex' }}>
          <Select
            options={ this.data.stateValues }
            placeholder='Filter by state'
            SingleValue
            className='basic-single-select'
            onChange={ this.onStateChange }
            isDisabled={ this.state.loading }
          />
          <Button style={{ marginLeft: '10px' }} variant='secondary' onClick={ this.refresh }>Refresh</Button>
          { this.state.loading ?
              <div style={{ marginLeft: '20px' }}>
                <Spinner animation='border' />
              </div> :
              ''
          }
        </div>
        <div>
          <BootstrapTable bootstrap4={ true } keyField='county-rank-table' data={ this.data.detailedInfo }
            columns={ columns } defaultSorted={ defaultSorted }/>
        </div>
      </div>
    );
  }
}

export default CountyRankTable;
