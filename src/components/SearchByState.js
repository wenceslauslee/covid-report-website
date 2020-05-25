import Button from 'react-bootstrap/Button';
import { Component } from 'react';
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
    const stateValues = this.stateValues();
    const stateValuesModified = _.map(stateValues, s => {
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

  stateValues() {
    return [
      "Alabama",
      "Alaska",
      "Arizona",
      "Arkansas",
      "California",
      "Colorado",
      "Connecticut",
      "Delaware",
      "District of Columbia",
      "Florida",
      "Georgia",
      "Guam",
      "Hawaii",
      "Idaho",
      "Illinois",
      "Indiana",
      "Iowa",
      "Kansas",
      "Kentucky",
      "Louisiana",
      "Maine",
      "Maryland",
      "Massachusetts",
      "Michigan",
      "Minnesota",
      "Mississippi",
      "Missouri",
      "Montana",
      "Nebraska",
      "Nevada",
      "New Hampshire",
      "New Jersey",
      "New Mexico",
      "New York",
      "North Carolina",
      "North Dakota",
      "Northern Mariana Islands",
      "Ohio",
      "Oklahoma",
      "Oregon",
      "Pennsylvania",
      "Puerto Rico",
      "Rhode Island",
      "South Carolina",
      "South Dakota",
      "Tennessee",
      "Texas",
      "Utah",
      "Vermont",
      "Virgin Islands",
      "Virginia",
      "Washington",
      "West Virginia",
      "Wisconsin",
      "Wyoming"
    ];
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
      </div>
    );
  }
}

export default SearchByState;
