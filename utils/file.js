import imgUtils from './img'
import CONST from './const'

// 获取后缀名
const getExtension = function (name, isToLowerCase) {
  if (isToLowerCase) {
    name = name.toLowerCase()
  }
  return name.substring(name.lastIndexOf('.')).slice(1)
}

// 获取文件名
const getFileName = function (name) {
  return name.substring(name.lastIndexOf('/')).slice(1).split('?')[0]
}
function funDownload (href, filename) {
  // 创建隐藏的可下载链接
  var eleLink = document.createElement('a')
  eleLink.download = filename || getFileName(href)
  eleLink.style.display = 'none'
  eleLink.href = href
  // 触发点击
  document.body.appendChild(eleLink)
  eleLink.click()
  // 然后移除
  document.body.removeChild(eleLink)
}

async function downImg (href, filename) {
  const img = await src2img(href)
  const canvas = img2canvas(img)
  const blob = dataURL2Blob(canvas.toDataURL())
  funDownload(window.URL.createObjectURL(blob), filename)
}

// 下载文件
const DEFAULT_OSS_HOST = process.env.NODE_ENV !== 'production' ? 'https://yujiahuitest.oss-cn-hangzhou.aliyuncs.com' : 'https://oss.yujiahui.com'
async function oDownLoad (url, host = DEFAULT_OSS_HOST, filename, blobFn) {
  if (blobFn) {
    url = await blobFn()
  }
  if (url instanceof Blob) {
    funDownload(window.URL.createObjectURL(url), filename)
  } else if (CONST.REGX.host.test(url)) {
    funDownload(url, filename)
  } else {
    funDownload(`${host}/${url}`, filename)
  }
}

function insertJs (src) {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < document.scripts.length; i++) {
      if (document.scripts[i].src === src) {
        return resolve()
      }
    }
    var script = document.createElement('script')
    script.onload = resolve
    script.src = src
    document.body.appendChild(script)
  })
}
// 获取上传client
async function getOSSClient ({ isPrivate } = { isPrivate: false }) {
  const refreshSTSTokenInterval = 300000
  if (getOSSClient.ossClient) {
    return getOSSClient.ossClient
  }
  // 加载js文件
  await insertJs('https://gosspublic.alicdn.com/aliyun-oss-sdk-6.16.0.min.js')
  const api = () => { return this.$syAjax({ method: 'post', url: '/file-service/api/file/fetchUploadToken', data: { durationSeconds: refreshSTSTokenInterval / 1000 } }) }
  const data = await api()
  getOSSClient.ossClient = new window.OSS({
    // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
    region: data.region,
    // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
    accessKeyId: data.accessKeyId,
    accessKeySecret: data.accessKeySecret,
    // 从STS服务获取的安全令牌（SecurityToken）。
    stsToken: data.securityToken,
    refreshSTSToken: async () => {
      // 向您搭建的STS服务获取临时访问凭证。
      const info = await api()
      return {
        ...info,
        stsToken: info.securityToken
      }
    },
    // 刷新临时访问凭证的时间间隔，单位为毫秒。
    refreshSTSTokenInterval,
    // 填写Bucket名称。
    bucket: isPrivate ? data.privateBucketName : data.bucketName
  })
  return getOSSClient.ossClient
}

function src2img (src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = function () {
      resolve(img)
    }
    img.onerror = function (err) {
      reject(err)
    }
    img.src = src
  })
}

// img转canvas
function img2canvas (img) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas
}

function dataURL2Blob (dataurl) {
  var arr = dataurl.split(','); var mime = arr[0].match(/:(.*?);/)[1]
  var bstr = atob(arr[1]); var n = bstr.length; var u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

function canvas2ImageDate (canvas) {
  const ctx = canvas.getContext('2d')
  return ctx.createImageData(canvas.width, canvas.height)
}

export default {
  downImg,
  canvas2ImageDate,
  dataURL2Blob,
  src2img,
  img2canvas,
  funDownload,
  getOSSClient,
  insertJs,
  getExtension,
  getFileName,
  oDownLoad,
  // 文件校验
  async fileCheck (file, { maxSize, minSize, width, height, wdh, type, isToLowerCase }) {
    // 文件大小校验
    if (maxSize && file.size > maxSize * 1024) {
      return `上传文件大小不能超过${Math.round(maxSize)}KB!`
    }
    if (minSize && file.size < minSize * 1024) {
      return `上传文件大小不能小于${Math.round(minSize)}KB!`
    }
    // 图片比例/尺寸设置
    if (width || height || wdh) {
      const img = await imgUtils.getImageSize(file)
      if (width && width !== img.width) {
        return `图片宽度必须为${width}`
      }
      if (height && height !== img.height) {
        return `图片高度必须为${height}`
      }
      if (wdh && wdh !== img.width / img.height) {
        return '图片宽高比不正确'
      }
    }
    // 文件类型判断
    if (type && type.length) {
      const extension = getExtension(file.name, isToLowerCase)
      if (type.indexOf(extension) === -1) {
        return '文件格式不正确'
      }
    }
  }
}
