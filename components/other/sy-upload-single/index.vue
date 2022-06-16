<template>
  <div class="sy-upload-single" :class="[listType, disabled && 'disabled']">
    <el-upload
      :disabled="disabled"
      action=""
      :limit="limit"
      :show-file-list="showFileList"
      :http-request="handlerHttpRequest"
      :accept="accept || myAccept"
      :before-upload="handlerBeforeUpload"
      :on-change="handlerChange"
      :on-remove="handlerChange"
      :listType="listType"
      :file-list="delFileList(value)"
    >
      <template v-if="listType === 'picture-card'">
        <template v-if="value">
          <img :src="value" class="avatar" />
          <div class="preview" @click.stop>
            <i
              class="el-icon-zoom-in sy-upload-single-icon"
              @click="preViewImg"
            ></i>
            <i class="el-icon-delete sy-upload-single-icon" @click="delImg"></i>
          </div>
        </template>
        <i v-else class="el-icon-plus upload-icon"></i>
      </template>
      <el-button v-else size="small" type="primary">上传</el-button>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img v-if="dialogVisible && value" width="100%" :src="value" alt="" />
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'sy-upload-single',
  props: {
    delFileList: {
      type: Function,
      default (v) {
        return v
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number
    },
    isSingle: {
      type: Boolean,
      default: true
    },
    httpRequest: {
      type: Boolean,
      default: false
    },
    showFileList: {
      type: Boolean,
      default: false
    },
    listType: {
      type: String,
      default: 'picture-card'
    },
    isFile: {
      type: Boolean,
      default: false
    },
    accept: {
      default: ''
    },
    fileKey: {
      type: String,
      default: 'file'
    },
    action: {
      type: String,
      default: 'fileUpload'
    },
    value: [Array, String, File, Object],
    beforeUpload: {
      type: Function,
      default: () => ({})
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    },
    maxSize: {
      type: Number
    },
    minSize: {
      type: Number
    },
    type: {
      type: Array,
      default: () => []
    },
    wdh: {
      type: Number // 图片的宽除高
    }
  },
  data () {
    return {
      dialogVisible: false
    }
  },
  computed: {
    myAccept () {
      return this.type.map((it) => this.$utils.MIME_type[it] || it).join(',')
    }
  },
  methods: {
    preViewImg () {
      this.dialogVisible = true
    },
    async handlerHttpRequest (option) {
      let res
      if (this.httpRequest) {
        res = await this.httpRequest(option)
      } else {
        res = await this.defaultHttpRequest(option)
      }
      return res
    },
    handlerChange (file, fileList) {
      if (this.isSingle) {
        // 单个文件
        if (this.isFile) {
          // 获取文件
          this.$emit('input', file.raw)
        } else {
          // 获取上传后URL
          if (file.response) {
            this.$emit('input', file.response)
          }
        }
      } else {
        // 多个文件
        if (this.isFile) {
          // 获取文件
          this.$emit(
            'input',
            fileList.map((file) => file.raw)
          )
        } else {
          // 获取上传后URL
          this.$emit(
            'input',
            fileList.map((file) => file.response)
          )
        }
      }
    },
    async defaultHttpRequest (data) {
      const file = data.file
      if (!this.isFile) {
        const formData = new FormData()
        formData.append(this.fileKey, file)
        formData.append('group', window.SETTING?.TENANT_ID || window.QIANKUN_DATA?.active)
        const res = await this.$api[this.action](formData)
        return res
      }
    },
    delImg () {
      this.$emit('input', '')
    },
    async handlerBeforeUpload (file) {
      const { width, height, maxSize, minSize, type, wdh } = this
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
    }
  },
  created () {},
  mounted () {},
  components: {}
}
</script>
<style lang="less">
.sy-upload-single {
  line-height: 1em;
  &.disabled {
    .el-icon-delete {
      display: none;
    }
  }
  &.picture-card {
    .el-upload {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      position: relative;
      overflow: hidden;
    }
  }
  .el-upload__tip {
    margin-top: -12px;
  }
  .el-upload:hover {
    border-color: #409eff;
  }
  .upload-icon {
    font-size: 28px;
    color: #8c939d;
    width: 148px;
    height: 148px;
    line-height: 148px;
    text-align: center;
  }
  .avatar {
    width: 148px;
    height: 148px;
    display: block;
  }
  &:hover {
    .preview {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .preview {
    display: none;
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    top: 0;
    left: 0;
    cursor: default;
    .hideImg > img {
      opacity: 0;
    }
    .el-icon-circle-close {
      color: #ffffff;
    }
    & > .sy-upload-single-icon {
      color: #ffffff;
      font-size: 24px;
      cursor: pointer;
    }
    & > .el-icon-zoom-in,& > .el-icon-delete {
      margin: 0 8px;
    }
  }
}
</style>
