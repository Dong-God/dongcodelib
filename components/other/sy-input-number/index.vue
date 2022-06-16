<template>
  <div class="sy-input-number">
    <el-input-number
      :value="cValue"
      @input="input"
      v-bind="{ placeholder, disabled, ...bind }"
      v-on="_events"
    ></el-input-number>
    <div class="append" v-if="append">{{append}}</div>
  </div>
</template>
<script>
export default {
  name: 'sy-input-number',
  props: {
    append: {
      type: [String]
    },
    disabled: {
      type: [Boolean],
      default: false
    },
    placeholder: {
      type: [String],
      default: '请输入数字'
    },
    value: {
      type: [Number, String]
    },
    bind: {
      default: () => ({}),
      type: [Object]
    }
  },
  data () {
    return {}
  },
  methods: {
    input (v) {
      this.$emit('input', v)
    }
  },
  computed: {
    cValue () {
      if (this.value === '') {
        return undefined
      }
      return this.value
    }
  }
}
</script>
<style lang="less">
.sy-input-number {
  position: relative;
  .append{
    display: inline-block;
    margin-left: 8px;
    box-sizing: border-box;
    line-height: 36px;
    font-size: 14px;
  }
  .el-input-number__decrease {
    display: none;
  }
  .el-input-number__increase {
    display: none;
  }
  .el-input {
    .el-input__inner {
      padding: 0 15px;
    }
  }
}
</style>
