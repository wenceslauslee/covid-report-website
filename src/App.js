import React from 'react';
import Tab from 'react-bootstrap/Tab'
import TabContent from 'react-bootstrap/TabContent'
import Tabs from 'react-bootstrap/Tabs'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <header className="App-description">
        <p>Visualizing some information about COVID-19 in the US.
        <br/>All data is gathered from <a href="https://github.com/nytimes/covid-19-data">NY Times</a> and transformed into the interactive graphs below.
        <br/>Please leave feedback via <a href="mailto:wenceslauslee@gmail.com">email</a> if you see anything incorrect/misrepresented.
        </p>
        <p className="tab"><br/><br/><br/>-<a href="https://www.linkedin.com/in/wenceslauslee/">Wences Lee</a></p>
      </header>
      <header className="App-body">
        <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
          <Tab eventKey="countyranking" title="County Ranking">
            <TabContent />
          </Tab>
          <Tab eventKey="stateranking" title="State Ranking">
            <TabContent />
          </Tab>
        </Tabs>
      </header>
    </div>
  );
}

export default App;
