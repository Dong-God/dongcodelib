import Vue from 'vue'
import imagePreview from 'element-ui/packages/image/src/image-viewer.vue'
import excel from '../sy-excel/index.vue'

const ImagePreviewConstructor = Vue.extend(imagePreview)
const ExcelConstructor = Vue.extend(excel)

const install = vm => {
  vm.prototype.$preview = function (option) {
    let url, name
    if (typeof option === 'object') {
      url = option.url
      name = option.name
    } else {
      url = option
      name = Vue.prototype.$utils.getFileName(option)
    }
    let instance
    if (vm.prototype.$utils.validPdf(url)) {
      window.open(url)
    } else if (vm.prototype.$utils.validImageUrl(url)) {
      instance = new ImagePreviewConstructor({
        el: document.createElement('div')
      })
      instance.onClose = () => {
        instance.$destroy()
      }
      instance.urlList = [url]
    } else if (vm.prototype.$utils.validExcel(url)) {
      const instance = new ExcelConstructor({
        el: document.createElement('div')
      })
      instance.excel = { url, name }
      instance.disabled = true
      instance.options = {
        allowEdit: false
      }
      instance.onClose = () => {
        document.body.removeChild(instance.$el)
      }
      document.body.appendChild(instance.$el)
    } else {
      vm.prototype.$utils.oDownLoad(url, undefined, name)
    }
  }
}
export default {
  install
}
