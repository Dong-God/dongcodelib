function deepClone (data) {
  var t = typeof (data)
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

export default {
  deepClone
}
