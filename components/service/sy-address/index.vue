<template>
  <el-cascader
    class="sy-address"
    :value="value"
    :options="options"
    v-bind="bind"
    v-on="{...on,..._events}"
    :props="{ ...bind.props, value: 'id', label: 'name' }"
  ></el-cascader>
</template>
<script>
export default {
  name: 'sy-address',
  props: {
    value: {
      type: [String, Array]
    },
    bind: {
      default: () => ({})
    },
    on: {
      default: () => ({})
    }
  },
  data () {
    return {
      options: []
    }
  },
  computed: {},
  methods: {
    async setOptions () {
      const data = await this.$syAjax.post(
        '/common/api/area/listAll', {}
      )
      const tree = this.$utils.list2Tree(
        data,
        'id',
        'parentId',
        'children',
        '0'
      )
      this.options = tree[0].children
    }
  },
  created () {
    this.setOptions()
  },
  mounted () {},
  components: {}
}
</script>
<style lang="less">
</style>
