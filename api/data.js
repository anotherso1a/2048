class Item {
  constructor(value) {
    this.value = value || (Math.random() < 0.5 ? 2 : 4)
    this.appear = value ? 'changed' : 'new'
  }
}