import { Component } from 'react';
import moment from 'moment';
import React from 'react';

const enlargeStyle = {
  fontSize: '18px',
  fontWeight: 'bold'
};

class Wiki extends Component {
  constructor(props) {
    super(props);

    this.data = {
      singleDayVisitorCount: '---',
      allVisitorCount: '---'
    };

    this.state = {
      loading: true
    };
  }

  async componentWillMount() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }
    const asyncFunctions = [
      fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/visit/${moment().format('YYYY-MM-DD')}`, requestOptions)
        .then(res => res.json()),
      fetch('https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/visit/all', requestOptions)
        .then(res => res.json())
    ]
    const results = await Promise.all(asyncFunctions);

    this.data.singleDayVisitorCount = results[0].visitorCount;
    this.data.allVisitorCount = results[1].visitorCount;

    // Warm things up backend
    fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=postal&key=02453`)
      .then(res => res.json());

    this.setState(prevState => ({
      ...prevState,
      loading: false
    }));
  }

  render() {
    return (
      <div style={{ display: 'inline-block', textAlign: 'left', maxWidth: '750px' }}>
        <div>
          <p style={{ display: 'inline-block', textAlign: 'left', maxWidth: '750px' }}>
            Coronavirus disease 2019 (COVID-19) is an infectious disease caused by severe acute respiratory syndrome coronavirus 2 (SARS-CoV-2). It was first identified
            in December 2019 in Wuhan, China, and has since spread globally, resulting in an ongoing pandemic. As of today, cases have been reported across 188 countries
            and territories. Common symptoms include fever, cough, fatigue, shortness of breath, and loss of smell and taste. While the majority of cases result in mild symptoms,
            some progress to acute respiratory distress syndrome. The time from exposure to onset of symptoms is typically around five days but may range from
            two to fourteen days.
            <br/>
            <br/>
            The virus is primarily spread between people during close contact, most often via small droplets produced by coughing, sneezing, and talking.
            The droplets usually fall to the ground or onto surfaces rather than travelling through air over long distances. Less commonly, people may become infected
            by touching a contaminated surface and then touching their face. It is most contagious during the first three days after the onset of symptoms,
            although spread is possible before symptoms appear, and from people who do not show symptoms.
            <br/>
            <br/>
            Helpful links that I have been following and got inspired from over the last few months.
            <br/>* <a href='https://coronavirus.jhu.edu/map.html'>Johns Hopkins Coronavirus Resource Center</a>
            <br/>* <a href='https://www.cnn.com/interactive/2020/health/coronavirus-us-maps-and-cases/'>CNN Tracking COVID-19 Cases In The US</a>
            <br/>* <a href='https://covidtracking.com/'>The COVID Tracking Project</a>
            <br/>* <a href='https://www.nytimes.com/interactive/2020/us/coronavirus-us-cases.html'>Coronavirus in the U.S. NY Times</a>
            <br/>* <a href='https://github.com/nytimes/covid-19-data'>NY Times COVID-19 Data</a>
            <br/>* <a href='http://91-divoc.com/pages/covid-visualization/'>91-DIVOC</a>
            <br/>* <a href='https://www.npr.org/sections/health-shots/2020/07/01/885263658/green-yellow-orange-or-red-this-new-tool-shows-covid-19-risk-in-your-county'>NPR COVID-19 Risk Map</a>
            <br/>
            <br/>
          </p>
        </div>
        <div style={ enlargeStyle }>Lastly, stay vigilant, healthy and safe! And WEAR A MASK to help slow down spread!</div>
        <div>
          <p style={{ display: 'inline-block', textAlign: 'left', maxWidth: '750px' }}>
            <br/>
            <b>Work In Progress...</b>
            <br/>
            * Use location postal code to highlight current county/state and autofill some boxes.
            <br/>
            * Convert to https under my own domain.
          </p>
        </div>
        <div>
        Today visitor count: { this.data.singleDayVisitorCount }<br/>
        All time visitor count: { this.data.allVisitorCount }
        </div>
      </div>
    );
  }
}

export default Wiki;
