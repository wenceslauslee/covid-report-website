import { Component } from 'react';
import React from 'react';

const dateStyle = {
  fontSize: '18px',
  fontWeight: 'bold'
};

class ChangeLog extends Component {
  render() {
    return (
      <div style={{ display: 'inline-block', textAlign: 'left', minWidth: '750px' }}>
        <div style={ dateStyle }>Special thanks to all who gave me ideas on how to improve this page!</div>
        For reference, full change logs can be viewed <a href='https://github.com/wenceslauslee/covid-report-website/commits/master'>here</a>.<br/><br/>
        <div style={ dateStyle }>-- WIP --</div>
        * Store postal code in beginning to highlight your area.<br/><br/>
         <div style={ dateStyle }>-- July 21, 2020 --</div>
        * Add visitor count.<br/><br/>
        <div style={ dateStyle }>-- July 18, 2020 --</div>
        * Add US overall risk factor.<br/><br/>
        <div style={ dateStyle }>-- July 17, 2020 --</div>
        * Add option for graph selection.<br/><br/>
        <div style={ dateStyle }>-- July 9, 2020 --</div>
        * Add option for per 100K population graphing.<br/><br/>
        <div style={ dateStyle }>-- July 7, 2020 --</div>
        * Format large numbers with commas for better readability.<br/>
        * Add more graphs into state/county plots in preparation for user selection feature.<br/><br/>
        <div style={ dateStyle }>-- July 5, 2020 --</div>
        * Add population info to detailed info. Split legends into two rows for better viewability.<br/><br/>
        <div style={ dateStyle }>-- July 3, 2020 --</div>
        * Add danger risk coloring to state/county ranking and detailed pages.<br/>
        * Add seven day moving average to county plot.<br/><br/>
        <div style={ dateStyle }>-- July 1, 2020 --</div>
        * Add seven day moving average to state plot.<br/><br/>
        <div style={ dateStyle }>-- June 29, 2020 --</div>
        * Add seven day moving average to detailed plot.<br/><br/>
        <div style={ dateStyle }>-- June 28, 2020 --</div>
        * Add refresh button on US state table.<br/>
        * Add refresh button on US county table.<br/><br/>
        <div style={ dateStyle }>-- June 27, 2020 --</div>
        * Add refresh button on US overall table.<br/>
        * Add rankings total in detailed info.<br/>
        * Add filtering of county rankings by state option.<br/><br/>
        <div style={ dateStyle }>-- June 26, 2020 --</div>
        * Remove ranking change columns and integrate into names.<br/>
        * Add live changes to US county ranking table.<br/>
        * Add live changes to US state ranking table.<br/><br/>
        <div style={ dateStyle }>-- June 25, 2020 --</div>
        * Add live changes to US overall table.<br/>
        * Add more appendix to what the columns mean.<br/><br/>
        <div style={ dateStyle }>-- June 24, 2020 --</div>
        * Swap out cache implementations for data points.<br/>
        * Update timestamp to be relative and easier to read.<br/>
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
      </div>
    );
  }
}

export default ChangeLog;
