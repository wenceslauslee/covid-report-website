import { Component } from 'react';
import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
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
          f.detailedInfo.activeRankChange =
            this.modifyChangeRank(f.detailedInfo.activeRankPast - f.detailedInfo.activeRank);
          f.detailedInfo.deathRankChange =
            this.modifyChangeRank(f.detailedInfo.deathRankPast - f.detailedInfo.deathRank);

          if (f.detailedInfo.activeChange >= 0) {
            f.detailedInfo.activeChange = `+${f.detailedInfo.activeChange}`;
          }

          f.detailedInfo.activePercentage = f.detailedInfo.activePercentage + '%';
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

  modifyChangeRank(rankChange) {
    if (rankChange > 0) {
      return `↑${rankChange}`;
    } else if (rankChange < 0) {
      return `↓${Math.abs(rankChange)}`;
    }
    return '-';
  }

  getCellStyle(cell, row, rowIndex, colIndex) {
    var colorToUse = '';
    if (cell.startsWith('↑')) {
      colorToUse = 'red';
    } else if (cell.startsWith('↓')) {
      colorToUse = 'green';
    } else {
      colorToUse = 'black';
    }

    return {
      color: colorToUse
    };
  }

  render() {
    const columns = [
      {
        dataField: 'stateNameFullProper',
        text: 'State'
      },
      {
        dataField: 'detailedInfo.activeCount',
        text: 'Case Count'
      },
      {
        dataField: 'detailedInfo.activeRankChange',
        text: '-',
        style: this.getCellStyle
      },
      {
        dataField: 'detailedInfo.activeChange',
        text: 'Case Count Change'
      },
      {
        dataField: 'detailedInfo.deathCount',
        text: 'Death Count'
      },
      {
        dataField: 'detailedInfo.deathRankChange',
        text: '-',
        style: this.getCellStyle
      },
      {
        dataField: 'detailedInfo.activePercentage',
        text: 'Pop %'
      }
    ];

    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        Showing { from } to { to } of { size } Results
      </span>
    );

    const options = {
      paginationSize: 4,
      pageStartIndex: 0,
      // alwaysShowAllBtns: true, // Always show next and previous button
      // withFirstAndLast: false, // Hide the going to First and Last page button
      hideSizePerPage: true, // Hide the sizePerPage dropdown always
      // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
      firstPageText: 'First',
      prePageText: 'Back',
      nextPageText: 'Next',
      lastPageText: 'Last',
      nextPageTitle: 'First page',
      prePageTitle: 'Pre page',
      firstPageTitle: 'Next page',
      lastPageTitle: 'Last page',
      showTotal: true,
      paginationTotalRenderer: customTotal,
      disablePageTitle: true,
      sizePerPageList: [{
        text: '25', value: 25
      }, {
        text: '50', value: 50
      }] // A numeric array is also available. the purpose of above example is custom the text
    };

    return (
      <div>
        <p align="left"> * Data reflects situation at <span style={{ 'fontWeight': 'bold'}}>{ this.state.validDate } 23:59:59 PM EST</span>.</p>
        <BootstrapTable bootstrap4={ true } keyField='county-rank-table'
          data={ this.state.data } columns={ columns } defaultSorted={ defaultSorted } pagination={ paginationFactory(options) }/>
      </div>
    );
  }
}

export default StateRankTable;
