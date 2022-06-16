<template>
  <div class="sy-table-log">
    <el-switch v-model="isShowTable" @change='changeSwitch' active-color="#5F3BCE">
      操作日志
    </el-switch>
    <div class="title" v-if="title">{{ title }}</div>
    <sy-normal-table
      v-if="isShowTable"
      v-bind="table"
      ref="table"
    ></sy-normal-table>
  </div>
</template>

<script>
export default {
  name: 'sy-table-log',
  props: {
    ajaxData: {},
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      isShowTable: false
    }
  },
  computed: {
    table () {
      const that = this
      return {
        tableBind: {
          border: true,
          height: '210'
        },
        columns () {
          return [
            {
              type: 'index',
              label: '序号',
              width: '100px'
            },
            {
              label: '操作类型',
              prop: 'operType',
              width: '100px'
            },
            {
              label: '操作人',
              prop: 'createByName',
              width: '120px'
            },
            {
              label: '操作时间',
              prop: 'createDate',
              type: 'time',
              format: 'yyyy-MM-dd hh:mm:ss',
              width: '150px'
            },
            {
              label: '备注',
              prop: 'remarks'
            }
          ]
        },
        async search ({ pageFilter }) {
          if (that.isShowTable && that.ajaxData?.entityId) {
            const data = await this.$syAjax.post(
              '/log/api/operatelog/summary',
              {
                ...pageFilter,
                data: that.ajaxData
              }
            )
            console.log(data)
            return data
          } else {
            return {
              list: []
            }
          }
        }
      }
    }
  },
  watch: {
    ajaxData: {
      handler () {
        console.log(11)
        this.isShowTable && this.$refs.table.handlerSearch()
      },
      deep: true
    }
  },
  methods: {
    clearData () {
      this.$refs.table?.setValue([])
    },
    changeSwitch (val) {
      this.$emit('change', this.isShowTable)
    }
  },
  created () {},
  mounted () {}
}
</script>
<style scoped lang="less">
.sy-table-log {
  .title{
    display: inline-block;
    margin-left: 8px;
    font-size: 16px;
    vertical-align: middle;
  }
  /deep/.sy-table.el-table .sy-empty-block img{
    width:90px;
    height:80px;
  }
}
</style>
