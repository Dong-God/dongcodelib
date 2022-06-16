<template>
  <el-tabs
    :value="value"
    @input="handlerInput"
    @tab-click="handlerChange"
    v-bind="bind"
    v-on="{ ..._events, input: [], change: [] }"
  >
    <el-tab-pane
      v-for="(it, i) in items"
      :key="i"
      :label="it.label"
      :name="it.value"
      :disabled="it.disabled"
    ></el-tab-pane>
  </el-tabs>
</template>
<script>
export default {
  name: 'sy-tabs',
  props: {
    defaultValue: {
      type: String
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
    bind: {
      default () {
        return {}
      }
    },
    value: {
      required: true
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
    }
  },
  async created () {
    if (this.defaultValue) {
      this.$emit('input', this.defaultValue)
    }
  },
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
    handlerChange (v) {
      this.$emit('change', v)
    },
    handlerInput (v) {
      this.$emit('input', v)
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
</style>
