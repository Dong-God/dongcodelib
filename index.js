import utils from './utils'
import components from './components'
// import '@/icons'  去掉icon引用，项目组按需自己引用svg

const install = (vm, config) => {
  vm.use(utils, config)
  vm.use(components, config)
}

export default {
  install,
  utils,
  components
}
