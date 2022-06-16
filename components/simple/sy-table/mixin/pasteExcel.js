export default {
  props: {
    copyExcel: {}
  },
  data () {
    return {}
  },
  created () {
    // this.addDealColFn()
  },
  methods: {
    // // 处理每项数据
    // addDealColFn () {
    //   if (this.copyExcel?.clickEdit) {
    //     this.dealColFn.push(this.clickDisabledFn)
    //   }
    // },
    // // tag点击才开启编辑
    // clickDisabledFn (cols) {
    //   cols.forEach(it => {
    //     if (it.type !== 'tag') {
    //       return false
    //     }
    //     if (!it.bind) {
    //       it.bind = {}
    //     }
    //     it.bind.disabled = true
    //     if (!it.nativeOn) {
    //       it.nativeOn = {}
    //     }
    //     it.nativeOn.click = (e) => {
    //       e.currentTarget.classList.remove('is-disabled')
    //       console.log(e.target)
    //       console.log()
    //     }
    //   })
    //   return cols
    // },
    // 获取复制格式化值
    getCopyFomart (column, row) {
      if (column.copyFomart) {
        return column.copyFomart(row) + '\t'
      }
      if (!column.prop) {
        return '\t'
      }
      return `${row[column.prop] === undefined ? '-' : row[column.prop]}\t`
    },
    handlerCopyExcel (e) {
      if (!this.copyExcel || !e.clipboardData || !e.clipboardData.items) {
        return false
      }
      const items = e.clipboardData.items
      const types = e.clipboardData.types
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        this.parseContent(item, types[i])
      }
    },
    parseContent (item, type) {
      if (item.kind === 'string' && type === 'text/html') {
        item.getAsString((str) => {
          this.parseTableData(str)
          this.emptyCopySelect()
        })
      }
    },
    parseTableData (str) {
      const { headerIndex } = this.copyExcel
      const el = document.createElement('span')
      el.innerHTML = str
      const trs = el.querySelectorAll('tr')
      if (!trs || !trs.length) {
        return false
      }
      const arr = []
      trs.forEach(tr => {
        const tds = []
        tr.querySelectorAll('td').forEach(td => {
          tds.push(td.innerHTML.replace(/<br>/g, '\n'))
        })
        arr.push(tds)
      })
      const dataList = arr.slice(headerIndex + 1)
      // 选中的一列，复制数据只有一行，并且标题相同
      if (this.isSelectOneCol(this.data.length) && dataList.filter(it => it.length !== 1).length === 0 && this.isTitleEqual(arr[headerIndex][0])) {
        this.pasteColData(this._columns[this.copyPosition.pstartColumnIndex].prop, dataList)
      } else {
        const headersMap = this.getHeaderMap(arr[headerIndex])
        if (!headersMap.length) {
          return false
        }
        this.pasteAllData(headersMap, dataList)
      }
    },
    isTitleEqual (title) {
      const col = this._columns[this.copyPosition.pstartColumnIndex]
      return col.pasteHeader === title || col.label === title
    },
    pasteColData (key, dataList) {
      const items = dataList.length > this.data.length ? dataList : this.data
      items.forEach((it, i) => {
        const value = dataList[i] && dataList[i][0]
        if (this.data[i]) {
          this.data[i][key] = value
        } else {
          this.data.push({ [key]: value })
        }
      })
      this.$forceUpdate()
    },
    pasteAllData (headersMap, dataList) {
      const data = dataList.map((row, rowI) => {
        const o = {}
        headersMap.forEach((col, colI) => {
          if (col) {
            o[col] = dataList[rowI][colI]
          }
        })
        return o
      })
      data.forEach(it => {
        this.data.push(it)
      })
    },
    getHeaderMap (headers) {
      return headers.map(label => {
        const col = this._columns.find(it => (it.pasteHeader || it.label) === label)
        return col && col.prop
      })
    }
  }
}
