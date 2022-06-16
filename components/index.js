import '../style/icon.css'
const complexFiles = require.context('../components/complex', true, /\.vue$/)
const simpleFiles = require.context('../components/simple', true, /\.vue$/)
const otherFiles = require.context('../components/other', true, /\.vue$/)
const serviceFiles = require.context('../components/service', true, /\.vue$/)

const allFiles = { simpleFiles, complexFiles, serviceFiles, otherFiles }
let conponents = []
for (const key in allFiles) {
  const files = allFiles[key]
  conponents = conponents.concat(files.keys().map(key => files(key).default || files(key)))
}

const Jsfiles = require.context('../components', true, /\.js$/)
const JSS = Jsfiles.keys().map(key => Jsfiles(key).default || Jsfiles(key))

const install = vm => {
  conponents.forEach(component => {
    if (component.name) {
      vm.component(component.name, component)
    }
  })
  JSS.forEach(js => {
    if (js.install) {
      vm.use(js.install)
    }
  })
}

export default {
  install
}
