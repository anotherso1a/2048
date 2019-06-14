class Grid {
  constructor(row, column) {
    this.row = row
    this.column = column
    this.instance = null
  }
}


function initGrid() {
  return Array.from({
    length: 16
  }, (e, i) => new Grid(~~(i / 4), i % 4))
}