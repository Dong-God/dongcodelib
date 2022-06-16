const Jsfiles = require.context('../utils', true, /^(?!index\.js)/)
const JSS = Jsfiles.keys().map(key => Jsfiles(key).default)

function install (Vue, config) {
  let modeule = {}
  JSS.filter(it => it).forEach(it => {
    if (it.install) {
      Vue.use(it.install, config)
    }
    modeule = { ...modeule, ...it, install: undefined }
  })
  Vue.prototype.$utils = { ...Vue.prototype.$utils, ...modeule }
}

export default {
  install
}
