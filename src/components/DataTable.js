import { Component } from 'react';
import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

class DataTable extends Component {
  constructor() {
    super();
    this.state = {
      data: []
    };
  }

  componentDidMount() {
    fetch('https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/rank?infoKey=stateRanking')
      .then(res => res.json())
      .then(data => {
        this.setState({
          data: data.rankByCases
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    const columns = [
      {
        dataField: 'activeRank',
        text: 'Rank'
      },
      {
        dataField: 'activeCount',
        text: 'Case Count'
      },
      {
        dataField: 'deathRank',
        text: 'Rank'
      },
      {
        dataField: 'deathCount',
        text: 'Death Count'
      },
      {
        dataField: 'popPercentage',
        text: 'Pop %'
      }
    ];

    return (
      <BootstrapTable keyField='state-rank-table' data={ this.state.data } columns={ columns } />
    );
  }
}

export default DataTable;
