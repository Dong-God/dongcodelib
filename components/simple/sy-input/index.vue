<template>
  <el-input
    class="sy-input"
    :class="{ 'focus-fixed': focusFixed, 'is-focus': isFocus }"
    :value="value"
    @input="$emit('input', $event)"
    v-bind="bind"
    :type="inputType"
    @focus="isFocus = true"
    @blur="handlerBlur"
  >
    <template v-if="bind.type === 'password'" slot="suffix">
      <i
        v-if="inputTypeState === 'password'"
        class="hermes hermes-chakan"
        @click="inputTypeState = 'text'"
      ></i>
      <i
        v-else
        class="hermes hermes-yincang"
        @click="inputTypeState = 'password'"
      ></i>
    </template>
  </el-input>
</template>
<script>
export default {
  name: 'sy-input',
  props: {
    focusFixed: {
      type: Boolean,
      default: false
    },
    value: {},
    bind: { type: Object, default: () => ({}) }
  },
  data () {
    return {
      isFocus: false,
      inputTypeState: 'password'
    }
  },
  watch: {},
  async created () {},
  computed: {
    inputType () {
      if (this.bind.type !== 'password') {
        return this.bind.type
      }
      return this.inputTypeState
    }
  },
  methods: {
    handlerBlur () {
      this.$emit('blur')
      this.isFocus = false
    }
  },
  mounted () {}
}
</script>
<style lang="less" scoped>
</style>
<style lang="less">
.sy-input {
  .hermes-chakan,
  .hermes-yincang {
    cursor: pointer;
    line-height: 32px;
    font-size: 18px;
  }
  &.focus-fixed {
    position: absolute;
    top: 14px;
    width: calc(100% - 20px);
    &.is-focus{
      z-index: 1000;
    }
    &:not(.is-focus) {
      textarea {
        height: 32px !important;
      }
    }
  }
}
</style>
