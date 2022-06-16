<template>
  <div
    class="sy-upload"
    :class="{ [type]: true, outLimit: value.length >= mergeProps.limit }"
  >
    <el-upload
      :disabled="disabled"
      action=""
      :http-request="handlerHttpRequest"
      :before-upload="handlerBeforeUpload"
      :on-change="handlerChange"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      v-bind="mergeProps"
      :accept="myAccept"
      :file-list="value"
    >
      <template v-if="type === 'image'">
        <i class="el-icon-plus"></i>
      </template>
      <template v-else>
        <el-button size="small" type="primary">点击上传</el-button>
      </template>
      <div style="width: 100%;height: 100%;" slot="file" slot-scope="{file}" v-if='hasDownload || sortable' class="{'is-success'}">
        <img
          class="el-upload-list__item-thumbnail "
          :src="file.url" alt=""
        >
        <span class="el-upload-list__item-actions">
          <span
            class="el-upload-list__item-preview"
            @click="handlePreview(file)"
          >
            <i class="el-icon-zoom-in"></i>
          </span>
          <span
            v-if="hasDownload"
            class="el-upload-list__item-delete"
            @click="handleDownload(file)"
          >
            <i class="el-icon-download"></i>
          </span>
          <span
            v-if="sortable"
            class="el-upload-list__item-delete"
          >
            <i class="el-icon-rank"></i>
          </span>
          <span
            class="el-upload-list__item-delete"
            @click="handleDownloadRemove(file)"
            v-if='!disabled'
          >
            <i class="el-icon-delete"></i>
          </span>
        </span>
      </div>
    </el-upload>
  </div>
</template>
<script>
import Sortable from 'sortablejs'
import utils from '../../../utils/file'
const typeMap = {
  image: {
    listType: 'picture-card',
    showFileList: true
  },
  file: {
    listType: 'text',
    showFileList: true
  }
}
export default {
  name: 'sy-upload',
  props: {
    sortable: {
      type: Boolean,
      default: false
    },
    type: {
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    hasDownload: {
      type: Boolean,
      default: false
    },
    bind: {
      type: Object,
      default: () => ({})
    },
    limit: {
      type: Object,
      default: () => ({})
    },
    action: {
      type: String,
      default: 'fileUpload'
    },
    value: {
      type: Array,
      default: () => []
    },
    accept: {
      type: Array,
      default: () => []
    },
    httpRequest: [Function],
    openLoading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      dialogVisible: false
    }
  },
  computed: {
    mergeProps () {
      return { ...typeMap[this.type], ...this.bind }
    },
    myAccept () {
      if (this.bind.accept) {
        return this.bind.accept
      }
      return this.accept.map((it) => this.$utils.MIME_type[it] || it).join(',')
    }
  },
  methods: {
    initSort () {
      if (this.sortable) {
        setTimeout(() => {
          const el = this.$el.querySelector(
            '.el-upload-list'
          )
          new Sortable(el, {
            handle: '.el-icon-rank',
            // direction: 'vertical',
            forceFallback: true,
            onUpdate: this.onUpdateSort
          })
        }, 1000)
      }
    },
    onUpdateSort (evt) {
      const { oldIndex, newIndex } = evt
      const row = this.value[oldIndex]
      this.value.splice(oldIndex, 1)
      this.value.splice(newIndex, 0, row)
      this.$emit('input', this.value)
    },
    async handleDownload (file) {
      const fileUrl = file.response || file.url || file
      utils.downImg(fileUrl)
    },
    handlePreview (file) {
      const fileUrl = file.response || file.url || file
      this.$preview(fileUrl)
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
    // 文件状态改变时
    handlerChange (file, fileList) {
      this.$emit('input', fileList)
    },
    // 移除
    handleRemove (file, fileList) {
      this.$emit('input', fileList)
    },
    handleDownloadRemove (file) {
      const fileList = this.value
      const fileUrl = file.response || file.url || file
      const index = fileList.findIndex(it => it.response === fileUrl || it.url === fileUrl)
      fileList.splice(index, 1)
      // todo 处理数据并抛出
      this.$emit('input', fileList)
    },
    async defaultHttpRequest (data) {
      const file = data.file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('group', window.SETTING?.TENANT_ID || window.QIANKUN_DATA?.active)
      const loading = this.openLoading ? this.$loading({
        lock: true,
        text: '上传中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      }) : null
      const res = await this.$api[this.action](formData, data)
      this.openLoading && loading.close()
      return res
    },
    delImg () {
      this.$emit('input', '')
    },
    async handlerBeforeUpload (file) {
      const errMsg = await this.$utils.fileCheck(file, this.limit)
      console.log(222, errMsg, file)
      if (errMsg) {
        this.$message.error(errMsg)
        throw new Error(errMsg)
      }
    }
  },
  created () {},
  mounted () {
    this.initSort()
  },
  components: {}
}
</script>
<style lang="less">
.sy-upload {
  &.outLimit {
    .el-upload {
      display: none;
    }
  }
  .el-upload-list__item {
    transition: none !important;
  }
}
</style>
