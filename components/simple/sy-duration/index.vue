<template>
  <div class="sy-duration">
    <el-input :value="value[0]" @input="hanlderInput(0,$event)" :disabled='disabled'/>
    <el-select class="sy-duration-select"  :value="value[1]" @change="hanlderInput(1,$event)" :disabled='disabled'>
       <el-option
          v-for="item in timeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
    </el-select>
  </div>
</template>
<script>
export default {
  name: 'sy-duration',
  props: {
    value: { type: Array },
    options: {
      type: Array
    },
    props: {
      type: Object,
      default () {
        return {
          year: 'year',
          month: 'month',
          day: 'day'
        }
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    timeOptions () {
      if (this.options) {
        return this.options
      }
      const arr = []
      for (const key in this.props) {
        arr.push({
          label: filedMap[key], value: this.props[key]
        })
      }
      return arr
    }
  },
  data () {
    return {}
  },
  watch: {},
  async created () {},
  methods: {
    hanlderInput (index, v) {
      this.$set(this.value, index, v)
      this.$emit('input', this.value)
    }
  },
  mounted () {}
}
const filedMap = {
  year: '年',
  month: '月',
  day: '日'
}
</script>
<style lang="less">
.sy-duration {
  display: flex;
  .sy-duration-select {
    margin-left: 8px;
    width: 88px;
  }
  .el-input {
    flex: 1;
  }
}
</style>
