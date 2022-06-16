export default {
  getCookie,
  setCookie,
  removeCookie
}

function setCookie (key, value, t, domain) {
  var oDate = new Date()
  oDate.setDate(oDate.getDate() + t)
  document.cookie = `${key}=${value};Path=/;expires=${oDate.toDateString()};domain=${domain}`
}

function getCookie (key) {
  var arr1 = document.cookie.split('; ')// 由于cookie是通过一个分号+空格的形式串联起来的，所以这里需要先按分号空格截断,变成[name=Jack,pwd=123456,age=22]数组类型；
  for (var i = 0; i < arr1.length; i++) {
    var arr2 = arr1[i].split('=')// 通过=截断，把name=Jack截断成[name,Jack]数组；
    if (arr2[0] === key) {
      return decodeURI(arr2[1])
    }
  }
}

function removeCookie (key, domain) {
  setCookie(key, '', -1, domain) // 把cookie设置为过期
}
