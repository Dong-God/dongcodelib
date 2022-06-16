export default {
  getLStorage (key) {
    const value = localStorage[key]
    return value && JSON.parse(value)
  },
  setLStorage (key, value) {
    localStorage[key] = JSON.stringify(value)
  },
  clearLStorage (key) {
    localStorage.removeItem(key)
  },
  clearSStorage (key) {
    sessionStorage.removeItem(key)
  }
}
