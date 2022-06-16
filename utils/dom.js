class DomStopEvent {
  constructor (el, eventName) {
    this.eventFns = []
    this.isStop = true
    this.el = el
    this.point = null // 做同一事件去重
    this.eventName = eventName
    this.init()
  }

  init () {
    this.callFn = (e) => {
      if (this.isStop) {
        const point = `${e.x}-${e.y}`
        if (this.point === point) {
          this.eventFns.forEach(fn => fn(e))
        } else {
          this.point = point
        }
        e.stopImmediatePropagation()
        e.stopPropagation()
      }
    }
    this.el.addEventListener(this.eventName, this.callFn, true)
  }

  addEventFn (fn) {
    this.eventFns.push(fn)
  }

  run () {
    this.isStop = false
    this.el.click()
    this.isStop = true
    setTimeout(() => {
      this.point = null
    }, 1000)
  }

  destory () {
    this.el.removeEventListener(this.eventName, this.callFn)
  }
}

export default {
  DomStopEvent
}
