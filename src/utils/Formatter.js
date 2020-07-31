const moment = require('moment');

const Formatter = {
  modifyChangeRank: (rankChange) => {
    if (rankChange > 0) {
      return `↑${rankChange}`;
    } else if (rankChange < 0) {
      return `↓${Math.abs(rankChange)}`;
    }
    return '-';
  },

  sortFunc: (a, b, order, dataField) => {
    const a1 = a.replace(/\+|,/ig, '');
    const b1 = b.replace(/\+|,/ig, '');

    if (order === 'asc') {
      return parseInt(a1) - parseInt(b1);
    }
    return parseInt(b1) - parseInt(a1);
  },

  sortPercentage: (a, b, order, dataField) => {
    if (a.charAt(0) === '<' && b.charAt(0) === '<') {
      return 0;
    }
    if (order === 'asc') {
      if (a.charAt(0) === '<') {
        return -1;
      }
      if (b.charAt(0) === '<') {
        return 1;
      }
    } else {
      if (a.charAt(0) === '<') {
        return 1;
      }
      if (b.charAt(0) === '<') {
        return -1;
      }
    }

    const a1 = a.slice(0, -1);
    const b1 = b.slice(0, -1);

    if (order === 'asc') {
      return parseFloat(a1) - parseFloat(b1);
    }
    return parseFloat(b1) - parseFloat(a1);
  },

  getCellStyle: (cell, row, rowIndex, colIndex) => {
    if (typeof cell !== 'string') {
      return {
        color: 'black'
      };
    }

    var colorToUse = '';
    if (cell.startsWith('↑')) {
      colorToUse = 'red';
    } else if (cell.startsWith('↓')) {
      colorToUse = 'green';
    } else {
      colorToUse = 'black';
    }

    return {
      color: colorToUse
    };
  },

  getMaxValue: (maxValue) => {
    return Math.max(5, Math.round(maxValue * 1.05));
  },

  getTimestamp: (timestamp) => {
    const date = moment(timestamp);
    const current = moment();
    var diff = Math.floor((current - date) / 1000);
    var timeDiff;

    const getPlural = (word, count) => {
      if (count <= 1) {
        return word;
      }

      return `${word}s`;
    };

    if (diff < 60) {
      timeDiff = `${diff} ${getPlural('second', diff)}`;
    } else if (diff < 3600) {
      diff = Math.floor(diff / 60);
      timeDiff = `${diff} ${getPlural('minute', diff)}`;
    } else if (diff < 86400) {
      diff = Math.floor(diff / 3600);
      timeDiff = `${diff} ${getPlural('hour', diff)}`;
    } else {
      diff = Math.floor(diff / 86400);
      timeDiff = `${diff} ${getPlural('day', diff)}`;
    }

    return `${timeDiff} ago`;
  },

  getDangerColorRanking: (increase, population) => {
    const rValue = ((increase * 100000) / population).toFixed(2);

    var color = '#ff4d0d';
    if (rValue < 1) {
      color = '#81f772';
    } else if (rValue < 10) {
      color = '#fffd70';
    } else if (rValue < 25) {
      color = '#faba4b';
    }

    return color;
  },

  getRValue: (increase, population) => {
    return ((increase * 100000) / population).toFixed(2);
  },
}

export default Formatter