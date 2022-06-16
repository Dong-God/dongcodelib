<template>
  <div class="sy-checkbox">
    <el-checkbox class="check-all" v-if="hasAll" :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
    <el-checkbox-group :value="value" v-on="_events" v-bind="bind" @change="handleCheckedChange">
      <el-checkbox v-for="it in items" :disabled="it.disabled" :label="it[optionsProps.value]" :key="it[optionsProps.value]">{{ it[optionsProps.label] }}</el-checkbox>
    </el-checkbox-group>
  </div>
</template>
<script>
export default {
  name: 'sy-checkbox',
  props: {
    hasAll: {
      type: [Boolean],
      default: true
    },
    options: {
      type: [Array, Function, String],
      default () {
        return []
      }
    },
    bind: {
      default () {
        return {}
      }
    },
    value: {
      required: true,
      default: () => []
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
      checkAll: false,
      isIndeterminate: true,
      items: []
    }
  },
  watch: {},
  async created () {},
  computed: {},
  methods: {
    handleCheckAllChange (val) {
      const value = val ? this.items.map((it) => it[this.optionsProps.value]) : []
      this.isIndeterminate = false
      this.$emit('input', value)
    },
    handleCheckedChange (value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.items.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.items.length
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
    }
  },
  mounted () {
    this.initOptions()
  }
}
</script>
<style lang="less" scoped>
.sy-checkbox {
  .check-all{
    margin-bottom: var(--spacing-small );
  }
}
</style>
