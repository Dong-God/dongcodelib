<template>
  <div class="sy-field-sort">
      <el-table
        ref="fieldSortTable"
        class="sy-field-sort-table"
        @select="selectionChange"
        @select-all="selectionAllChange"
        :data="value">
        <el-table-column
            type="selection"
            :selectable="(row)=>{return !row[props.disabled]}"
            width="38">
        </el-table-column>
        <el-table-column
            type="index"
            label="序号"
            width="56">
        </el-table-column>
        <el-table-column
            :prop="props['label']"
            :label="fieldlabel">
        </el-table-column>
      </el-table>
  </div>
</template>
<script>
import Sortable from 'sortablejs'
export default {
  name: 'sy-field-sort',
  props: {
    sortable: {
      type: Boolean,
      default: true
    },
    value: {
      type: [Array],
      default () {
        return []
      }
    },
    fieldlabel: {
      type: String,
      default: '列名'
    },
    props: {
      type: Object,
      default () {
        return {
          label: 'label',
          value: 'prop',
          checked: 'isDefault',
          disabled: 'disabled'
        }
      }
    }
  },
  data () {
    return {
      stopSetChecked: false
    }
  },
  watch: {
    value: {
      async handler (v) {
        if (!this.stopSetChecked) {
          // this.$refs.fieldSortTable.doLayout()
          await this.sleep(0)
          this.setCheckedStatus()
        }
        this.stopSetChecked = false
      },
      immediate: true
    }
  },
  computed: {
  },
  methods: {
    selectionChange (v) {
      const key = this.props.value
      this.value.forEach(item => {
        item[this.props.checked] = !!v.find(it => it[key] === item[key])
      })
    },
    selectionAllChange (selection) {
      this.selectionChange(selection)
    },
    // 初始化拖拽
    initSortable () {
      const el = this.$el.querySelector(
        '.sy-field-sort-table .el-table__body-wrapper tbody'
      )
      new Sortable(el, {
        // handle: '.field-item',
        direction: 'vertical',
        animation: 500, // 拖拽的动画
        forceFallback: true,
        onUpdate: this.onUpdate
      })
    },
    onUpdate (evt) {
      this.stopSetChecked = true
      this.updateDom(evt)
      const { oldIndex, newIndex } = evt
      const row = this.value[oldIndex]
      this.value.splice(oldIndex, 1)
      this.value.splice(newIndex, 0, row)
      this.$emit('input', this.value)
    },
    // 恢复don节点
    updateDom (evt) {
      const { oldIndex } = evt
      const dom = evt.item
      const pDom = dom.parentElement
      pDom.removeChild(dom)
      pDom.insertBefore(dom, pDom.children[oldIndex])
    },
    // 设置勾选状态
    setCheckedStatus () {
      this.value.forEach(item => {
        this.$refs.fieldSortTable.toggleRowSelection(item, item[this.props.checked])
      })
    },
    sleep (t) {
      return new Promise(resolve => setTimeout(resolve, t))
    }
  },
  mounted () {
    this.sortable && this.initSortable()
  }
}
</script>
<style lang="less" scoped>
.sy-field-sort{
   .field-item{
    span{
        display: inline-block;
    }
   }
}
</style>
