<script>
export default {
  data () {
    return {
      errorMsg: {}
    }
  },
  methods: {
    // 渲染type值
    renderType (h, it) {
      // 预览
      if (it.type === 'preview') {
        return (props) => this.renderPreview(h, props, it)
      }
      // 下载
      if (it.type === 'download') {
        return (props) => this.renderDownload(h, props, it)
      }
      // 百分比
      if (it.type === 'percent') {
        return (props) => this.renderPercent(h, props, it)
      }
      // 金额
      if (it.type === 'money') {
        return (props) => this.renderMoney(h, props, it)
      }
      // 标签
      if (it.type === 'tags') {
        return (props) => this.renderTags(h, props, it)
      }
      // 数字
      if (it.type === 'number') {
        return (props) => this.renderNumb(h, props, it)
      }
      // 时间
      if (it.type === 'time') {
        return (props) => this.renderTime(h, props, it)
      }
      // 图片
      if (it.type === 'image') {
        return (props) => this.renderImage(h, props, it)
      }
      // 颜色
      if (it.type === 'color') {
        return (props) => this.renderColor(h, props, it)
      }
      // 字典
      if (it.type === 'dict') {
        return (props) => this.renderDict(h, props, it)
      }
      // 音频
      if (it.type === 'audio') {
        return (props) => this.renderAudio(h, props, it)
      }
      // 数组
      if (it.type === 'array') {
        return (props) => this.renderArr(h, props, it)
      }
      // 链接
      if (it.type === 'link') {
        return (props) => this.renderLink(h, props, it)
      }
      // 字典、数组判断
      if (it.type === 'map') {
        return (props) => this.renderMap(h, props, it)
      }
      // 操作按钮组
      if (it.type === 'btns') {
        return (props) => this.renderBtns(h, props, it)
      }
      // 组件
      if (it.type === 'tag') {
        return (props) => this.renderTag(h, props, it)
      }
      if (it.type === 'sort') {
        return (props) => this.renderSortBtn(h, props, it)
      }
    },
    // 渲染预览组件
    renderPreview (h, props, it) {
      let value = props.row[it.prop]
      if (!value) {
        return '-'
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
    renderDownload (h, props, it) {
      let value = props.row[it.prop]
      if (!value) {
        return '-'
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
    renderTip (h, props, it) {
      const value = props.row[it.prop]
      return (
        <el-tooltip class="item" effect="dark" content={value} placement="top">
          <span class="text-tip">{value}</span>
        </el-tooltip>
      )
    },
    // 渲染百分比
    renderPercent (h, props, it) {
      if (props.row[it.prop] === null || props.row[it.prop] === undefined) {
        return '-'
      } else {
        const num = JSON.parse(props.row[it.prop])
        return this.$utils.formatPercent(num)
      }
    },
    // 渲染金额
    renderMoney (h, props, it) {
      const value = props.row[it.prop]
      return this.$utils.formaNumber(value, it.config)
    },
    // 渲染标签
    renderTags (h, props, it) {
      const value = props.row[it.prop]
      if (!value && value !== 0) {
        return '-'
      }
      if (value && value.length) {
        return (
          <div class="table-tags">
            {value.map((it) => (
              <el-tag type="info">{it}</el-tag>
            ))}
          </div>
        )
      }
      return ''
    },
    // 渲染数字
    renderNumb (h, props, it) {
      const value = props.row[it.prop]
      return this.$utils.formaNumber(value, it.config)
    },
    // 渲染时间
    renderTime (h, props, it) {
      const value = props.row[it.prop]
      if (!value) {
        return '-'
      }
      return this.$utils.timeFormate(value, it.format)
    },
    // 渲染颜色
    renderImage (h, props, it) {
      let src = this.getValue(props.row, it.prop)
      if (!src) {
        return (
          <div class="empty-img">
            <i class="el-icon-picture-outline"></i>
          </div>
        )
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
    // 渲染颜色
    renderColor (h, props, it) {
      const value = this.getValue(props.row, it.prop)
      return (
        <div class="table-color" style={{ backgroundColor: value }}>
          {value}
        </div>
      )
    },
    // 渲染字典
    renderDict (h, props, it) {
      const value = this.getValue(props.row, it.prop)
      const o = this.$getDictLabel(it.dict, value)
      return o ? o.label : '其他'
    },
    // 渲染音频
    renderAudio (h, props, it) {
      const value = this.getValue(props.row, it.prop)
      return (
        <audio class="table-audio" controls="controls" src={value}></audio>
      )
    },
    // 渲染数组
    renderArr (h, props, it) {
      let value = this.getValue(props.row, it.prop)
      if (!value) {
        return '-'
      }
      if (it.map) {
        value = value.map((it) => it[it.map])
      }
      return value.join(' , ')
    },
    // 渲染链接
    renderLink (h, props, it) {
      const link = this.getValue(props.row, it.prop)
      if (!link) {
        return '-'
      }
      return (
        <a href={link} target="_blank">
          {link}
        </a>
      )
    },
    // 渲染字典
    renderMap (h, props, it) {
      const value = this.getValue(props.row, it.prop)
      let map = it.map
      if (typeof map === 'string') {
        map = this.apiData[map]
      }
      const row = map?.find((item) => item.value === value)
      return row ? row.label : '其他'
    },
    // 渲染按钮
    renderBtns (h, props, it) {
      const { disabled, extraData } = this
      const normalBtns = []
      const moreBtns = []
      it.btns(props, extraData)
        .filter((it) => {
          if (disabled && !it.showDisabled) {
            return false
          }
          return true
        })
        .forEach((btn) => {
          if (btn.more) {
            moreBtns.push(btn)
          } else {
            normalBtns.push(btn)
          }
        })
      const normalBtnsNode = normalBtns.map((it, i) => {
        return <sy-button {...{ props: it, key: i }}></sy-button>
      })
      const moreBtnsNode = moreBtns.map((it, i) => {
        return [
          <el-dropdown-item>
            <sy-button {...{ props: it, key: i }}></sy-button>
          </el-dropdown-item>
        ]
      })
      return [
        normalBtnsNode,
        moreBtns.length ? (
          <el-dropdown>
            <el-button
              type="text"
              class="el-dropdown-link"
              style="margin-left:8px"
            >
              更多<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">{moreBtnsNode}</el-dropdown-menu>
          </el-dropdown>
        ) : (
          ''
        )
      ]
    },
    // 渲染拖拽按钮
    renderSortBtn (h, props, it) {
      if (!this.isInitSort) {
        this.initSort()
        this.isInitSort = true
      }
      return h('sy-button', {
        props: {
          text: '',
          type: 'primary',
          clazz: 'sortable',
          bind: { icon: 'el-icon-sort', circle: true, size: 'mini' }
        }
      })
    },
    // 渲染组件
    renderTag (h, props, it) {
      const { disabled, getErrorMsg } = this
      const value = this.getValue(props.row, it.prop)
      const vm = h(it.tag, {
        props: { value, disabled, ...it.bind },
        attrs: { disabled, ...it.attrs },
        on: {
          ...it.on,
          input: (v) => {
            if (it?.on?.input) {
              it.on.input(v)
            }
            this.setValue(props.row, it.prop, v)
          },
          blur: (v) => {
            if (it?.on?.blur) {
              it.on.blur(v)
            }
            this.validateCol(props.row, it)
          }
        },
        nativeOn: it.nativeOn
      })
      if (it.validate) {
        const msg = getErrorMsg(props, it)
        console.log(msg)
        return (
          <span class={{ 'is-error': !!msg, 'el-form-item': true }}>
            {vm}
            <span class="tabel-error">{msg}</span>
          </span>
        )
      }
      return vm
    },
    // 校验错误信息
    validateCol (row, it) {
      if (!it.validate) {
        return false
      }
      const msg = it.validate(row)
      if (!this.errorMsg[it.prop]) {
        this.errorMsg[it.prop] = {}
      }
      this.errorMsg[it.prop][row._index] = msg
      this.$forceUpdate()
    },
    // 获取错误信息
    getErrorMsg (props, it) {
      return this.errorMsg[it.prop] && this.errorMsg[it.prop][props.row._index]
    },
    $emptyError () {
      this.errorMsg = {}
    },
    $validate () {
      this.data.forEach(row => {
        this._columns.forEach(it => {
          this.validateCol(row, it)
        })
      })
    }
  }
}
</script>
<style lang="less">
.sy-table {
  .tabel-error {
    font-size: 12px;
    position: absolute;
    left: 10px;
    bottom: -2px;
    color: #f56c6c;
  }
}
</style>
