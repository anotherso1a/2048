function init() {
  let grid = initGrid()
  let game = new Game('.box', grid)
  game.addItemMethod(16)
  listenTouchMove(game)
}
window.onload = init


class Game {
  constructor(selector, Grid) {
    this.Grid = Grid
    this.Empty = Grid
    this.Doms = document.querySelectorAll(selector)
    this.initDom()
  }
  initDom() {
    this.Doms.forEach((e, i) => {
      e.row = ~~(i / 4)
      e.column = i % 4
    })
  }
  getEmptyGrid() {
    this.Empty = this.Grid.filter(e => !e.instance)
    return this
  }
  render() {
    this.getEmptyGrid() //更新空格
    this.Grid.forEach((e, i) => {
      if (e.instance) {
        this.Doms[i].innerHTML = `<div class="numContainer"><div class="item t${e.instance.value}">${e.instance.value}</div></div>`
      } else {
        this.Doms[i].innerHTML = ''
      }
    })
    //检查游戏是否结束
    if (this.checkIsFailed()) { //GG
      setTimeout(() => alert('game over'), 500)
    }
    setTimeout(() => {
      this.animate()
    })
    return this
  }
  animate() { //动画
    this.Grid.forEach((e, i) => {
      if (e.instance) {
        switch (e.instance.appear) {
          case 'new':
            this.Doms[i].children[0].classList.add('zoomIn', 'animated')
            e.instance.appear = 'animated'
            break
          case 'changed':
            this.Doms[i].children[0].classList.add('jello', 'animated')
            e.instance.appear = 'animated'
            break
        }
      }
    })
  }
  addItemOnEmptyGrid(instance) { //添加一个,可执行多次进行添加
    if (!this.Empty.length) return this
    let index = ~~(this.Empty.length * Math.random())
    this.Empty[index].instance = instance
    this.render() //渲染
    return this
  }
  /**
   * 
   * @param {Number} n 每次添加的格子个数
   */
  addItemMethod(n) {
    Array.from({
      length: n
    }).forEach(() => {
      this.addItemOnEmptyGrid(new Item())
    })
    return this
  }
  /**
   * 滑动事件
   * @param {String} derection //up,down,left,right
   */
  swipe(derection) {
    switch (derection) {
      case 'up':
        this.calcValue('column', false)
        break
      case 'down':
        this.calcValue('column', true)
        break
      case 'left':
        this.calcValue('row', false)
        break
      case 'right':
        this.calcValue('row', true)
        break
    }
    this.addItemMethod(2)
    return this
  }
  calcValue(derec, reverse, noRender) {
    let checkArr = [] //用于检查
    let formattedGridArr = this.Grid.reduce((c, v) => {
      if (c[v[derec]]) {
        c[v[derec]].push(v)
      } else {
        c[v[derec]] = [v]
      }
      return c
    }, {})
    Object.keys(formattedGridArr).forEach(k => {
      if (reverse) {
        formattedGridArr[k] = formattedGridArr[k].reverse()
      }
      let formattedArr = formattedGridArr[k].map(e => e.instance && e.instance.value) //提取value
      let arr = formattedArr.slice(0).filter(e => e) //拷贝数组
      for (let i = 0; i < arr.length; i++) {
        try {
          if (arr[i] && arr[i] == arr[i + 1]) {
            arr[i] = arr[i] + arr[i + 1]
            arr.splice(i + 1, 1)
          }
        } catch (e) {
          break
        }
      }
      if (!noRender) {
        formattedGridArr[k].forEach((e, i) => {
          if (arr[i]) {
            if (!e.instance || e.instance.value != arr[i]) { //只有当item变动时,才做更改
              e.instance = new Item(arr[i])
            }
          } else {
            e.instance = null
          }
        })
      } else {
        checkArr.push(arr)
      }
    })
    if (!noRender) {
      this.render()
    }
    return checkArr
  }
  /**
   * 检查游戏是否结束,每一横,竖都不可合成
   */
  checkIsFailed() {
    let checkColumn = this.calcValue('column', false, true)
    let checkRow = this.calcValue('row', false, true)
    return checkColumn.every(e => e.length == 4 && e.every((n, i, a) => n != a[i + 1])) && checkRow.every(e => e.length == 4 && e.every((n, i, a) => n != a[i + 1]))
  }
}

function listenTouchMove(game) {
  let x, y
  let start = e => {
    x = e.touches[0].screenX
    y = e.touches[0].screenY
  }
  let end = e => {
    let dx = x - e.changedTouches[0].screenX,
      dy = y - e.changedTouches[0].screenY

    if (Math.abs(dx) > Math.abs(dy)) { //row
      if (dx > 0) {
        return game.swipe('left')
      }
      return game.swipe('right')
    } else { //column
      if (dy > 0) {
        return game.swipe('up')
      }
      return game.swipe('down')
    }
  }
  document.addEventListener('touchstart', start)
  document.addEventListener('touchend', end)
}
// listenTouchMove()