<script>
export default {
  data () {
    return {
      dealColFn: []
    }
  },
  methods: {
    // 处理表单项
    dealCols (columns) {
      let arr = typeof columns === 'function'
        ? columns.call(this, this.data, this)
        : columns
      this.dealColFn.forEach(fn => {
        arr = fn(arr)
      })
      this._columns = arr
      return arr
    }
  }
}
</script>
