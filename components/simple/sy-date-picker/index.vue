<template>
  <el-select
    class="sy-select"
    v-bind="{ placeholder, filterable, disabled, multiple, ...bind }"
    v-on="_events"
    @change="handlerChange"
    @focus="handlerFocus"
    :value="value"
    :remoteMethod="myRemoteMethod"
    :clearable="bind.clearable === undefined ? true : bind.clearable"
    collapse-tags
  >
    <el-option
      v-for="item in list"
      :key="item[optionsProps.value]"
      :label="getLabel(item)"
      :value="item[optionsProps.value] + ''"
      :disabled="item.disabled"
    ></el-option>
  </el-select>
</template>
<script>
export default {
  name: 'sy-select',
  props: {
    options: {
      type: [Array, Function, String],
      default () {
        return []
      }
    },
    flashOptions: {
      type: [Boolean],
      default: false
    },
    disabled: {
      type: [Boolean],
      default: false
    },
    remoteMethod: {
      type: Function
    },
    filterable: [Boolean],
    multiple: [Boolean],
    placeholder: {
      default: '请选择',
      type: [String]
    },
    bind: {
      default () {
        return {}
      }
    },
    maxLen: {
      default: 500
    },
    value: {
      required: true
    },
    optionsProps: {
      type: Object,
      default () {
        return {
          label: 'label',
          value: 'value'
        }
      }
    }
  },
  data () {
    return {
      items: []
    }
  },
  watch: {
    options () {
      if (this.flashOptions) {
        this.initOptions()
      }
    },
    value: {
      handler (v) {
        this.filterMethod(v, true)
      }
    }
  },
  async created () {},
  computed: {
    list () {
      // 数组去重
      const map = {}
      return this.items.filter((it) => {
        if (map[it.value]) {
          return false
        }
        map[it.value] = true
        return true
      })
    }
  },
  methods: {
    handlerFocus () {
      this.filterMethod(this.value, true)
    },
    filterMethod (query, isValue) {
      if (!this._items) {
        return []
      }
      // 如果超长选项长度
      if (this._items.length > this.maxLen) {
        if (!query) {
          this.items = []
        } else {
          if (isValue) {
            // 如果是直接有值，需要显示出中文名称
            const one = this._items.find((item) => item.value === query)
            this.items = one ? [one] : []
          } else {
            this.items = this._items.filter((item) => {
              return item.label.toLowerCase().indexOf(query.toLowerCase()) > -1
            })
          }
        }
      }
    },
    handlerChange (v) {
      this.$emit(
        'change',
        v,
        this.items.find((it) => v === it.value)
      )
    },
    async initOptions () {
      const { options } = this
      if (typeof options === 'string') {
        this.items = this.$dict[options]
      } else if (typeof options === 'function') {
        this.items = await options()
      } else if (Array.isArray(options)) {
        this.items = options
      }
      this._items = this.items
      if (this.items.length > this.maxLen) {
        this.bind.filterable = true
        if (!this.bind.placeholder) {
          this.bind.placeholder = '请输入搜索后选择'
        }
        if (!this.bind.filterMethod) {
          this.bind.filterMethod = this.filterMethod
        }
        if (!this.bind.noDataText) {
          this.bind.noDataText = '请输入搜索后显示数据'
        }
        this.items = []
        if (this.value) {
          this.filterMethod(this.value, true)
        }
      }
    },
    async myRemoteMethod (query) {
      this.items = await this.remoteMethod(query)
    },
    getLabel (item) {
      const label = item[this.optionsProps.label]
      return label
    }
  },
  mounted () {
    this.initOptions()
  }
}
</script>
<style lang="less" scoped>
.sy-select {
  width: 100%;
  max-width: 494px;
}
</style>
