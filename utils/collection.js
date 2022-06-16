import debounce from './debounce' // 防抖,先等待后执行版

// 常量定义
const REPORT_CACHE_KEY = 'report_cache_key' // 埋点缓存唯一标识
const EVENT_CLICK = 'Click' // 点击事件标识
const EVENT_PAGEVIEW = 'PageView' // 页面跳转事件标识
const PAGE_ENTER_TIME = Date.now() // 页面进入时间

let referrer = null // 上一次访问的页面
/**
  * @description: 数据缓存类，为了防止断网时或者异常状态下，数据为上报问题
  * @param {Function} key   数据缓唯一标识
  */
class Cache {
  constructor (key) {
    this.key = key
    const localData = localStorage[key]
    this.cacheList = localData ? JSON.parse(localData) : []
  }

  /** 添加数据 **/
  push (data) {
    this.cacheList.push(data)
    localStorage[this.key] = JSON.stringify(this.cacheList)
  }

  /** 清空数据 **/
  clear () {
    this.cacheList = []
    localStorage.removeItem(this.key)
  }

  /** 获取数据 **/
  getList () {
    return this.cacheList
  }
}

/**
  * @description: 埋点数据收集上传
  * @param {Function} appVersion   埋点版本号
  * @param {Function} api   批量埋点上传接口
  * @param {Number} upTime  批量上传数据最短间隔时间,默认值1秒
  * @param {Number} startTime  页面进入开始时间，为了后续计算页面停留时长
  * @param {Cache} reportListCache  批量上传数据列表
  */
class Report {
  constructor (appVersion = 'v1.0', api, upTime = 1000, startTime = Date.now()) {
    this.appVersion = appVersion
    this.startTime = startTime
    this.initUpInterface(api, upTime)
  }

  /** 初始化上传接口,上传接口做防抖处理，防止频繁接口上传**/
  initUpInterface (api, upTime) {
    const cache = new Cache(REPORT_CACHE_KEY)
    this.cache = cache
    this.upReportData = debounce.debounce(async function () {
      await api(cache.getList())
      cache.clear()
    }, upTime)
  }

  /** 获取操作系统信息**/
  _getOsInfo () {
    const userAgent = navigator.userAgent.toLowerCase()
    let name = 'Unknown'
    let version = 'Unknown'
    if (userAgent.indexOf('win') > -1) {
      name = 'Windows'
      if (userAgent.indexOf('windows nt 5.0') > -1) {
        version = 'Windows 2000'
      } else if (userAgent.indexOf('windows nt 5.1') > -1 || userAgent.indexOf('windows nt 5.2') > -1) {
        version = 'Windows XP'
      } else if (userAgent.indexOf('windows nt 6.0') > -1) {
        version = 'Windows Vista'
      } else if (userAgent.indexOf('windows nt 6.1') > -1 || userAgent.indexOf('windows 7') > -1) {
        version = 'Windows 7'
      } else if (userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows 8') > -1) {
        version = 'Windows 8'
      } else if (userAgent.indexOf('windows nt 6.3') > -1) {
        version = 'Windows 8.1'
      } else if (userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows nt 10.0') > -1) {
        version = 'Windows 10'
      } else {
        version = 'Unknown'
      }
    } else if (userAgent.indexOf('iphone') > -1) {
      name = 'Iphone'
    } else if (userAgent.indexOf('mac') > -1) {
      name = 'Mac'
    } else if (userAgent.indexOf('x11') > -1 || userAgent.indexOf('unix') > -1 || userAgent.indexOf('sunname') > -1 || userAgent.indexOf('bsd') > -1) {
      name = 'Unix'
    } else if (userAgent.indexOf('linux') > -1) {
      if (userAgent.indexOf('android') > -1) {
        name = 'Android'
      } else {
        name = 'Linux'
      }
    } else {
      name = 'Unknown'
    }
    return { name, version }
  }

  /** 获得URL的query参数**/
  _getUrlQuery () {
    if (!location.search) {
      return {}
    }
    return location.search.slice(1).split('&').reduce((a, b) => { a[b.split('=')[0]] = b.split('=')[1]; return a }, {})
  }

  /** 获得屏幕宽度**/
  _getScreenWidth () {
    return window.screen.width
  }

  /** 获得屏幕高度**/
  _getScreenHeight () {
    return window.screen.height
  }

