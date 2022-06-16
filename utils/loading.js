import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
const Load = {
  index: 0
}

export default {
  loading: {
    open () {
      Load.index++
      NProgress.start()
      // 按钮置灰
      if (window.event && window.event.type === 'click' && window.event.currentTarget && window.event.currentTarget.classList.contains('el-button')) {
        window.globClickTarget = window.event.currentTarget
        window.globClickTarget.classList.add('is-disabled')
        window.globClickTarget.disabled = true
      }
    },
    close () {
      Load.index--
      if (Load.index <= 0) {
        NProgress.done()
      }
      // 取消置灰
      if (window.globClickTarget) {
        window.globClickTarget.classList.remove('is-disabled')
        window.globClickTarget.disabled = false
        window.globClickTarget = null
      }
    },
    clear () {
      Load.index = 0
      NProgress.stop()
    }
  }
}
