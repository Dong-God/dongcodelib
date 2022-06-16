<template>
   <el-tooltip class="item" v-bind="tips" :disabled="disabled">
      <span class="sy-text" @mouseenter="hanlderTipMouseenter"><slot /></span>
    </el-tooltip>
</template>
<script>
export default {
  name: 'sy-text',
  props: {
    tips: {
      type: Object
    }
  },
  data () {
    return {
      disabled: false
    }
  },
  watch: {
  },
  async created () {

  },
  computed: {
  },
  methods: {
    hanlderTipMouseenter (e) {
      const cell = e.currentTarget
      if (cell.scrollWidth > cell.offsetWidth) {
        this.disabled = false
      } else {
        this.disabled = true
      }
    }
  },
  mounted () {
  }
}
</script>
<style lang="less" scoped>
.sy-text{

}
</style>
