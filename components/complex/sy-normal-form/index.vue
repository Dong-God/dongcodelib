<script>
export default {
  name: 'sy-normal-form',
  props: {
    autoFocusError: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    btns: {
      type: Array,
      default: () => [
        {
          text: '返回',
          type: '',
          call ({ backClose }) {
            backClose()
          }
        },
        {
          text: '保存',
          hideDisable: true,
          type: 'primary',
          call ({ handlerSave }) {
            handlerSave()
          }
        }
      ]
    },
    data: [Array],
    save: [Function]
  },
  data () {
    return {
      actives: this.initActive()
    }
  },
  created () {},
  computed: {},
  watch: {},
  methods: {
    // 初始化选中tabs的值
    initActive () {
      const actives = {}
      this.data.forEach((block) => {
        if (block.type === 'tabsTable') {
          actives[block.name] = block.tabs[0].value
        }
      })
      return actives
    },
    setValue (name, value) {
      this.$refs[name].setValue(value)
    },
    getValue (name) {
      return this.$refs[name].getValue()
    },
    setActives (name, value) {
      this.actives[name] = value
    },
    getActives () {
      return this.actives
    },
    initValues () {},
    setTabsDefaultValue (block) {
      const values = {}
      block.tabs.forEach((tab) => {
        values[tab.value] = []
      })
      return values
    },
    getBlocks () {
      return this.data
        .filter((it) => !it.hide)
        .map((block) => {
          if (block.type === 'pageHeader') {
            return this.setPageHeader(block)
          }
          if (block.type === 'form') {
            return this.setFrom(block)
          }
          if (block.type === 'cardFrom') {
            return this.setCardFrom(block)
          }
          if (block.type === 'tabsTable') {
            return this.setTabsTable(block)
          }
          if (block.type === 'cardList') {
            return this.setCardList(block)
          }
        })
    },
    setFrom (block) {
      return (
        <sy-form
          ref={block.name}
          {...{ props: { ...block.data, disabled: this.disabled } }}
        />
      )
    },
    // 返回并且关闭页面
    backClose () {
      this.$router.back()
      if (this.$closeTabs) {
        this.$closeTabs()
        return false
      }
      if (this.closeTabs) {
        this.closeTabs()
        return false
      }
    },
    setPageHeader (block) {
      // return <el-page-header class="block" content={block.content} on-back={this.backClose}></el-page-header>;
      return (
        <div class="block pageHeader">
          {block.content && <span class="content">{block.content}</span>}{block.tips && <sy-tips {...{ props: block.tips }}/>}
          {block.tip && <span class="tip" domPropsInnerHTML={block.tip}></span>}
        </div>
      )
    },
    setCardFrom (block) {
      return (
        <el-card class="box-card block" key={block.name}>
          <div slot="header" class="clearfix">
            <span class="title">{block.label}</span>{block.tips && <sy-tips {...{ props: block.tips }}/>}
            <span class="tip" domPropsInnerHTML={block.tip}></span>
          </div>
          <sy-form
            defaultValue={block.defaultValue}
            list={block.data}
            bind={{ inline: true }}
            ref={block.name}
            disabled={this.disabled || block.disabled}
          />
        </el-card>
      )
    },
    setCardList (block) {
      return (
        <el-card class="box-card block" key={block.name}>
          <div slot="header" class="clearfix">
            <span class="title">{block.label}</span>
            <span class="tip" domPropsInnerHTML={block.tip}></span>
          </div>
          <div class="card-list-wrap">
            {block.data().map((it) => (
              <div class="item">
                {it.icon && this.renderIcon(it)}
                {it.img && <img src={it.img} />}
                {it.text &&
                  (it.link ? (
                    <a href={it.link} target="_blank">
                      {it.text}
                    </a>
                  ) : (
                    <span>{it.text}</span>
                  ))}
              </div>
            ))}
          </div>
        </el-card>
      )
    },
    // 渲染图标
    renderIcon (config) {
      if (!config.icon) {
        return false
      }
      if (/^svg-/.test(config.icon)) {
        return <sy-svg icon-class={config.icon.slice(4)} />
      }
      return <i class={`menu-icon ${config.icon}`}></i>
    },
    setTabsTable (block) {
      return (
        <el-tabs
          class="block"
          value={this.actives[block.name]}
          type="border-card"
          on-input={(v) => {
            this.actives[block.name] = v
          }}
        >
          {block.tabs.map((tab, i) => {
            const table = this.$utils.deepClone(block.tables[i])
            if (!table.pagination) {
              table.pagination = false
            }
            return (
              <el-tab-pane label={tab.label} name={tab.value} key={i}>
                <sy-normal-table
                  {...{ attrs: table }}
                  ref={`${block.name}-${tab.value}`}
                  disabled={this.disabled}
                />
              </el-tab-pane>
            )
          })}
        </el-tabs>
      )
    },
    // 获取所有value值
    getAllValues () {
      const values = {}
      this.data.filter((it) => !it.hide).forEach((block) => {
        const bname = block.name
        if (block.type === 'cardFrom' || block.type === 'form') {
          values[bname] = this.$refs[bname].getValue()
        } else if (block.type === 'tabsTable') {
          block.tabs.forEach((tab) => {
            const tabName = `${bname}-${tab.value}`
            values[tabName] = this.$refs[tabName].getValue()
          })
        }
      })
      return values
    },
    async handlerSave (action = 'save') {
      let hasError = false
      this.data.filter((it) => !it.hide).forEach((block) => {
        if (block.type === 'cardFrom' || block.type === 'form') {
          this.$refs[block.name].$refs.elForm.validate((valid) => {
            if (!valid) {
              this.focusError()
              hasError = true
            }
          })
        }
      })
      if (!hasError) {
        const isClose = await this.save({
          values: this.getAllValues(),
          actives: this.actives,
          action
        })
        if (isClose) {
          this.backClose()
        }
      }
    },
    // 聚焦到错误地点
    focusError () {
      if (!this.autoFocusError) {
        return false
      }
      setTimeout(() => {
        const el = this.$el.querySelector('.el-form-item__error')
        console.log(el)
        el && el.scrollIntoViewIfNeeded(true)
      }, 100)
    },
    // 获取底部按钮组
    getBtns (h) {
      return this.btns
        .filter((it) => !(it.hideDisable && this.disabled))
        .map((it) =>
          h('sy-button', {
            props: {
              ...it,
              call: () =>
                it.call({
                  handlerSave: this.handlerSave,
                  backClose: this.backClose,
                  disabled: this.disabled
                })
            }
          })
        )
    }
  },
  render (h) {
    // const hasBtn = this.btns && this.btns.length
    return (
      <div class="sy-normal-form">
        {this.getBlocks()}
        <div class="bottom-btn">{this.getBtns(h)}</div>
      </div>
    )
  }
}
</script>
<style lang="less">
.sy-normal-form {
  .pageHeader {
    .content {
      font-size: 14px;
      color: #0D1B3F;
    }
    .tip {
      font-size: 12px;
      margin-left: 10px;
      color: #72777a;
    }
  }
  .block {
    margin-bottom: 16px;
  }
  .bottom-btn {
    text-align: center;
  }
  .el-table .el-table__body .el-table__row .cell .el-date-editor.el-input {
    width: 100%;
  }
  .el-card__header {
    .tip {
      margin-left: 6px;
      color: #999999;
      font-size: 14px;
    }
  }
  .card-list-wrap {
    .item {
      display: inline-block;
      flex: 1;
      font-size: 16px;
      min-width: 300px;
      margin-bottom: 20px;
      a {
        font-size: 16px;
      }
      i {
        font-size: 22px;
        margin-right: 10px;
      }
      .sy-svg {
        font-size: 20px;
        margin-right: 10px;
      }
      img {
        width: 22px;
        height: 22px;
        margin-right: 10px;
      }
    }
  }
}
</style>
