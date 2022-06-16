<template>
  <div class="sy-cascader">
    <el-cascader ref="cascader" :value="dealValue" :options="dealItems" :props="cProps" v-bind="{ disabled, ...bind }"
      v-on="{ ..._events, input: [] }" @input="handlerInput" clearable></el-cascader>
    <el-button v-popover:popover icon="el-icon-view" type="text" v-if="bind.multiple === false"></el-button>
    <div class="sy-cascader-multiple">
      <el-popover width="250" v-model="popoverVisible" placement="right-start" trigger="click" ref="popover"
        popper-class="sy-cascader-popover">
        <div>
          <p class="popver-title">已选数据</p>
          <ul class="popoverBox">
            <li size="mini" v-for="item in viewItems" :key="item.value.join(',')">
              {{ item.label }}
              <i class="el-icon-circle-close del-icon" @click="del(item.value)"></i>
            </li>
          </ul>
        </div>
      </el-popover>
    </div>
  </div>
</template>
<script>
import dataDeal from '../../../utils/dataDeal'
export default {
  name: 'sy-cascader',
  props: {
    valuePath: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    options: {
      type: [Array, Function, String],
      default () {
        return []
      }
    },
    bind: {
      default () {
        return {}
      }
    },
    value: {
      required: true
    },
    props: {
      type: [Object],
      default: () => { return {} }
    },
    flashOptions: {
      type: [Boolean],
      default: true
    }
  },
  data () {
    return {
      items: [],
      popoverVisible: false,
      viewItems: []
    }
  },
  watch: {
    options () {
      if (this.flashOptions) {
        this.initOptions()
      }
    },
    popoverVisible (v) {
      if (v) {
        this.setViewItems()
      }
    }
  },
  computed: {
    dealValue () {
      if (this.value === undefined) {
        return this.value
      }
      if (this.props && this.props.multiple) {
        return this.value.map(it => this.encodeValue(it))
      }
      return this.encodeValue(this.value)
    },
    dealItems () {
      const { value = 'value', label = 'label', children = 'children' } = this.props
      const items = JSON.parse(JSON.stringify(this.items))
      this.$utils.loopsArray(items, children, (o, i, level) => {
        o[value] = `${level}-${o[value]}`
      })
      return items
    },
    cProps () {
      const that = this
      const props = {
        ...this.props
      }
      if (props.lazyLoad) {
        props.lazyLoad = function (node, resolve) {
          that.props.lazyLoad(node, (data) => {
            if (node.root && that.lazyEedRoot) {
              return false
            }
            that.lazyEedRoot = true
            resolve(data)
          })
        }
      }
      return props
    }
  },
  created () {
    this.initBind()
  },
  methods: {
    initBind () {
      if (this.bind.collapseTags === undefined) {
        this.bind.collapseTags = true
      }
    },
    encodeValue (arr) {
      if (!this.valuePath) {
        return this.getValuePath(arr)
      }
      return arr.map((it, i) => {
        return `${i}-${it}`
      })
    },
    // 更具最后一个节点获取整个路劲
    getValuePath (arr) {
      const ret = []
      const { value = 'value', label = 'value', children = 'children' } = this.props
      const tree = JSON.parse(JSON.stringify(this.dealItems))
      let node
      dataDeal.loopTree(tree, (item, i) => {
        if (item[value].substring(item[value].indexOf('-')).slice(1) === arr) {
          node = item
        }
        if (item && item[children]) {
          item[children].forEach(it => { it.parentNode = item })
        }
      }, children)

      while (node && node.parentNode) {
        ret.unshift(node[value])
        node = node.parentNode
      }
      node && ret.unshift(node[value])
      return ret
    },
    decodeValue (arr) {
      if (!this.valuePath) {
        const it = arr[arr.length - 1]
        return it && it.substring(it.indexOf('-')).slice(1)
      }
      return arr.map(
        (it) => it && it.substring(it.lastIndexOf('-')).slice(1)
      )
    },
    handlerInput (v) {
      if (this.props && this.props.multiple) {
        this.$emit('input', v.map(it => this.decodeValue(it)))
      } else {
        this.$emit('input', this.decodeValue(v))
      }
    },
    setViewItems () {
      const nodes = this.$refs.cascader.getCheckedNodes()
      if (!nodes) {
        this.viewItems = []
      } else {
        this.viewItems = nodes
          .filter((it) => {
            for (let i = 0; i < this.value.length; i++) {
              if (it.path.join(',') === this.value[i].join(',')) {
                return true
              }
            }
          })
          .map((it) => {
            return {
              label: it.pathLabels.join('/'),
              value: it.path
            }
          })
      }
    },
    del (v) {
      for (let i = 0; i < this.value.length; i++) {
        if (this.value[i].join(',') === v.join(',')) {
          this.value.splice(i, 1)
          this.$emit('input', this.value)
          this.setViewItems()
          return false
        }
      }
    },
    async initOptions () {
      const { options } = this
      if (typeof options === 'string') {
        this.items = this.$dict[options]
      } else if (typeof options === 'function') {
        this.items = await options()
      } else if (Array.isArray(options)) {
        this.items = options
      }
    }
  },
  mounted () {
    this.initOptions()
  }
}
</script>
<style lang="less">
.sy-cascader {
  display: inline;
  position: relative;
  .el-cascader {
    width: 100%;
  }
  .el-cascader__tags {
    padding-right: 22px;
  }
  .el-icon-view {
    position: absolute;
    right: 30px;
    top: 2px;
  }
}
.sy-cascader-popover {
  .del-icon {
    cursor: pointer;
  }
  .popver-title {
    padding-bottom: 4px;
    color: var(--main-color);
    border-bottom: 1px solid #ccc;
  }
  .popoverBox {
    li {
      padding-top: 3px;
    }
  }
}
</style>
