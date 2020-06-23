import { Component } from 'react';
import React from 'react';

const enlargeStyle = {
  fontSize: '18px',
  fontWeight: 'bold'
};

class Wiki extends Component {
  componentDidMount() {
    // Warm things up backend
    fetch(`https://s7poydd598.execute-api.us-east-1.amazonaws.com/prod/search?searchBy=postal&key=02453`)
      .then(res => res.json())
  }

  render() {
    return (
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
        <br/>
        <br/>
        <div style={ enlargeStyle }>Lastly, stay vigilant, healthy and safe!</div>
        <br/>
        <b>Work In Progress...</b>
        <br/>
        * Add seven day moving average to US overall.
        <br/>
        * Update legend styling to be more opaque and clear.
        <br/>
        * Add seven day moving average to states/counties.
        <br/>
        * Add option for graphing in logarithmic axis.
        <br/>
        * Add more live updates to the page. Currently the page refreshes once daily, when NYT posts the updates from yesterday.
        <br/>
        * Add more appendix to what the columns mean.
        <br/>
        * Update timestamp to be relative and easier to read.
        <br/>
        * Convert to https under my own domain.
      </p>
    );
  }
}

export default Wiki;
