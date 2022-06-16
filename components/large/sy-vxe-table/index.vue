<script>
import Sortable from 'sortablejs'
import debounce from '../../../utils/debounce'

import Vue from 'vue'
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import TABLE_MIXINS from '../../simple/sy-table/mixin'

Vue.use(VXETable)
const NOOP = (_) => _
export default {
  name: 'sy-vxe-table',
  mixins: [...TABLE_MIXINS],
  props: {
    disabled: { type: Boolean, default: false },
    colspan: { type: Array, default: () => [] },
    on: [Object],
    bind: {
      default: () => ({
        rowKey: true
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
        if (this._isMounted) {
          this.$nextTick(() => {
            this.handlerSelect()
          })
        }
      },
      immediate: true
    }
  },
  computed: {
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
      handlerCellClick,
      getCellClassName,
      hanlderKeydown,
      handlerHeaderClick,
      openCopy,
      handlerContextmenu,
      handlerPaste,
      setHeaderRowClass
    } = this
    const table = h(
      'vxe-table',
      {
        class: {
          'sy-table': true,
          'el-table': true,
          'vxe-table': true,
          'open-copy': openCopy
        },
        props: {
          data,
          spanMethod,
          ...{ id: '_id', ...bind },
          cellClassName: getCellClassName
          // 'header-row-class-name': setHeaderRowClass
        },
        on: {
          ...on,
          'sort-change': handlerSort,
          'checkbox-change': handlerSelect,
          'checkbox-all': handlerSelect,
          'cell-click': handlerCellClick,
          'header-cell-click': handlerHeaderClick,
          keydown: hanlderKeydown

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
                  <div>暂无数据</div>
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
    return h('span', { on: { paste: handlerPaste } }, [table])
  },
  methods: {
    // 表头class
    setHeaderRowClass () {
      return ''
    },
    // 初始化预请求接口
    async initPreloadApis () {
      for (const key in this.preloadApis) {
        this.preload = false
        this.apiData[key] = await this.preloadApis[key]()
      }
      this.preload = true
    },
    handlerCellClick (args) {
      this.$emit('cell-click', args)
      if (this.on?.cellClick) {
        this.on?.cellClick(args)
      }
      const {
        row,
        rowIndex,
        $rowIndex,
        column,
        columnIndex,
        $columnIndex,
        triggerRadio,
        triggerCheckbox,
        triggerTreeNode,
        triggerExpandNode,
        $event
      } = args
      if (this.openCopy) {
        if ($event.shiftKey) {
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
    handlerSelect () {
      const selection = this.$refs.table.getCheckboxRecords(true)
      if (this.on?.select) {
        this.on?.select(selection)
      }
      this.$emit('select', selection)
    },
    handlerSort (...args) {
      this.$emit('sort', ...args)
    },
    // 键盘事件
    hanlderKeydown ({ $event }) {
      if ($event.key === 'c' && $event.ctrlKey) {
        this.handlerCopyText($event)
      }
    },
    handlerPaste (e) {
      this.handlerCopyExcel(e)
    },
    handlerHeaderClick ({ $rowIndex, column, columnIndex, $columnIndex, triggerResizable, triggerSort, triggerFilter, $event }) {
      if (this.on && this.on['header-click']) {
        this.on['header-click'](column, $event)
      }
      if (this.openCopy || this.copyExcel) {
        this.copy.startRowIndex = 0
        this.copy.startColumnIndex = columnIndex
        this.copy.endRowIndex = this.data.length - 1
        this.copy.endColumnIndex = columnIndex
      }
    },
    // 获取cell的class
    getCellClassName ({
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex
    }) {
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
      if (copyPosition) {
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
    // 获取tableColumn配置属性
    getTableColumnProps (it) {
      const BASE_PROP = {
        className: this.getClassName(it),
        sortable: it.sortable,
        width: this.getColumnsWidth(it),
        minWidth: this.getColumnsMinWidth(it),
        align: this.getColumnsAlign(it),
        type: this.getColumnsType(it),
        ...it.itemBind
      }
      return {
        ...BASE_PROP,
        title: it.label,
        field: it.prop
      }
    },
    getColumnsType (it) {
      if (it.type === 'selection') {
        return 'checkbox'
      }
      if (it.type === 'index') {
        return 'seq'
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
            'vxe-column',
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
      this.$refs.table.refreshColumn()
    }
  },
  mounted () {},
  beforeDestroy () {}
}
</script>
<style lang="less">
.sy-table-col-tip-hide {
  display: none;
}
.vxe-table.el-table {
  td {
    border: none;
  }
}

.vxe-table.el-table {
  margin-top: 16px;
  &.open-copy {
    user-select: none;
  }
  .cellSelected {
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
