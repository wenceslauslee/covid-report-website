const Formatter = {
  modifyChangeRank: (rankChange) => {
    if (rankChange > 0) {
      return `↑${rankChange}`;
    } else if (rankChange < 0) {
      return `↓${Math.abs(rankChange)}`;
    }
    return '-';
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
  }
}

export default Formatter