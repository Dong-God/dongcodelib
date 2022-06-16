<template>
  <div class="sy-tags">
    <el-tag
      v-for="(tag,i) in value"
      :key="`tag/${i}`"
      closable
      :disable-transitions="false"
      @close="handleClose(tag)"
      size="small"
    >
      {{ tag }}
    </el-tag>
    <el-input
      class="input-new-tag"
      v-if="inputVisible"
      v-model="inputValue"
      ref="saveTagInput"
      size="small"
      @keyup.enter.native="handleInputConfirm"
      @blur="handleInputConfirm"
    >
    </el-input>
    <el-button v-else class="button-new-tag" size="small" @click="showInput"
      >+ 新增</el-button
    >
  </div>
</template>
<script>
export default {
  name: 'sy-tags',
  props: {
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
      inputVisible: false,
      inputValue: ''
    }
  },
  watch: {},
  async created () {},
  computed: {},
  methods: {
    handleClose (tag) {
      this.value.splice(this.value.indexOf(tag), 1)
      this.$emit('input', this.value)
    },
    showInput () {
      this.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm () {
      const inputValue = this.inputValue
      if (inputValue) {
        this.value.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    }
  },
  mounted () {}
}
</script>
<style lang="less" scoped>
.sy-tags {
  .el-input.input-new-tag {
    width: 100px;
  }
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 26px;
    line-height: 24px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
}
</style>
