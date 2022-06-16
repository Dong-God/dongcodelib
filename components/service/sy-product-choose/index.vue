<template>
   <div>
       <sy-transfer-table :value="myValue" @input="handleInput" :sortable="sortable" :leftTable="{...transferTable.leftTable,...bindLeftTable}" :rightTable="{...transferTable.rightTable,...bindRightTable}" />
   </div>
</template>

<script>
export default {
  name: 'sy-product-choose',
  props: {
    value: {
      type: Array,
      default () {
        return []
      }
    },
    sortable: {
      default: false
    },
    bindLeftTable: {
      default () {
        return {}
      }
    },
    bindRightTable: {
      default () {
        return {}
      }
    }
  },
  computed: {

  },
  watch: {
    value: {
      async handler (v, o) {
        if (JSON.stringify(this.myValue.map(it => it.code)) !== JSON.stringify(v)) {
          const data = await this.$syAjax.post(
            '/data-assets-service/api/commodity/listByCodes', v
          )
          this.myValue = data
        }
      },
      immediate: true
    }
  },
  data () {
    const that = this
    return {
      myValue: [],
      transferTable: {
        leftTable: {
          tableBind: {
            rowKey: 'code'
          },
          filters: [
            {
              tag: 'el-input',
              prop: 'name',
              label: '商品名称'
            }
          ],
          columns: [
            { label: '商品名称', prop: 'name' },
            { label: '商品编码', prop: 'code' },
            { label: '品牌', prop: 'brandName' }
          ],
          async search ({ filtersValue, pageFilter }) {
            const data = await that.$syAjax.post(
              '/data-assets-service/api/commodity/listPage', {
                data: {
                  ...filtersValue
                },
                ...pageFilter
              }
            )
            return {
              list: data.list,
              total: data.total
            }
          }
        },
        rightTable: {
          columns: [
            { label: '商品名称', prop: 'name' },
            { label: '商品编码', prop: 'code' },
            { label: '品牌', prop: 'brandName' }
          ]
        }
      }
    }
  },
  methods: {
    handleInput (v) {
      this.$emit('input', v.map(it => it.code))
      this.$emit('options', [...v])
    }
  }
}
</script>
