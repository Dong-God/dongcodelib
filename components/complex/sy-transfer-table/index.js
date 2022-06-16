const install = vm => {
  vm.prototype.$transferTable = function ({ msgbox, transfer }) {
    let value = transfer.value || []
    return vm.prototype.$msgbox({
      customClass: 'sy-transfer-table-dialog',
      message: this.$createElement('sy-transfer-table', { key: Math.random(), props: { ...transfer, value }, on: { input (v) { value = v } } }),
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      width: 1200,
      beforeClose (action, instance, done) {
        if (action === 'confirm' && transfer.limit && value && value.length > transfer.limit) {
          this.$message.error(`选中项不能超过${transfer.limit}条，当前选中${value.length}条数据,`)
          return false
        }
        done()
      },
      ...msgbox
    }).then(action => {
      return { action, value }
    }).catch(() => { })
  }
}
export default {
  install
}
