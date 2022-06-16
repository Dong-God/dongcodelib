function type (obj) {
  var toString = Object.prototype.toString
  var map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  }
  return map[toString.call(obj)]
}

function deepClone (data) {
  var t = type(data)
  var o
  var i
  var ni

  if (t === 'array') {
    o = []
  } else if (t === 'object') {
    o = {}
  } else {
    return data
  }

  if (t === 'array') {
    for (i = 0, ni = data.length; i < ni; i++) {
      o.push(deepClone(data[i]))
    }
    return o
  } else if (t === 'object') {
    for (i in data) {
      o[i] = deepClone(data[i])
    }
    return o
  }
}

/**
 *  比较时间大小
 * @param {String}  date1 时间一
 * @param { String } date2 时间二
 * @renten 返回导入函数
 */
function compare (date1, date2, equal) {
  if (date1 === date2) {
    return equal
  }
  const newDate1 = new Date(date1)
  const newDate2 = new Date(date2)
  if (newDate1.getTime() >= newDate2.getTime()) {
    return false
  } else {
    return true
  }
}

/**
 *  复制
 * @param {String}  content 需要复制的内容
 */
function copy (content) {
  var input = document.createElement('textarea')
  input.value = content
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy', false)
  document.body.removeChild(input)
}
export default {
  deepClone,
  compare,
  copy
}