  /** 获得浏览器信息**/
  _getBrowseInfo () {
    const browser = {}
    const userAgent = navigator.userAgent.toLowerCase()
    let s;
    // eslint-disable-next-line no-cond-assign
    (s = userAgent.match(/msie ([\d.]+)/)) ? browser.ie = s[1] : (s = userAgent.match(/firefox\/([\d.]+)/)) ? browser.firefox = s[1] : (s = userAgent.match(/chrome\/([\d.]+)/)) ? browser.chrome = s[1] : (s = userAgent.match(/opera.([\d.]+)/)) ? browser.opera = s[1] : (s = userAgent.match(/version\/([\d.]+).*safari/)) ? browser.safari = s[1] : 0
    let version = ''
    if (browser.ie) {
      version = 'IE ' + browser.ie
    } else {
      if (browser.firefox) {
        version = 'firefox ' + browser.firefox
      } else {
        if (browser.chrome) {
          version = 'chrome ' + browser.chrome
        } else {
          if (browser.opera) {
            version = 'opera ' + browser.opera
          } else {
            if (browser.safari) {
              version = 'safari ' + browser.safari
            } else {
              version = '未知浏览器'
            }
          }
        }
      }
    }
    return version
  }

  /** 获取通用采集字段**/
  _getBasicInfo () {
    const { appVersion, _getOsInfo, _getScreenWidth, _getScreenHeight, _getBrowseInfo } = this
    const systemInfo = _getOsInfo()
    return {
      appVersion, // 埋点版本号
      os: systemInfo.name, // 操作系统信息
      os_version: systemInfo.version,
      screenWeight: _getScreenWidth(), // 屏幕宽度
      screenHeight: _getScreenHeight(), // 屏幕高度
      browse: _getBrowseInfo()
    }
  }

  /** 获取页面信息数据 **/
  getPageViewInfo () {
    const { startTime, _getUrlQuery } = this
    const query = _getUrlQuery()

    const PAGE_DATA = {
      name: document.title,
      path: location.href,
      from: referrer || document.referrer || query.referrer || window.referrer || sessionStorage.referrer || location.href,
      duration: parseInt((Date.now() - startTime) / 1000)
    }
    referrer = location.href
    return PAGE_DATA
  }

  /** 获取页面点击数据**/
  getClickInfo () {
    return {
      name: document.title,
      path: location.href
    }
  }

  /** 添加埋点上报数据**/
  $upEvent (event, data) {
    const { cache, upReportData } = this
    const basicInfo = this._getBasicInfo()
    if (event === EVENT_PAGEVIEW) { // 添加页面跳转数据
      data = { ...basicInfo, ...this.getPageViewInfo(), ...data }
      this.startTime = Date.now()
    } if (event === EVENT_CLICK) { // 添加页面点击数据
      data = { ...basicInfo, ...this.getClickInfo(), ...data }
    } else { // 添加其他事件数据
      data = { ...basicInfo, ...data }
    }
    const date = Date.now()
    cache.push({ event, timestamp: date, event_time: timeFormate(date, 'yyyy-MM-dd hh:mm:ss'), ...data }) // 收集埋点数据
    upReportData() // 上报埋点数据
  }
}

/**
 *  时间戳格式转换
 * @param {String}  date 时间
 * @param { String } fmt 格式
 * @renten 返回导入函数
 */
function timeFormate (date, fmt) {
  if (typeof date !== 'object') {
    date = new Date(date)
  }
  var o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (var k in o) { if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)) }
  return fmt
}

export default {
  Report, // 埋点上报原始类
  install (Vue) { // 集成统一模板便捷上报
    setTimeout(() => { // 异步加载插件，节约首屏性能开销；
      if (!window.SETTING || !window.SETTING.upEvent) {
        console.warn('请配置统一埋点配置项')
        return false
      }
      const appVersion = window.packageInfo && window.packageInfo.version // 读取版本号
      const api = Vue.prototype.$api.batchReport // 批量埋点上传接口
      const upTime = window.SETTING.upEvent.upTime // 上报间隔时间
      const report = new Report(appVersion, api, upTime, PAGE_ENTER_TIME)
      Vue.prototype.$upEvent = function (eventName, attrs) {
        report.$upEvent(eventName, attrs)
      }
    }, 0)
  }
}
