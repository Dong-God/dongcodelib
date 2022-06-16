import axios from 'axios'
import ElementUI from 'element-ui'

import Loading from './loading'
import cookie from './cookie'

const { Message } = ElementUI
const { loading } = Loading
const { getCookie } = cookie

export default {
  install (Vue, config) {
    const instance = axios.create({
      baseURL: config && config.BASE_URL,
      timeout: 100000,
      headers: {
        'x-session-id': (window.QIANKUN_DATA && window.QIANKUN_DATA.sessionId) || getCookie(`${location.hostname}.mushroom.session.id`) || getCookie('testmushroom.syounggroup.com.mushroom.session.id'),
        ...(window.QIANKUN_DATA && window.QIANKUN_DATA.apiHeader),
        ...(config && config.API_Header)
      }
    })
    instance.interceptors.request.use(
      config => {
        loading.open()
        return Promise.resolve(config)
      },
      error => {
        return Promise.reject(error)
      }
    )
    instance.interceptors.response.use(
      (response) => {
        loading.close()
        if (response.data.code === undefined) {
          return Promise.resolve(response.data)
        } else if (response.data.code === '400') {
          if (Vue.prototype && Vue.prototype.$goLogin) {
            Vue.prototype.$goLogin()
            return false
          }
          if (window.QIANKUN_DATA && window.QIANKUN_DATA.$goLogin) {
            window.QIANKUN_DATA.$goLogin()
            return false
          }
          return false
        } else if (response.data.code === '800') {
          Message.error('服务器错误')
          return Promise.reject(response)
        } else if (response.data.code === '600') {
          Message.error('服务器错误')
          return Promise.reject(response)
        } else if (response.data.code === '700') {
          Message.error(response.data.msg)
          return Promise.reject(response)
        } else if (response.data.code === '403') {
          Message.error(response.data.msg)
          return Promise.reject(response)
        } else if (response.data.code !== '0') {
          Message.error(response.data.msg)
          return Promise.reject(response)
        } else {
          if (config.hasResData) {
            return Promise.resolve(response.data)
          }
          return Promise.resolve(response.data.data)
        }
      },
      (error) => {
        loading.close()
        if (error.response.data.status === 404 || error.response.data.code === 404 || error.response.data.code === '404') {
          Message.error('接口路径错误')
        } else if (error.response.data.status === 500 || error.response.data.code === 500 || error.response.data.code === '500') {
          Message.error('系统开了个小差，请稍后再试')
        }
        return Promise.reject(error)
      }
    )
    Vue.prototype.$syAjax = instance
  }
}
