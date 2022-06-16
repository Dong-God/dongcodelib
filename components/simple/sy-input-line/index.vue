<script>
export default {
  name: 'sy-input-line',
  props: {
    disabledArr: {
      type: Array,
      default: () => ([])
    },
    disabled: { type: Boolean, default: false },
    value: {
      type: Array,
      default: () => ([])
    },
    on: {
      type: Object,
      default: () => ({})
    },
    bind: {
      type: Object,
      default: () => ({})
    },
    list: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      title: '',
      visible: false
    }
  },
  watch: {
  },
  computed: {},
  methods: {
    open (title, data) {
      this.title = title
      if (data) {
        this.setValue(data)
      }
      this.visible = true
    },
    setValue (data) {
      this.data = this.$utils.deepClone(data)
    },
    getValue () {
      return this.$utils.deepClone(this.data)
    },
    // 渲染表格内容
    renderContent (h, options, value) {
      // 渲染时间
      if (options.type === 'time') {
        return this.renderTime(h, options, value)
      }
      // 金额
      if (options.type === 'money') {
        return this.renderMoney(h, options, value)
      }
      // 预览组件
      if (options.type === 'preview') {
        return this.renderPreview(h, options, value)
      }
      // 字典、数组判断
      if (options.type === 'map') {
        return this.renderMap(h, options, value)
      }
      // 图片
      if (options.type === 'image') {
        return this.renderImage(h, options, value)
      }
      // 字典
      if (options.type === 'dict') {
        return this.renderDict(h, options, value)
      }
      // 下载附件
      if (options.type === 'download') {
        return this.renderDownload(h, options, value)
      }
      // 链接
      if (options.type === 'link') {
        return this.renderLink(h, options, value)
      }
      if (!value && value !== 0) {
        return ''
      }
      return value
    },
    // 渲染字典
    renderDict (h, options, value) {
      const o = this.$getDictLabel(options.dict, value)
      return o ? o.label : '其他'
    },
    // 渲染数组
    renderMap (h, options, value) {
      const row = options.map.find((item) => item.value === value)
      return row ? row.label : '其他'
    },
    // 渲染预览组件
    renderPreview (h, options, value) {
      if (!value) {
        return null
      }
      if (!Array.isArray(value)) {
        value = [value]
      }
      return value.map((it) => {
        if (typeof it === 'object') {
          return (
            <div>
              <a href="javascript:void(0);" on-click={() => this.$preview(it)}>
                {it.name}
              </a>
            </div>
          )
        } else {
          const filename = this.$utils.getFileName(it)
          return (
            <div>
              <a href="javascript:void(0);" on-click={() => this.$preview(it)}>
                {filename}
              </a>
            </div>
          )
        }
      })
    },
    // 渲染链接
    renderLink (h, options, value) {
      if (!value) {
        return '-'
      }
      if (typeof value === 'string') {
        value = {
          label: value,
          value
        }
      }
      return (
        <a href={value.value} target="_blank">
          {value.label}
        </a>
      )
    },
    // 渲染图片
    renderImage (h, options, value) {
      let src = value
      if (!src) {
        return null
      }
      if (!Array.isArray(src)) {
        src = [src]
      }
      return src.map((it) => (
        <div>
          <el-image class="table-img" src={it} preview-src-list={src} />
        </div>
      ))
    },
    // 下载附件
    renderDownload (h, options, value) {
      value = value || options.download
      if (!value) {
        return ''
      }
      if (!Array.isArray(value)) {
        value = [value]
      }
      return value.map((it) => {
        if (typeof it === 'object') {
          return (
            <div>
              <a
                href="javascript:void(0);"
                on-click={() => this.$utils.oDownLoad(it.url)}
              >
                {it.name}
              </a>
            </div>
          )
        } else {
          const filename = this.$utils.getFileName(it)
          return (
            <div>
              <a
                href="javascript:void(0);"
                on-click={() => this.$utils.oDownLoad(it)}
              >
                {filename}
              </a>
            </div>
          )
        }
      })
    },
    // 时间
    renderTime (h, options, value) {
      if (!value) {
        return ''
      }
      return this.$utils.timeFormate(value, options.format)
    },
    // 金额
    renderMoney (h, options, value) {
      if (value === null || value === undefined) {
        return '-'
      } else {
        const num = JSON.parse(value)
        return this.$utils.formatMoney(num)
      }
    }
  },
  render (h) {
    const that = this
    const listDom = this.list.map((it, index) => {
      let child
      if (it.render) {
        const comp = it.render.call(this, h, { row: this.value })
        if (comp.type) {
          child = this.renderContent(h, comp, this.value[index])
        }
        child = <span class="renderContent">{comp}</span>
      }
      if (it.tag) {
        child = [it.label && <span class='sy-input-title'>{it.label}</span>, h(it.tag, {
          attrs: {
            placeholder: it.bind && it.bind.placeholder,
            ...it.attrs
          },
          props: {
            disabled: that.disabled || that.disabledArr.includes(index),
            ...it.bind,
            value: this.value[index]
          },
          on: {
            ...it.on,
            input: (v) => {
              this.$set(this.value, index, v)
              if (it.on && it.on.input) {
                it.on.input(v)
              }
            }
          },
          style: {
            width: it.width
          },
          ref: it.prop
        })]
      } else {
        child = that.renderContent(h, it, this.data[index])
      }
      return child
    })
    return h(
      'div',
      {
        props: {
        },
        on: {
        },
        class: [
          'sy-input-line'
        ]
      },
      [
        ...listDom
      ]
    )
  }
}
</script>

<style lang="less">
.sy-input-line {
  width: calc(100% - 18px);
  display: inline;
  .el-input{
    width:260px;
  }
  .sy-input-title{
    margin-right: 10px;
    &:nth-child(n+2){
      margin-left: 10px;
    }
  }
  .sy-select-warp{
    display: inline-block;
  }
}
</style>
