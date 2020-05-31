import BootstrapTable from 'react-bootstrap-table-next';
import { Component } from 'react';
import React from 'react';
import Formatter from '../utils/Formatter';
// import paginationFactory from 'react-bootstrap-table2-paginator';
import _ from 'lodash';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
// import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

class StateRankTable extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      validDate: ''
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
      if (f.detailedInfo.deathChange >= 0) {
        f.detailedInfo.deathChange = `+${f.detailedInfo.deathChange}`;
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
      validDate: rdata.reportDate
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
        text: 'Daily Change'
      },
      {
        dataField: 'detailedInfo.activePercentage',
        text: 'Case Pop %'
      },
      {
        dataField: 'detailedInfo.deathCount',
        text: 'Death Count'
      },
      {
        dataField: 'detailedInfo.deathRankChange',
        text: '-',
        style: Formatter.getCellStyle
      },
      {
        dataField: 'detailedInfo.deathChange',
        text: 'Daily Change',
      },
      {
        dataField: 'detailedInfo.deathPercentage',
        text: 'Death Pop %'
      }
    ];

    /* const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        Showing { from } to { to } of { size } Results
      </span>
    );

    const options = {
      pageStartIndex: 0,
      hideSizePerPage: true,
      firstPageText: 'First',
      prePageText: 'Back',
      nextPageText: 'Next',
      lastPageText: 'Last',
      nextPageTitle: 'First page',
      prePageTitle: 'Pre page',
      firstPageTitle: 'Next page',
      lastPageTitle: 'Last page',
      showTotal: true,
      sizePerPage: 50,
      paginationTotalRenderer: customTotal,
      disablePageTitle: true
    }; */

    return (
      <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1000px' }}>
        <p align="left"> * Data reflects situation at <span style={{ 'fontWeight': 'bold'}}>{ this.state.validDate } 23:59:59 PM EST</span>.</p>
        <p align="left"> * New York City reflects data from all 5 counties combined. (Bronx, Kings, Manhattan, Queens, Richmond)</p>
        <BootstrapTable bootstrap4={ true } keyField='county-rank-table'
          data={ this.state.data } columns={ columns }/>
      </div>
    );
  }
}

export default StateRankTable;
