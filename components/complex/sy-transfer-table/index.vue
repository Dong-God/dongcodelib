<script>
import Sortable from 'sortablejs'
import DomUtils from '../../../utils/dom'
const { DomStopEvent } = DomUtils
export default {
  name: 'sy-transfer-table',
  props: {
    tips: { type: [Array] },
    limit: { type: [Number] },
    sortable: { default: true },
    value: { type: [Array], required: true },
    leftTable: { type: [Object], required: true },
    rightTable: { type: [Object], required: true },
    confirmSelectAll: { default: false }
  },
  data () {
    return {
      rows: [], // 右边选中行
      nowList: [], // 页面显示行,
      originSelect: []// 保留当前页面选中的行
    }
  },
  computed: {
    // 左边表格内容
    myLeftTable () {
      const leftTable = {
        ...this.$utils.deepClone(this.leftTable),
        search: this.onSearch,
        on: {
          'cell-dblclick': this.cellDblclick, // 双击选中
          'select-all': this.selectionChange,
          select: this.selectionChange
        }
      }
      // 设置表格配置项
      leftTable.tableBind = {
        ...leftTable.tableBind,
        height: 500
      }
      leftTable.columns.unshift({ type: 'selection' })

      return leftTable
    },
    // 右边表格内容
    myRightTable () {
      const that = this
      const rightTable = this.$utils.deepClone(this.rightTable)
      // 设置表格配置项
      rightTable.tableBind = {
        ...rightTable.tableBind,
        height: 400
      }
      // 添加操作项
      rightTable.columns.push({
        label: '操作',
        type: 'btns',
        btns (props) {
          return [
            {
              text: '',
              type: 'primary',
              clazz: 'sortable',
              hide: !that.sortable,
              bind: { icon: 'el-icon-sort', circle: true, size: 'mini' }
            },
            {
              text: '',
              type: 'danger',
              bind: { icon: 'el-icon-delete', circle: true, size: 'mini' },
              call () {
                that.delRow(props.row)
                that.flashCheckBox()
              }
            }
          ]
        }
      })
      return rightTable
    }
  },
  watch: {
    rows () {
      this.$emit('input', this.rows)
    },
    value (v, o) {
      if (JSON.stringify(v) !== JSON.stringify(o)) {
        this.rows = this.value
      }
    }
  },
  methods: {
    // 双击选中
    cellDblclick (row) {
      this.addRow(row)
      this.flashCheckBox()
    },
    // checkBox选中事件
    selectionChange (selection) {
      this.originSelect = selection
      const key = this.getKey()
      this.nowList.forEach((row) => {
        const has = selection.find((it) => it[key] === row[key])
        if (has) {
          this.addRow(row)
        } else {
          this.delRow(row)
        }
      })
    },
    selectAll (e) {
      const isChecked = e.currentTarget.classList.contains('is-checked')
      if (this.confirmSelectAll) {
        this.$confirm(`您确认${isChecked ? '取消' : ''}全选吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.domStop.run()
        })
      }
    },
    // 搜索内容处理数据
    async onSearch (...args) {
      const data = await this.leftTable.search(...args)
      this.nowList = data.list
      this.flashCheckBox()
      return data
    },
    // 初始化拖拽
    async initSort () {
      await this.sleep(1000)
      const el = this.$refs.rightTable.$el.querySelector(
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
      const row = this.rows[oldIndex]
      this.rows.splice(oldIndex, 1)
      this.rows.splice(newIndex, 0, row)
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
    // 刷新checkBox
    flashCheckBox () {
      setTimeout(() => {
        const key = this.getKey()
        const leftTable = this.$refs.leftTable.$refs.table.$refs.table
        this.nowList.forEach((row) => {
          const has = this.rows.find((it) => it[key] === row[key])
          if (has) {
            leftTable.toggleRowSelection(row, true)
          } else {
            leftTable.toggleRowSelection(row, false)
          }
        })
      }, 10)
    },
    // 获取唯一标识
    getKey () {
      return this.leftTable.tableBind ? this.leftTable.tableBind.rowKey : 'id'
    },
    // 添加行
    addRow (row) {
      const key = this.getKey()
      const has = this.rows.find((it) => it[key] === row[key])
      if (!has) {
        this.rows.push(row)
      }
    },
    // 删除行
    delRow (row) {
      const key = this.getKey()
      for (let i = 0; i < this.rows.length; i++) {
        if (this.rows[i][key] === row[key]) {
          this.rows.splice(i, 1)
          return false
        }
      }
    }
  },
  mounted () {
    if (this.sortable) {
      this.initSort() // 初始化排序
    }
    this.rows = this.value
    setTimeout(() => {
      if (this.confirmSelectAll) {
        this.domStop = new DomStopEvent(this.$el.querySelector('.el-table-column--selection .el-checkbox'), 'click')
        this.domStop.addEventFn(this.selectAll)
      }
    }, 0)
  },
  render () {
    const { myLeftTable, myRightTable, rows, limit, tips } = this
    return (
      <div class="sy-transfer-table-wrap">
        {tips && <div class="tips">
          {tips.map(tip => <div domPropsInnerHTML={tip.text} />)}
        </div>}
        <div class="sy-transfer-table">
          <el-card class="box-card">
            <sy-normal-table ref="leftTable" {...{ props: myLeftTable }} />
          </el-card>
          <el-card class="box-card">
            <div class={`slected-numb ${limit && rows.length > limit && 'over-limit'}`}>已选择 {rows.length}{limit && `/${limit}`} 条</div>
            <sy-table
              ref="rightTable"
              {...{
                props: { ...myRightTable, data: rows, bind: { height: 500 } }
              }}
            />
          </el-card>
        </div>
      </div>
    )
  }
}
</script>
<style lang="less">
body {
  .sy-transfer-table-dialog {
    width: 85vw;
    height: 85vh;
    overflow: auto;
    padding: 0;
    .el-message-box__content{
      box-sizing: border-box;
      height: calc(100% - 60px);
      overflow: auto;
    }
    .el-message-box__btns{
      box-sizing: border-box;
      height:60px;
      line-height: 60px;
      padding:0 15px 0 0;
    }
  }
  .sy-transfer-table-wrap{
    .sy-transfer-table {
      display: flex;
      > .box-card {
        width: 49%;
      }
      .box-card + .box-card {
        margin-left: 2%;
      }
      .slected-numb {
        height: 48px;
        color: var(--main-color);
        line-height: 66px;
        padding-left: 8px;
      }
      .over-limit{
        color: #DE3509;
      }
    }
    .tips{
      line-height: 16px;
      margin-bottom: 16px;
      background: var(--lump-bg);
      color: #909399;
      padding: 8px 16px;
      font-size: 12px;
    }
  }

}
</style>
