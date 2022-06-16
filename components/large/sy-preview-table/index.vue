<template>
  <div class="sy-preview-table">
    <sy-normal-table v-bind="table" ref="table" />
    <sy-form v-bind="form" ref="form" />
    <div class="bottomBtns" v-if="bottomBtns">
      <sy-button text="返回" :call="() => $back(bottomBtns.backUrl)" />
      <sy-button
        text="提交"
        :confirm="bottomBtns.confirm"
        :call="submit"
        type="primary"
      />
    </div>
  </div>
</template>
<script>

import XLSX from 'xlsx'

export default {
  name: 'sy-preview-table',
  props: {
    setOperat: {
      default: () => () => []
    },
    initData: [Function],
    bottomBtns: {
      type: Object
    },
    btns: [Object],
    tip: [Array],
    columns: [Array],
    filters: [Array],
    delBtn: {
      type: Boolean,
      default: true
    },
    hasOperation: {
      type: Boolean,
      default: true
    },
    readOptions: {
      type: [Object]
    },
    value: [Array]
  },
  data () {
    return {
      data: []
    }
  },
  computed: {
    showData () {
      const data = this.data
      const tableRef = this.$refs.table
      const {
        pageFilter: { pageNo, pageSize }
      } = tableRef
      return data.slice((pageNo - 1) * pageSize, pageNo * pageSize)
    },
    table () {
      const that = this
      return {
        tip: that.tip,
        filters: that.filters,
        btns: [
          {
            text: '下载模板',
            type: '',
            hide: !that.btns.downLoadUrl && !that.btns.downLoadAPI,
            call () {
              that.$utils.oDownLoad(
                that.btns.downLoadUrl,
                that.btns.host,
                that.btns.downLoadFilename,
                that.btns.downLoadAPI
              )
            }
          },
          {
            text: '导入',
            type: 'primary',
            file: {
              type: ['xls', 'xlsx'],
              async httpRequest ({ file }) {
                if (that.btns.upload) {
                  const data = await that.btns.upload(file)
                  that.data = data.map((it, index) => ({ ...it, index }))
                } else {
                  const data = await that.readXlsxFile(
                    file,
                    that.readOptions
                  )
                  that.data = data.map((it, index) => {
                    const ret = { index }
                    that.columns.forEach((col) => {
                      ret[col.prop] = it[col.xlsxLabel]
                    })
                    return ret
                  })
                }

                that.setTableData()
              }
            }
          },
          {
            text: '批量删除',
            type: 'danger',
            confirm: '你确定批量删除吗？',
            hide: !that.delBtn,
            call (data) {
              const arr = data.selection.map((it) => it.index)
              that.data = that.data.filter(
                (it) => arr.indexOf(it.index) === -1
              )
              that.setTableData()
            }
          }
        ],
        columns () {
          return [
            { type: 'selection', hide: !that.delBtn },
            ...that.columns,
            {
              label: '操作',
              type: 'btns',
              width: 180,
              itemBind: {
                fixed: 'right'
              },
              btns (props) {
                return [
                  ...that.setOperat(props),
                  {
                    text: '删除',
                    type: 'text',
                    confirm: '你确定删除吗？',
                    hide: !that.delBtn,
                    async call () {
                      const index = props.row.index
                      that.data = that.data.filter((it) => it.index !== index)
                      that.setTableData()
                    }
                  },
                  {
                    text: '修改',
                    type: 'text',
                    async call () {
                      const o = JSON.parse(JSON.stringify(props.row))
                      that.$refs.form.open('修改', o)
                    }
                  }
                ]
              }
            }
          ]
        },
        search () {
          return {
            list: that.showData,
            total: that.data.length
          }
        }
      }
    },
    form () {
      const that = this
      return {
        dialog: {
          width: '1000px'
        },
        bind: {
          inline: true // 表单项不换行
        },
        list () {
          return that.columns
            .filter((it) => it.formHide !== true)
            .map((it) => ({
              tag: it.tag,
              prop: it.prop,
              label: it.label,
              bind: it.bind,
              fullRow: it.fullRow,
              itemBind: {
                rules: it.required && that.$utils.RULES.RULES_REQUIRE
              }
            }))
        },
        submit (data) {
          const index = that.data.findIndex((it) => it.index === data.index)
          that.$set(that.data, index, data)
          that.setTableData()
        }
      }
    }
  },
  watch: {},
  methods: {
    readXlsxFile (file, options) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = function (e) {
          var data = new Uint8Array(e.target.result)
          var workbook = XLSX.read(data, { type: 'array' })
          resolve(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], options))
        }
        reader.readAsArrayBuffer(file)
      })
    },
    checkFormData () {
      const requiredCols = this.columns
        .filter((it) => it.required)
        .map((it) => it.prop)
      if (requiredCols.length) {
        for (let i = 0; i < this.data.length; i++) {
          const item = this.data[i]
          for (let j = 0; j < requiredCols.length; j++) {
            const porp = requiredCols[j]
            const value = item[porp]
            if (!value && value !== 0) {
              this.$message.error(`第${i + 1}条数据填写不完整`)
              return false
            }
          }
        }
      }
      return true
    },
    submit () {
      if (!this.data || !this.data.length) {
        this.$message.error('请上传数据后提交')
        throw new Error('请上传数据后提交')
      } else if (!this.checkFormData()) {
        throw new Error('请上传数据后提交')
      } else {
        this.bottomBtns.submit(this.data)
      }
    },
    setTableData () {
      const tableRef = this.$refs.table
      tableRef.setValue(this.showData)
      tableRef.pageFilter.total = this.data.length
    },
    async setInit () {
      if (this.initData) {
        const data = await this.initData()
        data.forEach((it, i) => {
          it.index = i
        })
        this.data = data
        this.setTableData()
      }
    }
  },
  created () {},
  mounted () {
    this.setInit()
  },
  components: {}
}
</script>
<style lang="less" scoped>
.sy-preview-table {
  .bottomBtns {
    margin-top: 10px;
    text-align: center;
  }
}
</style>
