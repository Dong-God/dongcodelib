const cache = new Map()
const PROMISE_LIST = {}

export class MemoryCache {
  constructor (type) {
    if (!cache[type]) {
      cache[type] = new Map()
    }
    this.cache = cache[type]
  }

  async get (key, cb) {
    if (typeof key === 'object') {
      key = JSON.stringify(key)
    }
    const value = this.cache[key]
    if (value === undefined && cb) {
      if (!PROMISE_LIST[key]) {
        PROMISE_LIST[key] = cb().then((data) => {
          delete PROMISE_LIST[key]
          return data
        })
      }
      this.cache[key] = await PROMISE_LIST[key]
    }
    return this.cache[key]
  }

  set (key, value) {
    if (typeof key === 'object') {
      key = JSON.stringify(key)
    }
    this.cache[key] = value
  }
}
