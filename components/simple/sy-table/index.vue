<script>
import Sortable from 'sortablejs'
import debounce from '../../../utils/debounce'
import TABLE_MIXINS from './mixin'

const NOOP = (_) => _
export default {
  name: 'sy-table',
  mixins: [...TABLE_MIXINS],
  props: {
    disabled: { type: Boolean, default: false },
    colspan: { type: Array, default: () => [] },
    on: [Object],
    bind: {
      type: [Object],
      default: () => ({
        rowKey: '_id'
      })
    },
    preloadApis: {
      type: [Object],
      default: () => {}
    },
    columns: {
      type: [Array, Function],
      default () {
        return []
      }
    },
    virtualScroll: {
      type: Object,
      default () {
        return {
          showVirtualNumber: 10000, // 数据数量超过N条触发虚拟滚动
          showCount: 15 // 渲染数据条数
        }
      }
    },
    data: {
      type: Array,
      default () {
        return []
      }
    },
    extraData: {
      type: Object,
      default () {
        return {}
      }
    },
    isSearching: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      selection: [], // 选中值
      virtualRows: [],
      preload: true,
      loading: false,
      apiData: {},
      isInitSort: false
    }
  },
  created () {
    this.initPreloadApis()
  },
  watch: {
    isSearching (v) {
      this.loading = v
    },
    data: {
      handler () {
        this.data.forEach((it, i) => {
          if (!it._id) {
            it._id = Math.random() * 1000000
          }
          if (!it._index) {
            it._index = i
          }
        })
        setTimeout(this.setVirtualScroll, 1)
      },
      immediate: true
    }
  },
  computed: {
    isVirtualScroll () {
      return this.data.length > this.virtualScroll.showVirtualNumber
    }
  },
  render (h) {
    if (!this.preload) {
      return null
    }
    const {
      data,
      virtualRows,
      getColumns,
      handlerSelect,
      handlerSort,
      bind,
      on,
      spanMethod,
      loading,
      isVirtualScroll,
      handlerCellClick,
      getCellClassName,
      hanlderKeyup,
      handlerHeaderClick,
      openCopy,
      handlerPaste,
      handlerContextmenu
    } = this
    const table = h(
      'el-table',
      {
        class: {
          'sy-table': true,
          'open-copy': openCopy
        },
        props: {
          data: isVirtualScroll ? virtualRows : data,
          spanMethod,
          ...{ rowKey: '_id', ...bind },
          cellClassName: getCellClassName
        },
        on: {
          'sort-change': handlerSort,
          select: handlerSelect,
          'select-all': handlerSelect,
          'cell-click': handlerCellClick,
          ...on,
          'header-click': handlerHeaderClick
        },
        nativeOn: {
          contextmenu: handlerContextmenu
        },
        ref: 'table',
        directives: [
          {
            name: 'loading',
            value: loading
          }
        ],
        scopedSlots: {
          empty: () => {
            if (!this.isSearching) {
              return [
                <div class="sy-empty-block">
                  <img src="https://yujiahui.oss-cn-hangzhou.aliyuncs.com/static/img/empty_status.png"></img>
                  <div>{bind.emptyText || '暂无数据'}</div>
                  <div>抱歉，暂时没有相关数据哦 ~ </div>
                </div>
              ]
            }
            return <div></div>
          }
        }
      },
      [getColumns(h, this.columns)]
    )
    return h(
      'span',
      {
        on: {
          keyup: hanlderKeyup,
          paste: handlerPaste
        }
      },
      [table]
    )
  },
  methods: {
    // 初始化预请求接口
    async initPreloadApis () {
      for (const key in this.preloadApis) {
        this.preload = false
        this.apiData[key] = await this.preloadApis[key]()
      }
      this.preload = true
    },
    handlerCellClick (row, column, cell, event) {
      if (this.on?.cellClick) {
        this.on?.cellClick(row, column, cell, event)
      }
      if (this.openCopy) {
        const rowIndex = row._index
        const columnIndex = this._columns.findIndex(
          (it) => it.label === column.label
        )
        if (event.shiftKey) {
          this.copy.endRowIndex = rowIndex
          this.copy.endColumnIndex = columnIndex
        } else {
          this.copy.startRowIndex = rowIndex
          this.copy.startColumnIndex = columnIndex
          this.copy.endRowIndex = rowIndex
          this.copy.endColumnIndex = columnIndex
        }
      }
    },
    handlerSelect (selection, row) {
      this.$emit('select', selection)
    },
    handlerSort (...args) {
      this.$emit('sort', ...args)
    },
    // 键盘时间
    hanlderKeyup (e) {
      if (e.key === 'c' && e.ctrlKey) {
        this.handlerCopyText(e)
      }
    },
    handlerPaste (e) {
      this.handlerCopyExcel(e)
    },
    handlerHeaderClick (column, event) {
      if (this.on && this.on['header-click']) {
        this.on['header-click'](column, event)
      }
      if (this.openCopy) {
        const columnIndex = this._columns.findIndex(
          (it) => it.label === column.label
        )
        this.copy.startRowIndex = 0
        this.copy.startColumnIndex = columnIndex
        this.copy.endRowIndex = this.data.length - 1
        this.copy.endColumnIndex = columnIndex
      }
    },
    // 获取cell的class
    getCellClassName ({ row, column, rowIndex, columnIndex }) {
      const { bind, copyPosition, openCopy } = this
      const clazz = []
      if (bind.cellClassName) {
        clazz.push(bind.cellClassName({ row, column, rowIndex, columnIndex }))
      }
      if (bind['cell-class-name']) {
        clazz.push(
          bind['cell-class-name']({ row, column, rowIndex, columnIndex })
        )
      }
      rowIndex = row._index
      columnIndex = this._columns.findIndex((it) => it.label === column.label)
      if (copyPosition && openCopy) {
        const {
          pstartRowIndex,
          pendRowIndex,
          pstartColumnIndex,
          pendColumnIndex
        } = copyPosition
        if (
          rowIndex >= pstartRowIndex &&
          rowIndex <= pendRowIndex &&
          columnIndex >= pstartColumnIndex &&
          columnIndex <= pendColumnIndex
        ) {
          clazz.push('cellSelected')
        }
      }
      return clazz.join(' ')
    },
    // 合并单元格
    spanMethod ({ column, rowIndex, columnIndex }) {
      if (this.colspan.indexOf(columnIndex) === -1) {
        return {
          rowspan: 1,
          colspan: 1
        }
      }
      // 上下合并
      if (this.getSpanTopEq(this.data, rowIndex, column.property)) {
        return {
          rowspan: 0,
          colspan: 1
        }
      }
      // 获取下面有几个相等的
      const numb = this.getSpanBtmEqNumb(this.data, rowIndex, column.property)
      if (numb) {
        return {
          rowspan: numb + 1,
          colspan: 1
        }
      }
      return {
        rowspan: 1,
        colspan: 1
      }
    },
    // 获取上面是否相等
    getSpanTopEq (data, index, prop) {
      if (index === 0) {
        return false
      }
      return data[index][prop] === data[index - 1][prop]
    },
    // 获取前面是否相等
    getSpanBeforeEq (columns, index) {
      for (let i = 0; i < index; i++) {
        const col = columns[i]
        if (col.colSpan === 1) {
          return false
        }
      }
      return true
    },
    // 获取下面相等数量
    getSpanBtmEqNumb (data, index, prop) {
      const value = data[index][prop]
      let numb = 0
      for (let i = index + 1; i < data.length; i++) {
        if (value !== data[i][prop]) {
          return numb
        }
        numb++
      }
      return numb
    },
    handlerMySelectAll () {
      const hasSelectAll = this.data.length === this.selection.length
      this.selection = hasSelectAll ? [] : [...this.data]
      this.$emit('select', this.selection)
      this.$emit('selection-change', this.selection)
    },
    handlerMySelect (row, hasSelect) {
      if (hasSelect) {
        const index = this.selection.findIndex((it) => it === row)
        this.selection.splice(index, 1)
      } else {
        this.selection.push(row)
      }
      this.$emit('select', this.selection)
      this.$emit('selection-change', this.selection)
    },
    // 虚拟滚动checkbox渲染
    renderVirtualCheckbox (h, { column }) {
      const hasSelectAll = this.data.length === this.selection.length
      return (
        <el-checkbox
          class="11"
          indeterminate={this.selection.length > 0 && !hasSelectAll}
          value={hasSelectAll}
          on-input={this.handlerMySelectAll}
        ></el-checkbox>
      )
    },
    // 渲染表头
    renderHeader (it) {
      if (this.isVirtualScroll && it.type === 'selection') {
        setTimeout(() => {
          const columns = this.$refs.table.$refs.tableHeader.columns
          const item = columns.find((it) => it.type === 'selection')
          if (item && item.renderHeader !== this.renderVirtualCheckbox) {
            columns[0].renderHeader = this.renderVirtualCheckbox
          }
        })
        return this.renderVirtualCheckbox
      }
      return (h, { column }) => {
        return (
          <span>
            <span>{column.label}</span>
            {it.question && (
              <sy-icon
                class="header-icon"
                content={it.question}
                icon="el-icon-question"
              />
            )}
            {it.tips && <sy-tips class="header-icon" {...{ props: it.tips }} />}
          </span>
        )
      }
    },
    getScroll () {
      if (!this.$refs.table.bodyWrapper) {
        return {
          start: 0,
          end: 400
        }
      }
      const dom = this.$refs.table.bodyWrapper
      const scrollState = {
        start: dom.scrollTop,
        end: dom.scrollTop + dom.clientHeight
      }
      return scrollState
    },
    updateVisibleItems () {
      const { itemSize } = this // td高度
      const count = this.data.length // table总条数
      const bufferCount = this.virtualScroll.showCount // table每次实际渲染条数
      const height = count * itemSize

      // 获取当前滚动条位置
      const scroll = this.getScroll()
      const scrollTop = scroll.start

      // Fixed size mode
      const startIndex = Math.floor(scrollTop / itemSize)
      // 分隔数组
      this.virtualRows = this.data.slice(startIndex, startIndex + bufferCount)

      // 设置el-table上的虚拟列表，采用了padding的方案，原因是transform 会使el-table的样式混乱
      const mainTable =
        this.$refs.table.$el.getElementsByClassName('el-table__body')
      const scrollTopInt = Math.floor(scrollTop / itemSize) * itemSize
      Array.from(mainTable).forEach((table) => {
        table.style.height = height + 'px'
        if (startIndex + bufferCount >= count) {
          // 由于el-table 在滚动到最后时，会出现抖动，因此增加判断，单独设置属性
          table.style.paddingTop = scrollTop - itemSize + 'px'
          table.style.paddingBottom = 0
        } else {
          table.style.paddingTop = scrollTopInt + 'px'
          table.style.paddingBottom =
            height - scrollTopInt - bufferCount * itemSize + 'px'
        }
      })
      this.$refs.table.bodyWrapper.scrollTop = scroll.start
    },
    handleScroll () {
      this.updateVisibleItems()
    },
    addListenersScroll () {
      if (!this.$refs.table.bodyWrapper || !this.isVirtualScroll) {
        return
      }
      this.throttleResize = debounce.debounceWait(() => {
        this.handleScroll()
      }, 10)
      this.$refs.table.bodyWrapper.addEventListener(
        'scroll',
        this.throttleResize
      )
    },
    removeListenersScroll () {
      if (!this.$refs.table.bodyWrapper || !this.isVirtualScroll) {
        return
      }
      this.$refs.table.bodyWrapper.removeEventListener(
        'scroll',
        this.throttleResize
      )
    },
    // 获取tableColumn配置属性
    getTableColumnProps (it) {
      const BASE_PROP = {
        className: this.getClassName(it),
        sortable: it.sortable,
        width: this.getColumnsWidth(it),
        minWidth: this.getColumnsMinWidth(it),
        align: this.getColumnsAlign(it),
        type: this.getColumnsType(it),
        renderHeader: it.renderHeader || this.renderHeader(it),
        ...it.itemBind
      }
      return {
        ...BASE_PROP,
        label: it.label,
        prop: it.prop
      }
    },
    getColumnsType (it) {
      if (this.isVirtualScroll && it.type === 'selection') {
        return undefined
      }
      return it.type
    },
    getColumns (h, columns) {
      const { disabled, dealCols } = this
      return this.dealCols(columns)
        .filter((it) => {
          if (it.hide) {
            return false
          }
          if (disabled && it.hideDisabled) {
            return false
          }
          return true
        })
        .map((it) => {
          return h(
            'el-table-column',
            {
              key: it.label,
              props: this.getTableColumnProps(it),
              on: it.on,
              scopedSlots: {
                default: this.getColumnsScopedSlots(h, it)
              },
              ref: it.prop || it.type
            },
            it.child && this.getColumns(h, it.child)
          )
        })
    },
    // 设置当前列名称
    getClassName (it) {
      if (it.label === '操作') {
        return 'columns-operation'
      }
      if (it.prop) {
        return `columns-${it.prop}`
      }
    },
    getColumnsScopedSlots (h, it) {
      const that = this
      // 自定义render
      if (it.render) {
        return (props) => {
          const comp = it.render.call(that, h, props, that.extraData)
          if (comp.type) {
            return that.renderType(h, comp)(props)
          }
          return comp
        }
      }
      // 空处理
      if (it.emptyStr) {
        return (props) => {
          const value = props.row[it.prop]
          if (value === undefined) {
            return it.emptyStr
          } else {
            const render = that.renderType(h, it)
            return render ? render(props) : value
          }
        }
      }
      return this.addTip(it, this.renderType(h, it))
    },
    // 添加tip功能
    addTip (it, fn) {
      const { hanlderTipMouseenter } = this
      if ((!it.type && it.tip !== false) || it.type === 'tip' || it.tip) {
        return (props) => {
          const value = props.row[it.prop]
          const key = `sy-table-col-tip-hide-${parseInt(
            Math.random() * 1000000
          )}`
          const showText = fn ? fn(props) : value || (value === 0 ? 0 : '-')
          return (
            <el-tooltip
              effect="dark"
              placement="top"
              content={String(showText)}
              popper-class={key}
            >
              <span class="text-tip" on-mouseenter={hanlderTipMouseenter(key)}>
                {showText}
              </span>
            </el-tooltip>
          )
        }
      }
      return fn
    },
    // 鼠标移入显示tip
    hanlderTipMouseenter (key) {
      return (e) => {
        setTimeout(() => {
          const cell = e.target
          if (!document.querySelector(`.${key}`)) {
            return false
          }
          if (cell.scrollWidth > cell.offsetWidth) {
            document
              .querySelector(`.${key}`)
              .classList.remove('sy-table-col-tip-hide')
          } else {
            document
              .querySelector(`.${key}`)
              .classList.add('sy-table-col-tip-hide')
          }
        }, 10)
      }
    },
    getValue (row, props) {
      return props.split('.').reduce((a, b) => a[b], row)
    },
    setValue (row, props, value) {
      const keys = props.split('.')
      let v = row
      keys.forEach((key, i) => {
        if (i === keys.length - 1) {
          this.$set(v, key, value)
        } else {
          v = v[key]
        }
      })
      return props.split('.').reduce((a, b) => a[b], row)
    },
    getColumnsWidth (it) {
      if (it.width) {
        return it.width
      }
      return {
        color: 100,
        selection: 55
      }[it.type]
    },
    getColumnsMinWidth (it) {
      if (it.label) {
        return 16 + it.label.length * 14
      }
    },
    getColumnsAlign (col) {
      if (
        ['selection', 'image', 'color', 'audio'].find((it) => it === col.type)
      ) {
        return 'center'
      }
      if (['money'].find((it) => it === col.type)) {
        return 'right'
      }
    },
    // 初始化拖拽
    async initSort () {
      await this.sleep(1000)
      const el = this.$refs.table.$el.querySelector(
        '.el-table__body-wrapper tbody'
      )
      new Sortable(el, {
        handle: '.sortable',
        direction: 'vertical',
        forceFallback: true,
        onUpdate: this.onUpdate
      })
    },
    // 拖拽事件
    onUpdate (evt) {
      this.updateDom(evt)
      const { oldIndex, newIndex } = evt
      const row = this.data[oldIndex]
      this.data.splice(oldIndex, 1)
      this.data.splice(newIndex, 0, row)
    },
    // 恢复don节点
    updateDom (evt) {
      const { oldIndex } = evt
      const dom = evt.item
      const pDom = dom.parentElement
      pDom.removeChild(dom)
      pDom.insertBefore(dom, pDom.children[oldIndex])
    },
    // 等待
    sleep (t) {
      return new Promise((resolve) => setTimeout(resolve, t))
    },
    tableDoLayout () {
      this.$refs.table.doLayout()
    },
    setVirtualScroll () {
      if (!this.isVirtualScroll) {
        return false
      }
      this.virtualRows = this.data.slice(0, this.virtualScroll.showCount)
      setTimeout(() => {
        const rows =
          this.$refs.table.$el.getElementsByClassName('el-table__row')
        let clientHeight = 0
        for (let i = 0; i < rows.length; i++) {
          if (rows[i].clientHeight > clientHeight) {
            clientHeight = rows[i].clientHeight
          }
        }
        this.itemSize = clientHeight
        this.updateVisibleItems()
        this.addListenersScroll()
      }, 100)
    }
  },
  mounted () {
    // this.setVirtualScroll()
  },
  beforeDestroy () {
    this.removeListenersScroll()
  }
}
</script>
<style lang="less">
.sy-table-col-tip-hide {
  display: none;
}
.sy-table.el-table {
  margin-top: 16px;
  &.open-copy {
    user-select: none;
  }
  .el-table__row td.cellSelected {
    background-color: #fcdd82;
  }
  .el-input,
  .el-select {
    width: 100%;
    max-width: 494px;
  }
  .expand-sortable-drag {
    opacity: 0;
  }
  .table-img {
    max-width: 120px;
    max-height: 120px;
    min-width: 38px;
    min-height: 38px;
  }
  .table-color {
    display: inline-block;
    width: 70px;
    height: 28px;
    line-height: 28px;
    color: #fff;
    text-align: center;
  }
  .table-audio {
    width: 270px;
  }
  .empty-img {
    text-align: center;
    font-size: 36px;
  }
  .el-button--text {
    margin-bottom: 5px;
    padding: 0;
  }
  el-button--mini.is-circle {
    padding: 4px;
  }
  .table-tags {
    word-break: break-all;
    white-space: normal;
    .el-tag {
      margin: 1px;
    }
  }
  .header-icon {
    margin-left: 2px;
    font-size: 14px;
    line-height: 23px;
  }
  .columns-operation,
  .columns-wrap {
    .cell {
      white-space: normal;
    }
  }
  .text-tip {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    display: inline-block;
    vertical-align: bottom;
  }
  .sy-empty-block {
    padding: 60px 0;
    img {
      width: 180px;
      height: 160px;
    }
    div:nth-of-type(1) {
      color: #3e4965;
      font-weight: 500;
      font-size: 14px;
      line-height: 22px;
    }
    div:nth-of-type(2) {
      color: #9ea4b2;
      font-size: 12px;
      line-height: 20px;
    }
  }
}
.el-image-viewer__wrapper {
  z-index: 5000 !important;
}
.sy-table-contextmenu {
  position: fixed;
}
</style>
