<template>
     <el-dialog
      title="导入"
      :visible="visible"
      width="1000px"
      @close="close"
      custom-class="sy-import-dialog"
      >
      <div class="sy-import">
        <span v-if='template'>
          <el-button @click="download" type="primary">下载模板</el-button>
          <i class="arrow el-icon-right"></i>
        </span>
        <sy-upload class="sy-import-upload" v-model="file" v-bind="upload" />
        <sy-normal-table ref="table" @select="select" v-bind="table" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="importSubmit" :disabled="!selectedIds.length">{{confirmText}}</el-button>
      </span>
    </el-dialog>
</template>
<script>

import XLSX from 'xlsx'
export default {
  name: 'sy-import',
  props: {
    visible: {
      type: Boolean,
      require: true
    },
    tableColumns: {
      type: Array,
      required: true
    },
    template: {
      type: String,
      required: false
    },
    uploadActionFun: {
      type: Function,
      required: false
    },
    importSubmitFun: {
      type: Function,
      required: true
    },
    hasBorder: {
      type: Boolean,
      default: true
    },
    tableHeight: {
      type: Number,
      default: 400
    },
    readOptions: {
      type: [Object]
    },
    confirmText: {
      type: String,
      default: '确 定'
    }
  },
  data () {
    const that = this
    return {
      tableData: [],
      checkedAll: false,
      selectedIds: [],
      file: [],
      upload: {
        type: 'file',
        accept: ['xls', 'xlsx'],
        async httpRequest (file) {
          if (that.uploadActionFun) {
            that.tableData = await that.uploadActionFun(file?.file)
          } else {
            const fileBuffer = await that.readXlsxFile(
              file,
              that.readOptions
            )
            that.tableData = fileBuffer.map((it, index) => {
              const ret = { index }
              that.tableColumns.forEach((col) => {
                ret[col.prop] = it[col.label]
              })
              return ret
            })
          }
          console.log('tableData', that.tableData)
          that.$refs.table.handlerSearch()
        }
      }
    }
  },
  computed: {
    table () {
      const that = this
      return {
        virtualScroll: {
          showVirtualNumber: 10, // 数据数量超过N条触发虚拟滚动
          showCount: 20 // 渲染数据条数
        },
        tableBind: {
          height: that.tableHeight,
          border: that.hasBorder
        },
        pagination: false,
        initSearch: false,
        columns (data, props) {
          return [...that.tableColumns]
        },
        async search ({ pageFilter }) {
          return { list: that.tableData }
        }
      }
    }
  },
  methods: {
    readXlsxFile (file, options) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = function (e) {
          var data = new Uint8Array(e.target.result)
          var workbook = XLSX.read(data, { type: 'array' })
          resolve(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], options))
        }
        reader.readAsArrayBuffer(file?.file)
      })
    },
    close () {
      this.$emit('update:visible', false)
    },
    download () {
      this.$utils.oDownLoad(this.template)
    },
    importSubmit () {
      this.importSubmitFun(this.selectedIds)
    },
    select (selection) {
      this.selectedIds = [...selection]
    }
  },
  created () {
  }
}
</script>
<style lang="less">
.sy-import-dialog{
  .sy-import{
    .el-table {
      max-height: 500px;
    }
      .arrow{
          margin: 0 8px;
      }
      .check-all{
          float: right;
      }
      tbody{
        .columns-errorMsg{
          color: #DE3509;
        }
      }

  }
  .sy-import-upload{
      display: inline-block;
  }
  .el-upload-list{
    display: none;
  }
}

</style>
