<template>
  <sy-select
    class="sy-brand-select"
    v-bind="myBind"
    v-on="{..._events}"
  ></sy-select>
</template>
<script>
export default {
  name: 'sy-brand-select',
  props: {
    multiple: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: [Boolean],
      default: false
    },
    bind: {
      default: () => ({})
    },
    value: {
      type: [String, Array]
    },
    disabledItems: {
      type: Array,
      default: () => ([])
    }
  },
  data () {
    return {
    }
  },
  computed: {
    myBind () {
      const { bind, multiple, value, disabled, disabledItems } = this
      return { ...bind, multiple, showEye: multiple, value, disabled, options: this.getOptions, optionsProps: { label: 'name', value: 'code' }, filterable: true, disabledItems, disabledItemsModel: true }
    }
  },
  methods: {
    async getOptions () {
      return await this.$syAjax.get(
        '/data-assets-service/api/brand/listAll')
    }
  },
  created () {
  },
  mounted () {},
  components: {}
}
</script>
<style lang="less">
</style>
