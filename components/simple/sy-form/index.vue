<script>
export default {
  name: 'sy-form',
  props: {
    formStyle: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    dialog: [Object],
    defaultValue: {
      type: Object,
      default: () => ({})
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
      type: Function,
      required: true
    },
    submit: {
      type: Function
    },
    h: {
      type: [Function]
    }
  },
  data () {
    return {
      title: '',
      visible: false,
      data: this.$utils.deepClone(this.defaultValue)
    }
  },
  watch: {
    defaultValue (n, o) {
      if (n !== o) {
        this.data = this.$utils.deepClone(this.defaultValue)
      }
    }
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
      this.$refs.clearValidate?.clearValidate()
      this.data = this.$utils.deepClone(data)
    },
    // 设置list函数中的_list,以供后续使用
    setPrivateList () {
      this._list = this.list(this.data, this).filter((it, index) => {
        const key = String(it.prop || index)
        it.key = key + index
        return it.hide !== true
      })
    },
    // prop为array时，同步赋值给data
    syncFormData () {
      if (this._list) {
        this._list.forEach((it) => {
          if (Array.isArray(it.prop)) {
            this.data[String(it.prop)] = it.prop.map((key) => this.data[key])
          }
        })
      }
    },
    getValue () {
      return this.dealDataOutInput(this.$utils.deepClone(this.data))
    },
    // 为了方便业务开发组，处理数据层逻辑
    dealDataOutInput (data) {
      if (data) {
        for (const key in data) {
          const item = this._list.find(it => it.prop === key)
          if (item && item.outData) {
            data[key] = item.outData(data[key])
          }
        }
      }
      return data
    },
    getForm (h) {
      const { bind, on, data, disabled, formStyle } = this
      return h(
        'el-form',
        {
          props: {
            disabled,
            'label-width': bind.labelWidth || '150px',
            ...bind,
            model: data
          },
          attrs: {
            id: 'elpand-form'
          },
          on: {
            ...on
          },
          class: ['sy-form', formStyle],
          ref: 'elForm'
        },
        this.getFormItem(h)
      )
    },
    getFormItem (h) {
      const that = this
      this.setPrivateList()
      this.syncFormData()
      return this._list.map((it, index) => {
        let child
        if (it.render) {
          const comp = it.render.call(this, h, { row: this.data })
          if (comp.type) {
            child = this.renderContent(h, comp, this.getComponentsValue(comp))
          }
          child = <span class="renderContent">{comp}</span>
        }
        if (it.tag === 'title') {
          child = <span>{it.text}</span>
        } else if (it.tag) {
          child = (that.h || h)(it.tag, {
            attrs: {
              placeholder: it.bind && it.bind.placeholder,
              ...it.attrs
            },
            props: {
              disabled: that.disabled,
              ...it.bind,
              value: that.getComponentsValue(it)
            },
            on: {
              ...it.on,
              input: (v) => {
                that.setComponentsValue(it.prop, v)
                if (it.on && it.on.input) {
                  it.on.input(v)
                }
              }
            },
            style: {
              width: it.width
            },
            ref: it.prop
          })
        } else {
          child = that.renderContent(h, it, that.getComponentsValue(it))
        }
        const key = it.key
        return h(
          'el-form-item',
          {
            key,
            props: {
              ...it.itemBind,
              prop: String(it.prop || index)
            },
            on: {
              ...it.itemOn
            },
            class: [
              it.showRequired && 'is-required',
              `form-item-${key}`,
              `form-item-${it.prop}`,
              it.tag && `form-item-${it.tag}`,
              it.fullRow && 'full-row'
            ]
          },
          [
            that.getLabel(it),
            it.before && it.before(h),
            child,
            it.after && it.after(h),
            that.renderTip(h, it)
          ]
        )
      })
    },
    // 渲染表单label
    getLabel (it) {
      return (
        <span slot="label" class="sy-item-label">
          <span>{it.label}</span>
          {!!it.tips && <sy-tips {...{ props: it.tips }} />}
        </span>
      )
    },
    // 获取组件的value值
    getComponentsValue ({ prop, emptyValue, text, inData }) {
      if (text) {
        return text
      }
      if (Array.isArray(prop)) {
        const ret = prop.map((it) => this.data[it])
        if (!ret.filter((it) => it !== undefined).length) {
          // 修复日期范围为[undefined,undefined]时存在问题
          return []
        }
        return ret
      }
      const value = this.data[prop]
      if (emptyValue && value === undefined) {
        return emptyValue
      }
      // 处理输入层业务逻辑数据
      if (inData) {
        return inData(value, this.data, this.$refs[prop])
      }
      return value
    },
    // 设置组件的value值
    setComponentsValue (prop, v) {
      if (Array.isArray(prop)) {
        prop.forEach((it, i) => {
          this.$set(this.data, it, v ? v[i] : undefined)
          if (this.$refs.elForm) {
            this.$refs.elForm.validateField(it)
          }
        })
        this.$set(this.data, String(prop), v)
      } else {
        this.$set(this.data, prop, v)
        if (this.$refs.elForm) {
          this.$refs.elForm.validateField(prop)
        }
      }
    },
    renderTip (h, it) {
      return (
        it.tip && (
          <div class="form-item-tip" domPropsInnerHTML={it.tip.content}></div>
        )
      )
    },
    validate () {
      return this.$refs.elForm.validate().then(async () => {
        const data = this.$utils.deepClone(this.data)
        for (const key in data) {
          const item = this._list.find((it) => it.prop === key)
          if (item && item.trim !== false && typeof data[key] === 'string') {
            data[key] = data[key].trim()
          }
        }
        const stopClose = await this.submit(this.dealDataOutInput(data))
        if (!stopClose) {
          this.close()
        }
      })
    },
    close () {
      this.visible = false
      this.data = this.$utils.deepClone(this.defaultValue)
      // console.log(this.data);
      // setTimeout(() => {
      //   this.$refs.elForm.clearValidate();
      // }, 100);
    },
    async cancel () {
      const confirm = this.dialog.confirm
      if (confirm) {
        const text =
          typeof confirm === 'string'
            ? confirm
            : '取消将不保存数据，你确认关闭吗'
        await this.$confirm(text, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      }
      this.close()
    },
    // 渲染表格内容
    renderContent (h, options, value) {
      // 自定义渲染
      if (options.render) {
        const comp = options.render.call(this, h, { row: this.data })
        if (comp.type) {
          return this.renderContent(h, comp, this.getComponentsValue(comp))
        }
        return comp
      }
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
  created () { },
  mounted () { },
  components: {},
  render (h) {
    if (this.dialog) {
      return (
        <el-dialog
          custom-class="sy-form-dialog"
          title={this.title}
          close-on-click-modal={false}
          close-on-press-escape={false}
          before-close={this.cancel}
          append-to-body={true}
          visible={this.visible}
          {...{ props: this.dialog }}
        >
          {this.visible && this.getForm(h)}
          <span slot="footer" class="dialog-footer">
            {this.dialog.showCancel !== false && (
              <el-button on-click={this.cancel}>取 消</el-button>
            )}
            <el-button type="primary" on-click={this.validate}>
              确 定
            </el-button>
          </span>
        </el-dialog>
      )
    }
    return this.getForm(h)
  }
}
</script>

<style lang="less">
.sy-form {
  .el-form-item.full-row {
    width: calc(100% - 18px);
    // display: flex;
    .el-form-item__content {
      // flex: 1;
      width: 100%;
      // margin-right: 8px;
      max-width: 690px;
      .el-date-editor.el-input,
      .el-date-editor.el-input__inner {
        width: 100%;
      }
      .el-textarea {
        width: 690px;
      }
    }
  }
  .el-form-item__content {
    width: 260px;
  }
  .el-input,
  .el-textarea,
  .el-input-number,
  .el-cascader,
  .el-select {
    width: 100%;
  }
  .el-radio-group {
    white-space: nowrap;
  }

  .el-textarea .el-input__count {
    line-height: 12px;
  }
}
</style>

<style lang="less">
.sy-form-dialog {
  .el-dialog__body {
    max-height: calc(80vh - 120px);
    overflow: auto;
  }
}
.sy-form {
  &.box {
    width: 823px;
    border-top: 1px solid rgb(96, 98, 102);
    border-left: 1px solid rgb(96, 98, 102);
    .el-form-item.full-row {
      display: inline-block;
      width: 823px;
      .el-form-item__content {
        width: auto;
      }
    }
    .el-form-item {
      margin: -1px 0 0 -1px;
      border: 1px solid rgb(96, 98, 102);
    }
  }
  &.auto {
    .full-row {
      display: inline-block;
      .el-form-item__content {
        width: auto;
      }
    }
  }
  .form-item-comp-title {
    width: 100%;
    display: flex;
    .el-form-item__label {
      font-size: 18px;
      position: relative;
      &::before {
        content: "";
        display: inline-block;
        background-color: var(--main-color);
        width: 4px;
        height: 20px;
        margin-right: 6px;
        vertical-align: middle;
        vertical-align: text-bottom;
      }
    }
    .el-form-item__content {
      color: #909399;
      vertical-align: text-bottom;
    }
  }
  .el-form-item__content {
    .form-item-tip {
      font-size: 12px;
      color: #72777a;
    }
    .renderContent {
      color: #909399;
    }
  }
  .sy-item-label {
    position: relative;
    margin-right: 2px;
    .sy-tips-wrap {
      position: relative;
      right: -2px;
    }
  }
}

</style>
