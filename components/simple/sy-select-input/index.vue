<template>
  <div class="sy-select-input">
    <sy-select v-bind="bindSelect" :value="value[0]" @input="hanlderInput(0,$event)" />
    <el-input v-bind="bindInput" :value="value[1]" @input="hanlderInput(1,$event)"/>
  </div>
</template>
<script>
export default {
  name: 'sy-select-input',
  props: {
    value: { type: Array },
    bindSelect: { type: [Object] },
    bindInput: { type: [Object] }
  },
  data () {
    return {}
  },
  watch: {},
  async created () {},
  computed: {},
  methods: {
    hanlderInput (index, v) {
      this.$set(this.value, index, v)
      this.$emit('input', this.value)
    }
  },
  mounted () {}
}
</script>
<style lang="less" scoped>
.sy-select-input {
  display: flex;
  .sy-select {
    width: 100px;
    max-width: 494px;
  }
  .el-input {
    flex: 1;
    margin-left: 8px;
  }
}
</style>
