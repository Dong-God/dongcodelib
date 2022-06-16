/**
 *
 * 函数防抖
 *
 * @param {Function} function 需要防抖的函数
 * @param {Number} timeout 防抖间隔
 * @param {Boolean} whether 第一遍是否随及执行
 * @returns { Object } debounced debounce对象
 */
function debounce (func, wait, immediate) {
  var timeout, args, context, timestamp, result
  if (wait == null) wait = 100

  function later () {
    var last = Date.now() - timestamp

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      if (!immediate) {
        result = func.apply(context, args)
        context = args = null
      }
    }
  }

  var debounced = function () {
    context = this
    args = arguments
    timestamp = Date.now()
    var callNow = immediate && !timeout
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }

  debounced.clear = function () {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  debounced.flush = function () {
    if (timeout) {
      result = func.apply(context, args)
      context = args = null

      clearTimeout(timeout)
      timeout = null
    }
  }

  return debounced
}

function debounceWait (fn, delay) {
  let ctx
  let args
  let timer = null

  const later = function () {
    fn.apply(ctx, args)
    // 当事件真正执行后，清空定时器
    timer = null
  }

  return function () {
    ctx = this
    args = arguments
    // 当持续触发事件时，若发现事件触发的定时器已设置时，则清除之前的定时器
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    // 重新设置事件触发的定时器
    timer = setTimeout(later, delay)
  }
}

export default {
  debounceWait,
  debounce
}
