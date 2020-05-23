import StateRankTable from './components/StateRankTable';
import React from 'react';
import Tab from 'react-bootstrap/Tab'
import TabContent from 'react-bootstrap/TabContent'
import Tabs from 'react-bootstrap/Tabs'
import Wiki from './components/Wiki'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <header className="App-description">
        <p>This <a href="https://github.com/wenceslauslee/covid-report-website">website</a> is my attempt at helping visualizing some information about COVID-19 in the US.
          <br/>All data is gathered from <a href="https://github.com/nytimes/covid-19-data">NY Times</a> and transformed into the interactive graphs below.
          <br/>Please leave feedback via <a href="mailto:wenceslauslee@gmail.com">email</a> if you see anything incorrect/misrepresented.
          <br/>- <a href="https://www.linkedin.com/in/wenceslauslee/">Wences Lee</a>
        </p>
      </header>
      <div className="App-body">
        <Tabs defaultActiveKey="general" id="tab-table">
          <Tab eventKey="general" title="General">
            <TabContent>
              <Wiki/>
            </TabContent>
          </Tab>
          <Tab eventKey="countyranking" title="County Ranking">
            <TabContent>
              <StateRankTable/>
            </TabContent>
          </Tab>
          <Tab eventKey="stateranking" title="State Ranking">
            <TabContent>
              <StateRankTable/>
            </TabContent>
          </Tab>
          <Tab eventKey="statecountysearch" title="Search By">
            <TabContent>Goodbye</TabContent>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
