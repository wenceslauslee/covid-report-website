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

        _.each(filtered, f => {
          f.detailedInfo.activeRankChange =
            this.modifyChangeRank(f.detailedInfo.activeRankPast - f.detailedInfo.activeRank);
          f.detailedInfo.deathRankChange =
            this.modifyChangeRank(f.detailedInfo.deathRankPast - f.detailedInfo.deathRank);

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
        })
        this.setState({
          data: filtered,
          validDate: rdata.reportDate,
          loading: false
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

  indexN(cell, row, rowIndex) {
    return (<div>{ rowIndex + 1 }</div>);
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
        headerSortingStyle
      },
      {
        dataField: 'detailedInfo.activeCount',
        text: 'Case Count',
        sort: true,
        headerSortingStyle
      },
      {
        dataField: 'detailedInfo.activeRankChange',
        text: '-',
        style: this.getCellStyle
      },
      {
        dataField: 'detailedInfo.activeChange',
        text: 'Daily Change',
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
        dataField: 'detailedInfo.activePercentage',
        text: 'Case Pop %',
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
        dataField: 'detailedInfo.deathRankChange',
        text: '-',
        style: this.getCellStyle
      },
      {
        dataField: 'detailedInfo.deathChange',
        text: 'Daily Change',
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
        dataField: 'detailedInfo.deathPercentage',
        text: 'Death Pop %',
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
          <Spinner animation="border" />
        </div>
      );
    } else {
      return (
        <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '1000px' }}>
          <p align="left"> * Data reflects situation at <span style={{ 'fontWeight': 'bold'}}>{ this.state.validDate } 23:59:59 PM EST</span>.</p>
          <BootstrapTable bootstrap4={ true } keyField='state-rank-table'
            data={ this.state.data } columns={ columns } defaultSorted={ defaultSorted }>
          </BootstrapTable>
        </div>
      );
    }
  }
}

export default StateRankTable;
