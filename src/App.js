import CountyRankTable from './components/CountyRankTable';
import DetailedInfo from './components/DetailedInfo';
import StateRankTable from './components/StateRankTable';
import React from 'react';
import SearchByState from './components/SearchByState';
import SearchByCounty from './components/SearchByCounty';
import Tab from 'react-bootstrap/Tab';
import TabContent from 'react-bootstrap/TabContent';
import Tabs from 'react-bootstrap/Tabs';
import USOverallTable from './components/USOverallTable';
import Wiki from './components/Wiki';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className='App'>
      <div className='App-description' style={{ display: 'flex', justifyContent: 'center', height: '15vh', width: '100vw' }}>
        <header style={{ display: 'inline-block', marginTop: '35px', maxWidth: '600px' }}>
          <p>This <a href='https://github.com/wenceslauslee/covid-report-website'>website</a> is my attempt at helping visualizing some information about COVID-19 in the US.
            All data is gathered from <a href='https://github.com/nytimes/covid-19-data'>NY Times</a> and transformed into the interactive graphs below.
            Please leave feedback via <a href='mailto:wenceslauslee@gmail.com'>email</a> if you see anything incorrect/misrepresented.
            <br/>- <a href='https://www.linkedin.com/in/wenceslauslee/'>Wences Lee</a>
          </p>
        </header>
      </div>
      <div className='App-body' style={{ display: 'inline-block',  justifyContent: 'center', alignItems: 'center', height: '85vh', width: '100vw' }}>
        <Tabs defaultActiveKey='general' id='tab-table' style={{ alignItems: 'center', 'justifyContent': 'center' }} mountOnEnter unmountOnExit>
          <Tab eventKey='general' title='General'>
            <TabContent>
              <Wiki/>
            </TabContent>
          </Tab>
          <Tab eventKey='countyranking' title='Top 50 County Rankings'>
            <TabContent>
              <CountyRankTable/>
            </TabContent>
          </Tab>
          <Tab eventKey='stateranking' title='50 States Rankings'>
            <TabContent>
              <StateRankTable/>
            </TabContent>
          </Tab>
          <Tab eventKey='usoverall' title='US Overall'>
            <TabContent>
              <USOverallTable/>
            </TabContent>
          </Tab>
          <Tab eventKey='detailedsearch' title='Detailed'>
            <TabContent>
              <DetailedInfo/>
            </TabContent>
          </Tab>
          <Tab eventKey='statesearch' title='Plot By State'>
            <TabContent>
              <SearchByState/>
            </TabContent>
          </Tab>
          <Tab eventKey='countysearch' title='Plot By County'>
            <TabContent>
              <SearchByCounty/>
            </TabContent>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
