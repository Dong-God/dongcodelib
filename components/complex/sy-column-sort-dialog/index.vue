<template>
  <el-dialog
    :title="title"
    :visible="visible"
    custom-class="sy-column-sort-dialog"
    width="800px"
    @close="handleClose"
    >
    <p class="tip">{{tip}}</p>
    <sy-field-sort :value="myData" v-bind="bind"></sy-field-sort>

    <span slot="footer" class="dialog-footer">
        <el-button @click="restoreDefault">恢复默认列</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: 'sy-column-sort-dialog',
  props: {
    visible: {
      type: Boolean,
      require: true
    },
    title: {
      type: String,
      default: '自定义列'
    },
    tip: {
      type: String,
      default: '勾选需要显示的列，默认列不可取消，按住鼠标上下拖动列名排序'
    },
    value: {
      type: [Array],
      default () {
        return []
      }
    },
    bind: {
      type: Object,
      default () {
        return {}
      }
    },
    'on-confirm': {
      type: Function
    }
  },
  data () {
    return {
      myData: []
    }
  },
  watch: {
    value: {
      handler (v) {
        this.myData = JSON.parse(JSON.stringify(v))
      },
      immediate: true
    }
  },
  computed: {
  },
  methods: {
    // 恢复默认列
    restoreDefault () {
      this.myData = JSON.parse(JSON.stringify(this.value))
    },
    handleClose () {
      this.$emit('update:visible', false)
    },
    async handleSave () {
      this.$emit('input', [...this.myData])
      const res = await this.onConfirm()
      if (res !== false) {
        this.handleClose()
      }
    }
  },
  mounted () {
  }
}
</script>
<style lang="less">
.sy-column-sort-dialog{
  .el-dialog__body{
    padding-top:16px;
    max-height: 500px;
    overflow: auto;
    .tip{
      margin: 0 0 8px 0;
      height: 32px;
      line-height: 32px;
      background: #F3F4F5;
      padding-left: 12px;
      border-radius: 4px;
      color: #868D9F;
    }
  }
}
</style>
