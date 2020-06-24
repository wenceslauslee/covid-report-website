import { Component } from 'react';
import React from 'react';

const dateStyle = {
  fontSize: '18px',
  fontWeight: 'bold'
};

class ChangeLog extends Component {
  render() {
    return (
      <div>
        <p style={{ display: 'inline-block', textAlign: 'left', minWidth: '750px' }}>
          For reference, full change logs can be viewed <a href='https://github.com/wenceslauslee/covid-report-website/commits/master'>here</a>.<br/><br/>
          <div style={ dateStyle }>-- June 24, 2020 --</div>
          * Update timestamp to be relative and easier to read.
          * Add logic to remove/pad trailing days when period is uneven.<br/><br/>
          <div style={ dateStyle }>-- June 23, 2020 --</div>
          * Make legend styling more opaque. Choose better colors for graphing.<br/><br/>
          <div style={ dateStyle }>-- June 22, 2020 --</div>
          * Add seven day moving average to US graph. Remove right axis grids.<br/>
          * Fix bug with dates on state/county graphs.<br/>
          * Update documentation and sources.<br/>
          * Added change logs tab and contents.<br/><br/>
          <div style={ dateStyle }>-- June 21, 2020 --</div>
          * Publish link to public and open up for feedback!<br/><br/>
          Special thanks to all who gave me ideas on how to improve this page!
        </p>
      </div>
    );
  }
}

export default ChangeLog;
