<template>
  <div class="sy-excel" :class="{ disabled: disabled }">
    <div id="sy-excel" class="sy-excel-box"></div>
    <el-button class="downFile" type="primary" @click="downLoadFile">下载文件</el-button>
  </div>
</template>
<script>
import LuckyExcel from 'luckyexcel'
export default {
  name: 'sy-excel',
  props: {
    disabled: {
      default: true,
      type: [Boolean]
    },
    excel: {
      type: [Object]
    },
    options: {
      type: [Object]
    },
    onClose: {
      type: [Function]
    }
  },
  mounted () {
    const that = this
    const defaultOptions = {
      container: 'sy-excel',
      lang: 'zh',
      myFolderUrl: '',
      showinfobar: true,
      showsheetbarConfig: false,
      showtoolbarConfig: false,
      showtoolbar: false,
      showstatisticBarConfig: false,
      showstatisticBar: false,
      showsheetbar: true
    }
    setTimeout(() => {
      LuckyExcel.transformExcelToLuckyByUrl(
        this.excel.url,
        this.excel.name,
        (exportJson) => {
          window.luckysheet.create({
            data: exportJson.sheets,
            title: exportJson.info.name,
            userInfo: exportJson.info.name.creator,
            hook: {},
            ...defaultOptions,
            ...this.options
          })
          setTimeout(() => {
            document.getElementById('luckysheet_info_detail_title').onclick = () => {
              that.onClose && that.onClose()
              window.luckysheet.destroy()
            }
          }, 0)
        }
      )
    }, 0)
  },
  methods: {
    downLoadFile () {
      this.$utils.oDownLoad(this.excel.url, null, this.excel.name)
    }
  },
  beforeDesotry () {
    window.luckysheet.destroy()
  }
}
</script>
<style lang="less">
.sy-excel {
  position: fixed;
  margin: 0px;
  padding: 0px;
  width: 100%;
  height: 100%;
  left: 0px;
  top: 0px;
  z-index: 5000;

  .sy-excel-box {
    width: 100%;
    height: 100%;
  }
  .downFile{
    position: absolute;
    top:15px;
    right: 160px;
  }
  &.disabled {
    #luckysheet_info_detail_input {
      pointer-events: none;
    }
    #luckysheet_info_detail_update,
    #luckysheet_info_detail_save {
      display: none;
    }
  }
  .luckysheet-share-logo {
    display: none;
  }
}
</style>
