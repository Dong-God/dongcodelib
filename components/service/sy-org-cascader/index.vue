<template>
  <el-cascader
    class="sy-org-cascader"
    :value="value"
    :options="options"
    v-bind="bind"
    v-on="{...on,..._events}"
    :props="{ ...bind.props, value: 'id', label: 'name' }"
  ></el-cascader>
</template>
<script>
export default {
  name: 'sy-org-cascader',
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
        '/data-assets-service/api/department/listAll'
      )
      const tree = this.$utils.list2Tree(
        data,
        'id',
        'parentId',
        'children',
        '0'
      )
      delete tree[0]
      this.options = tree
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
