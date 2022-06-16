export default {
  getImageSize (src) {
    const _URL = window.URL || window.webkitURL
    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.src = typeof src === 'object' ? _URL.createObjectURL(src) : src
    })
  }
}
