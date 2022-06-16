<template>
  <div class="sy-more-show">
    <div class="more-show-tags">
      <el-tag v-for="(it, i) in values" :key="getValueShow(it, 'value')" closable @close="deleteValue(i)" >{{ getValueShow(it, "label") }}</el-tag>
    </div>
    <el-dropdown v-if="values" class="data-options" trigger="click" @visible-change="function(v){toggle = v}">
      <span class="el-dropdown-link">
        <i :class="toggle?'el-icon-arrow-up':'el-icon-arrow-down'"></i>
      </span>
      <el-dropdown-menu slot="dropdown" class="sy-more-show-dropdown-menu">
        <el-dropdown-item v-for="(it, i) in values" :key="getValueShow(it, 'value')"><span>{{ getValueShow(it, "label") }}</span> <i class="close-icon el-icon-close" @click="deleteValue(i)" /></el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
export default {
  name: 'sy-more-show',
  props: {
    value: {
      require: true
    },
    multiple: {
      type: Boolean,
      default: true
    },
    options: {
      type: [Array, Function],
      default () {
        return []
      }
    },
    optionsProps: {
      type: Object,
      default: () => ({
        label: 'label',
        value: 'value'
      })
    }
  },
  computed: {
    values () {
      return this.multiple ? this.value : (this.value && [this.value])
    }
  },
  watch: {
    options: {
      immediate: true,
      handler () {
        this.setMyOptions()
      }
    }
  },
  data () {
    return {
      myOptions: [],
      toggle: false
    }
  },
  methods: {
    // 设置options
    async setMyOptions () {
      const { label, value } = this.optionsProps
      const myOptions =
        typeof this.options === 'function'
          ? await this.options()
          : this.options
      this.myOptions = myOptions.map((it) => ({
        label: it[label],
        value: it[value]
      }))
    },
    getValueShow (value, key) {
      const item = this.myOptions.find((it) => it.value === value)
      return item ? item[key] : value
    },
    deleteValue (i) {
      if (this.multiple) {
        this.value.splice(i, 1)
        this.$emit('input', this.value)
      } else {
        this.$emit('input', undefined)
      }
    }
  },
  created () {}
}
</script>
<style lang="less">
.sy-more-show{
    position: relative;
    .more-show-tags{
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        height: 32px;
        line-height: 32px;
        padding-right: 20px;
        padding-left: 6px;
        overflow: hidden;
        .el-tag{
            margin-right: 6px;
        }
    }
    .data-options{
        position: absolute;
        right: 6px;
        top:8px;
        .el-dropdown-link{
            font-size: 16px;
            i{
                cursor: pointer;
            }
        }
    }
}
.sy-more-show-dropdown-menu{
    .el-dropdown-menu__item{
        cursor: inherit;
        display: flex;
        span{
            flex: 1;
            max-width: 400px;
            white-space: nowrap; text-overflow: ellipsis;   overflow:hidden;
        }
        i{
            width: 16px;
            line-height: 27px;
            text-align: center;
            margin-left: 16px;
            margin-right: -4px;
            color: #5F3BCE;
            &:hover{
                cursor: pointer;
            }
        }
    }
}
</style>
