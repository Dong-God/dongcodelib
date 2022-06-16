export default {
  isExternal (path) {
    return /^(https?:|mailto:|tel:)/.test(path)
  },
  validURL (url) {
    const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
    return reg.test(url)
  },
  validUpperCase (str) {
    const reg = /^[A-Z]+$/
    return reg.test(str)
  },
  validAlphabets (str) {
    const reg = /^[A-Za-z]+$/
    return reg.test(str)
  },
  validEmail (email) {
    const reg = /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return reg.test(email)
  },
  validImageUrl (str) {
    str = str.split('?')[0]
    var reg = /\.(png|jpg|gif|jpeg|webp)$/
    return reg.test(str)
  },
  validExcel (str) {
    str = str.split('?')[0]
    var reg = /\.(xlsx|xls)$/
    return reg.test(str)
  },
  validPdf (str) {
    str = str.split('?')[0]
    var reg = /\.pdf$/
    return reg.test(str)
  },
  propsRequired (props, data) {
    return {
      validator (rule, value, callback) {
        for (let i = 0; i < props.length; i++) {
          if (!data[props[i]]) {
            callback(new Error('不能为空'))
            return false
          }
        }
        callback()
      },
      trigger: 'blur'
    }
  }
}
