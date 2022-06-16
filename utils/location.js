export default {
  getQuery () {
    if (!location.search) {
      return {}
    }
    return location.search.slice(1).split('&').reduce((a, b) => { a[b.split('=')[0]] = b.split('=')[1]; return a }, {})
  }
}
