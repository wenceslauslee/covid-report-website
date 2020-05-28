import Button from 'react-bootstrap/Button';
import { Component } from 'react';
import React from 'react';
import Select from 'react-select';
import _ from 'lodash';

class SearchByStateCounty extends Component {
  constructor() {
    super();
    this.state = {
      groupedOptions: [],
      selectedCounties: []
    };
  }

  async componentDidMount() {
    await fetch('https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/rank?infoKey=stateToCounty')
      .then(res => res.json())
      .then(rdata => {
        const groupedOptions = _.map(rdata.mappings, m => {
          const label = m.state;
          const options = _.map(m.counties, c => {
            return {
              value: c.fips,
              label: c.name
            }
          });

          return {
            label: label,
            options: options
          };
        });

        console.log(groupedOptions);
        this.setState({
          groupedOptions: groupedOptions,
          selectedCounties: []
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    const onChange = (objects, action) => {
      const currentState = this.state;
      if (objects !== null && objects !== undefined && objects.length > 4) {
        objects.shift();
      }
      currentState.selectedCounties = objects;

      this.setState(currentState);
    };

    return (
      <div>
        <p align="left">Select up to 4 counties.</p>
        <div style={{ display: "flex" }}>
          <form>
            <Select
              options={ this.state.groupedOptions }
              isMulti
              // defaultMenuIsOpen={ true }
              className="basic-multi-select"
              onChange= { onChange }
            />
          </form>
          <Button variant="warning" style={{ 'margin-left': '10px' }}>Plot!</Button>
        </div>
        <div style={{ 'margin-top': '10px', 'margin-bottom': '10px' }}>
          <p>DOES NOT WORK YET! WIP!</p>
        </div>
      </div>
    );
  }
}

export default SearchByStateCounty;
