export default {
  transformNumb (str, n = 2) {
    if (typeof str === 'number') {
      str = String(str)
    }
    // 非数字类型
    if (!/^(-?\d+)(\.\d+)?$/.test(str)) {
      return str
    }
    return Number(str).toFixed(n)
  }
}
