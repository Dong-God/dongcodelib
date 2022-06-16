<template>
  <div class="sy-charts"></div>
</template>
<script>
var echarts = require('echarts')
const configObserver = { attributes: true, childList: false, subtree: false }
export default {
  name: 'sy-echarts',
  props: {
    option: {
      type: [Object],
      required: true
    }
  },
  created () {
    this.observer = new MutationObserver(this.handlerResize)
  },
  mounted () {
    this.echarts = echarts.init(this.$el)
    this.echarts.setOption(this.option)
    this.initEvents()
    this.observer.observe(this.$el, configObserver)
  },
  watch: {
    option () {
      this.echarts.setOption(this.option, true)
    }
  },
  methods: {
    handlerResize () {
      this.echarts.resize()
    },
    initEvents () {
      for (const key in this._events) {
        this._events[key].forEach(fn => this.echarts.on(key, fn)
        )
      }
    }
  },
  beforeDestroy () {
    this.observer.disconnect()
  }
}
</script>
