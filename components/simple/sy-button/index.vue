<script>
export default {
  name: 'sy-button',
  props: {
    reportCode: [String],
    bind: [Object],
    fileKey: {
      type: String,
      default: 'file'
    },
    action: {
      type: String,
      default: 'fileUpload'
    },
    text: [String],
    icon: [String],
    type: [String],
    hide: [Boolean],
    disabled: [Boolean],
    confirm: [String, Function],
    call: [Function],
    file: [Object],
    tips: [Object],
    prompt: [String],
    messageBox: [Object],
    code: [String],
    clazz: {
      type: [String],
      default: ''
    }
  },
  data () {
    return {
      fileList: []
    }
  },
  computed: {
    limitDisabled () {
      if (
        this.file &&
        this.file.bind &&
        this.file.bind.limitDisabled &&
        this.fileList.length >= this.file.bind.limit
      ) {
        return true
      }
      return false
    },
    accept () {
      return this?.file?.type
        ?.map((it) => this.$utils.MIME_type[it] || it)
        .join(',')
    }
  },
  methods: {
    async handlerClick (data) {
      try {
        const confirm = typeof this.confirm === 'function' ? this.confirm() : this.confirm
        if (confirm) {
          const res = await this[this.messageBox ? '$prompt' : '$confirm'](
            confirm,
            '',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
              ...this.messageBox
            }
          )
          data = { ...data, btnType: res }
        }
        if (this.reportCode) {
          this.$upEvent('click', { code: this.reportCode })
        }
        this.call(data)
      } catch (error) {
        console.log(error)
      }
    },
    async httpRequest (file) {
      const formData = new FormData()
      formData.append(this.fileKey, file.file)
      formData.append('group', window.SETTING?.TENANT_ID || window.QIANKUN_DATA?.active)
      const res = await this.$api[this.action](formData)
      this.handlerClick({ file: res })
      return res
    },
    //  可见性：（isShow为后端返回字段）
    // 不可见： isShow为“0”  ； 根据角色权限的勾选情况返回该菜单/按钮
    // 配置可见： isShow为“1”  ；根据角色权限勾选情况返回该菜单/按钮
    // 全部可见： isShow为“2”  ； 不管是否勾选角色权限都会返回该菜单/按钮
    getDisabled () {
      const { disabled, code } = this
      const codeMenuItem = window.USER_INFO?.menus.find(it => it.code === code)
      if ((code && !codeMenuItem) || (code && codeMenuItem && codeMenuItem.isShow === '0')) { // 1.没有权限项2.有权限项，但是配置不可见
        return true
      }
      return disabled
    },
    async handlerBeforeUpload (file) {
      // 用户前置校验
      if (
        this.file.beforeUpload &&
        (await this.file.beforeUpload()) === false
      ) {
        return false
      }
      // 文件大小校验
      const { width, height, maxSize, minSize, type, wdh } = this.file
      const errMsg = await this.$utils.fileCheck(file, {
        width,
        height,
        maxSize,
        minSize,
        type,
        wdh
      })
      if (errMsg) {
        this.$message.error(errMsg)
        throw new Error(errMsg)
      }
    },
    handlerChange (file, fileList) {
      this.fileList = fileList
      this.$emit('input', this.fileList)
    },
    async handlerHttpRequest (option) {
      let res
      if (this.file.httpRequest) {
        res = await this.file.httpRequest(option)
      } else {
        res = await this.httpRequest(option)
      }
      return res
    }
  },
  created () { },
  mounted () { },
  components: {},
  render () {
    const {
      type,
      icon,
      text,
      accept,
      getDisabled,
      hide,
      handlerClick,
      file,
      bind,
      limitDisabled,
      clazz,
      handlerBeforeUpload,
      handlerChange,
      handlerHttpRequest,
      tips
    } = this
    const that = this
    if (hide || getDisabled()) {
      return null
    }
    if (file) {
      return (
        <el-upload
          ref="upload"
          accept={accept}
          http-request={handlerHttpRequest}
          action=""
          auto-upload
          show-file-list={false}
          before-upload={handlerBeforeUpload}
          class={{ 'sy-button': true, limitDisabled: !!limitDisabled }}
          {...{ attrs: file.bind, props: { onChange: handlerChange } }}
        >
          <el-button
            size="small"
            type={type || 'primary'}
            disabled={limitDisabled}
          >
            {text}
          </el-button>
        </el-upload>
      )
    }
    const btn = <el-button
      {...{
        props: bind
      }}
      type={type}
      icon={icon}
      on-click={handlerClick}
      class={`sy-button ${clazz}`}
    >
      {text}
    </el-button>
    if (tips) {
      return (
        <el-tooltip
          {...{
            attrs: {
              trigger: 'hover',
              ...tips
            }
          }}>
          {btn}
        </el-tooltip>)
    }
    return btn
  }
}
</script>
<style lang="less">
.sy-button {
  display: inline-block;
}
.sy-button + .sy-button {
  margin-left: 10px;
}
.sy-button.limitDisabled .el-upload {
  pointer-events: none;
}
</style>
