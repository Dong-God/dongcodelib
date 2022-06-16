<template>
 <div class="sy-select-warp">
   <el-popover
      v-if="showEye && multiple"
      width="250"
      v-model="popoverVisible"
      :disabled="disabled"
      placement="right-start"
      trigger="click"
      popper-class="sy-select-popover"
    >
      <div class="selected-info-block">
        <p>已选数据</p>
        <ul class="selected-data-ul">
          <li v-for="it in selectedItems" :key="it[optionsProps.value]">
            {{it[optionsProps.label]}}
            <i v-if="!it.disabled"  @click="deleteSelectedData(it[optionsProps.value])" class="el-icon-circle-close"></i>
          </li>
        </ul>
      </div>
      <el-button class="eye-btn" slot="reference" icon="el-icon-view" type="text"></el-button>
  </el-popover>
  <el-select
    class="sy-select"
    :class="multiple&&showEye ?'is-multiple-showeye':''"
    v-bind="{
      collapseTags: true,
      placeholder,
      filterable,
      disabled,
      multiple,
      ...bind,
    }"
    v-on="{ ..._events, input: [], change: [] }"
    @change="handlerChange"
    @focus="handlerFocus"
    @input="handlerInput"
    @keydown.native.capture.delete="stopEvent"
    :value="getValue()"
    :remoteMethod="remoteMethod && myRemoteMethod"
    :clearable="bind.clearable === undefined ? true : bind.clearable"
  >
    <el-option
      v-for="item in list"
      :key="item[optionsProps.value]"
      :label="getLabel(item)"
      :value="item[optionsProps.value] + ''"
      :disabled="item.disabled"
    ></el-option>
  </el-select>
 </div>
</template>
<script>
export default {
  name: 'sy-select',
  props: {
    showEye: {
      type: [Boolean],
      default: false
    },
    isValueNumber: {
      type: [Boolean],
      default: false
    },
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
    },
    disabledItemsModel: { // 通过disabledItems判断禁用模式
      type: Boolean,
      default: false
    },
    disabledItems: {
      type: Array,
      default: () => ([])
    }
  },
  data () {
    return {
      items: [],
      popoverVisible: false,
      backupsOptions: []
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
  async created () {
    this.initMyRemoteMethod()
  },
  computed: {
    selectedItems () {
      return this.backupsOptions.filter(item => this.value.find(it => it === item[this.optionsProps.value]))
    },
    list () {
      // 数组去重
      const map = {}
      return this.items.filter((it) => {
        if (map[it[this.optionsProps.value]]) {
          return false
        }
        map[it[this.optionsProps.value]] = true
        this.disabledItemsModel && (it.disabled = this.disabledItems && Boolean(this.disabledItems.find(item => item === it[this.optionsProps.value])))
        return true
      })
    }
  },
  methods: {
    stopEvent (e) {
      if (this.multiple) {
        e.stopPropagation()
      }
    },
    initMyRemoteMethod () {
      if (this.remoteMethod) {
        this.bind.remote = true
        this.bind.filterable = true
      }
    },
    getValue () {
      if (!this.multiple) {
        return this.value === undefined ? undefined : this.value + ''
      }
      return this.value
    },
    handlerInput (v) {
      this.$emit('input', this.dealValue(v))
    },
    handlerFocus () {
      this.filterMethod(this.value, true)
    },
    filterMethod (query, isValue) {
      if (!this.backupsOptions) {
        return []
      }
      // 如果超长选项长度
      if (this.backupsOptions.length > this.maxLen) {
        if (!query) {
          this.items = []
        } else {
          this.items = this.backupsOptions.filter((item) => {
            if (isValue) {
              if (Array.isArray(query)) {
                return query.indexOf(item[this.optionsProps.value]) !== -1
              } else {
                return item[this.optionsProps.value] === query
              }
            } else {
              return item[this.optionsProps.label].toLowerCase().indexOf(query.toLowerCase()) > -1
            }
          })
        }
      }
    },
    dealValue (v) {
      if (this.isValueNumber) {
        if (!v) {
          return v
        }
        if (Array.isArray(v)) {
          return v.map((it) => Number(it))
        }
        return Number(v)
      }
      return v
    },
    handlerChange (v) {
      this.showEye && this.multiple && v.length && (this.popoverVisible = true)
      this.$emit(
        'change',
        this.dealValue(v),
        this.items.find((it) => v === it[this.optionsProps.value])
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
      this.backupsOptions = [...this.items]
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
      if (this.remoteMethod) {
        this.items = await this.remoteMethod(query)
      }
    },
    getLabel (item) {
      const label = item[this.optionsProps.label]
      return label
    },
    // 在已选数据面板删除已选数据
    deleteSelectedData (v) {
      const selectedData = [...this.value].filter(it => it !== v)
      this.$emit('input', this.dealValue(selectedData))
    }
  },
  mounted () {
    this.initOptions()
  }
}
</script>
<style lang="less" scoped>
.sy-select-warp{
  position: relative;
  .eye-btn{
    position: absolute;
    right: 28px;
    top:0;
    z-index: 10;
  }
}
.sy-select-popover{
  .selected-info-block{
    padding-left: 10px;
    p{
      margin: 0px;
      color: #0D1B3F;
      line-height: 16px;
    }
    .selected-data-ul{
      margin-top: 6px;
      padding: 0;
      max-height: 200px;
      overflow: auto;
      list-style: none;
      border-top: 1px solid #E6E8EB;
      li{
        position: relative;
        max-width: 250px;
        line-height: 30px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-right: 10px;
        i{
          cursor: pointer;
          color: #9EA4B2;
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          }
      }
    }
  }
}
.sy-select {
  width: 100%;
  max-width: 494px;
}
</style>
<style lang="less">
.sy-select-warp{
  .sy-select{
    &.is-multiple-showeye{
      .el-select__tags{
        .el-tag__close{
          display: none;
        }
      }
    }
  }
}

</style>
