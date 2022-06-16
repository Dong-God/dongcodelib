<template>
  <el-tree
    ref="tree"
    class="sy-tree"
    v-bind="{ showCheckbox: true, data: treeData, nodeKey: 'id', ...bind }"
    v-on="{ ..._events }"
    @check-change="handlerCheckChange"
  >
  </el-tree>
</template>
<script>
import dataDeal from '../../../utils/dataDeal'
const { loopTree } = dataDeal
export default {
  name: 'sy-tree',
  props: {
    leafOnly: {
      type: [Boolean],
      default: false
    },
    sortKey: {
      type: [String],
      default: 'sort'
    },
    value: {
      type: [Array]
    },
    data: {
      type: [Array, Function],
      default: () => []
    },
    bind: {
      type: [Object],
      default: () => {}
    }
  },
  data () {
    return {
      treeData: []
    }
  },
  watch: {
    data: {
      async handler () {
        const { data } = this
        let treeData
        if (typeof data === 'function') {
          treeData = await data()
        } else {
          treeData = JSON.parse(JSON.stringify(this.data))
        }
        this.treeData = this.dealTreeData(treeData)
      },
      immediate: true
    },
    value: {
      handler (v, o) {
        if (JSON.stringify(v) !== JSON.stringify(o)) {
          this.setValue()
        }
      },
      immediate: true
    }
  },
  async created () {},
  computed: {
    myLeafOnly () {
      return this.bind.checkStrictly ? false : this.leafOnly
    }
  },
  methods: {
    dealTreeData (tree) {
      const childKey = (this.bind && this.bind.props && this.bind.props.children) || 'children'
      const o = [{ [childKey]: tree }]
      loopTree(o, item => {
        if (item[childKey] && item[childKey].length) {
          item[childKey] = item[childKey].sort((a, b) => a[this.sortKey] - b[this.sortKey])
        }
      }, childKey)
      return o[0][childKey]
    },
    setValue () {
      if (this.value !== undefined) {
        this.$refs?.tree?.setCheckedKeys(this.value)
      }
    },
    handlerCheckChange () {
      this.$emit('input', this.$refs.tree.getCheckedKeys(this.myLeafOnly))
      this.$emit('change', this.$refs.tree.getCheckedNodes(this.myLeafOnly))
    }
  },
  mounted () {
    this.setValue()
  }
}
</script>
<style lang="less" scoped>
.sy-tree {
  width: 100%;
}
</style>
