<template>
  <el-select :value="value" @input="handleInput" ref="select"  v-bind="mySelectBind">
      <el-input v-if="filterable" v-model="filterText">
          <i @click="clearFilterText" slot="suffix" class="el-input__icon el-icon-circle-close"></i>
      </el-input>
      <sy-tree
        @input="handleInput"
        @change="handleTreeNodeChange"
        ref="tree"
        v-bind="myTreeBind"
        >
      </sy-tree>
    <el-option v-show="false" v-for="item in selectedOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
  </el-select>
</template>
<script>
export default {
  name: 'sy-input-tree',
  props: {
    value: {
      default () {
        return []
      }
    },
    treeData: {
      type: [Array, Function],
      default () {
        return []
      }
    },
    disabled: {
      type: [Boolean],
      default: false
    },
    filterable: {
      type: [Boolean],
      default: true
    },
    placeholder: {
      default: '请选择',
      type: [String]
    },
    selectBind: {
      default () {
        return {}
      }
    },
    treeBind: {
      default () {
        return {
        }
      }
    }
  },
  data () {
    return {
      filterText: '',
      selectedOptions: []
    }
  },
  watch: {
    filterText (val) {
      this.$refs.tree.$refs.tree.filter(val)
    }
  },
  computed: {
    myTreeBind () {
      const { value, treeData } = this
      return { ...this.treeBind, bind: { ...this.treeBind.bind, 'filter-node-method': this.filterNode }, value, data: treeData }
    },
    mySelectBind () {
      const { placeholder, disabled } = this
      return { placeholder, disabled, collapseTags: true, ...this.selectBind, multiple: true, popperClass: ['sy-input-select', this.selectBind.popperClass].join(' ') }
    },
    optionsProps () {
      return {
        label: this.treeBind.bind?.props?.label || 'label',
        children: this.treeBind.bind?.props?.children || 'children'
      }
    }
  },
  methods: {
    handleTreeNodeChange (v) {
      const { label } = this.optionsProps
      this.selectedOptions = v.map(it => ({ label: it[label], value: it[this.treeBind.bind?.nodeKey || 'id'] }))
    },
    handleInput (v) {
      this.$emit('input', v)
    },
    filterNode (value, data) {
      if (!value) return true
      return data[this.optionsProps.label].indexOf(value) !== -1
    },
    clearFilterText () {
      this.filterText = ''
    }
  }
}

</script>

<style lang="less">
.sy-input-select{
  .el-select-dropdown__wrap{
    padding: 10px 16px;
    .el-input__suffix{
      cursor: pointer;
    }
  }
  .el-scrollbar{
    display: block !important;
  }
  .el-select-dropdown__empty{
      display: none;
    }
}
</style>
