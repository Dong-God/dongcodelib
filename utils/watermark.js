
var watermark = {}
var id = 'svgDom_123412415'
var setwatermark = function (settings) {
  var defaultSettings = {
    // 小水印的id前缀
    watermark_txt: settings.watermark_txt || '请勿外传', // 水印字体
    watermark_txt_sub: settings.watermark_txt_sub || '', // 水印第二行文案
    watermark_color: settings.watermark_color || 'rgba(153, 153, 153, 0.3)', // 水印字体颜色
    watermark_fontsize: '14px', // 水印字体大小
    watermark_width: settings.watermark_width || 120, // 水印宽度
    watermark_height: settings.watermark_height || 100 // 水印高度
  }

  // 如果元素存在则移除
  var watermarkElement = document.getElementById(id)
  if (watermarkElement !== null) {
    document.body.removeChild(watermarkElement)
  }

  var can = document.createElement('canvas')
  var itemWidth = defaultSettings.watermark_width
  var itemHight = defaultSettings.watermark_height

  can.width = itemWidth * 2
  can.height = itemHight * 2
  can.style.display = 'none'

  var cans = can.getContext('2d')

  // 将画布中心点迁移到第一模块的中心
  cans.translate(itemWidth / 2, itemHight / 2)

  cans.font = defaultSettings.watermark_fontsize + ' Microsoft Yahei'
  cans.fillStyle = defaultSettings.watermark_color
  cans.textAlign = 'center'
  cans.textBaseline = 'middle'

  cans.save()
  cans.rotate((-15 * Math.PI) / 180)
  cans.fillText(defaultSettings.watermark_txt, 0, 0)
  cans.fillText(defaultSettings.watermark_txt_sub, 0, 20)
  cans.restore()

  // 回复到没有旋转之前的画布
  // 将画布中心迁移到右下模块的中心
  cans.translate(itemWidth, itemHight)
  cans.rotate((-15 * Math.PI) / 180)
  cans.fillText(defaultSettings.watermark_txt, 0, 0)
  cans.fillText(defaultSettings.watermark_txt_sub, 0, 20)

  var watermarkerDiv = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  var url = can.toDataURL('image/png')
  var styleStr =
    'width:100%;height:100%;position:fixed;opacity:0.5;top:0;left:0;pointer-events:none;z-index:999999;background-image:url(' +
    url +
    ');background-repeat:repeat;'
  watermarkerDiv.setAttribute('style', styleStr)
  watermarkerDiv.setAttribute('id', id)
  document.body.appendChild(watermarkerDiv)

  // // 监听删除或者属性修改
  var MutationObserver =
    window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
  if (MutationObserver) {
    var mo = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'childList' && !document.getElementById(id)) {
          mo.disconnect()
          mo = null
          setwatermark(settings)
        } else if (mutation.type === 'attributes') {
          var item = document.getElementById(id)
          if (item && item.getAttribute('style') !== styleStr) {
            mo.disconnect()
            mo = null
            setwatermark(settings)
          }
        }
      })
    })

    // 监听Body，看是否元素删除
    mo.observe(document.body, {
      childList: true
    })
    // 监听元素属性的修改
    var item = document.getElementById(id)
    if (item) {
      mo.observe(item, {
        attributes: true
      })
    }
  }
}

// 水印初始化
// 该方法只允许调用一次
watermark.init = function (settings) {
  setwatermark(settings)
  // window.onresize = function() {
  //   setwatermark(settings);
  // };
}

// 手动加载水印
watermark.load = function (settings) {
  setwatermark(settings)
}

export default {
  watermark
}
