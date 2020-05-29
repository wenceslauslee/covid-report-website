import Button from 'react-bootstrap/Button';
import { Component } from 'react';
import data from '../data/data.json';
import React from 'react';
import Select from 'react-select';
import _ from 'lodash';

class SearchByState extends Component {
  constructor() {
    super();
    this.state = {
      stateValues: [],
      selectedStates: []
    };
  }

  componentDidMount() {
    const stateValuesModified = _.map(data.states, s => {
      return {
        label: s,
        value: s.toLowerCase()
      };
    });

    this.setState({
      stateValues: stateValuesModified,
      selectedStates: []
    });
  }

  render() {
    const onChange = (objects, action) => {
      const currentState = this.state;
      if (objects !== null && objects !== undefined && objects.length > 4) {
        objects.shift();
      }
      currentState.selectedStates = objects;

      this.setState(currentState);
    };

    return (
      <div>
        <p align="left">Select up to 4 states.</p>
        <div style={{ display: "flex" }}>
          <form>
            <Select
              options={ this.state.stateValues }
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

export default SearchByState;
