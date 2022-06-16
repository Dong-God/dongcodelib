// 千分位分隔
function formatMoney (oData) {
  const data = Number(oData)
  if (isNaN(data)) {
    return oData
  }
  if (data === 0) {
    return '0'
  }
  return data.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
}
// 数字处理
function formaNumber (oData, config = { type: 'money' }) {
  const DEFAULT_CONFIG = {
    empty: '-'
  }
  config = { ...DEFAULT_CONFIG, ...config }
  if (oData === null || oData === undefined) {
    return config.empty
  }
  const data = Number(oData)
  if (isNaN(data)) {
    return oData
  }
  if (data === 0) {
    return '0'
  }
  if (config.type === 'money') {
    return data.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
  }
  if (config.type === 'thousands') {
    return data.toLocaleString()
  }
}
// 百分比
function formatPercent (data) {
  if (!data || data === '0' || data === '0.00') {
    return '0'
  }
  if (typeof data !== 'number') {
    data = Number(data)
  }
  const value = data.toFixed(4).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
  return `${(value * 100).toFixed(2)}%`
}

/**
 *  时间戳格式转换
 * @param {String}  date 时间
 * @param { String } fmt 格式
 * @renten 返回导入函数
 */
function timeFormate (date, fmt) {
  if (typeof date !== 'object') {
    date = new Date(date)
  }
  var o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (var k in o) { if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)) }
  return fmt
}

function loopsArray (arr, key, fn, level = 0) {
  if (!arr || !arr.length) {
    return false
  }
  arr.forEach((it, i) => {
    fn(it, i, level)
    loopsArray(it[key], key, fn, level + 1)
  })
}

function sleep (t) {
  return new Promise(resolve => setTimeout(resolve, t))
}
// 列表转树
function list2Tree (arr, id = 'id', pid = 'parentid', child = 'children', root = 0, retMap, hasParent = true) {
  const tree = []
  const map = {}
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    const key = item[id]
    const pkey = item[pid]
    const obj = {}
    Object.assign(item, obj, map[key])
    if (map[key]) {
      if (!map[key][child]) {
        map[key][child] = []
      }
      hasParent && map[key][child].forEach(function (child) {
        child[pid] = item
      })
    }
    map[key] = item
    if (pkey === root) {
      tree.push(item)
    } else {
      hasParent && (item[pid] = map[pkey])
      if (map[pkey]) {
        if (!map[pkey][child]) {
          map[pkey][child] = []
        }
        map[pkey][child].push(item)
      } else {
        const obj = {}
        obj[child] = [item]
        map[pkey] = obj
      }
    }
  }
  if (retMap) {
    return map
  }
  return tree
}

// 中文逗号替换成英文逗号
function repleaceComma (str) {
  return str.replace(/，/ig, ',')
}

// 循环遍历树
function loopTree (tree, cb, childKey = 'children') {
  tree.forEach((it, i) => {
    cb(it)
    if (it[childKey] && it[childKey].length) {
      loopTree(it[childKey], cb)
    }
  })
}

export default {
  sleep,
  formatMoney,
  formatPercent,
  timeFormate,
  loopsArray,
  loopTree,
  list2Tree,
  repleaceComma,
  formaNumber
}
