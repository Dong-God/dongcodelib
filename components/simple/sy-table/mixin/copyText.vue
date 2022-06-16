<script>

import Vue from 'vue'
import normal from '../../../../utils/normal'

export default {
  props: {
    openCopy: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      copy: {
        startRowIndex: null,
        startColumnIndex: null,
        endRowIndex: null,
        endColumnIndex: null
      }
    }
  },
  computed: {
    copyPosition () {
      const { startRowIndex, startColumnIndex, endRowIndex, endColumnIndex } =
          this.copy
      if (
        startRowIndex !== null &&
          startColumnIndex !== null &&
          endRowIndex !== null &&
          endColumnIndex !== null
      ) {
        const pstartRowIndex = Math.min(startRowIndex, endRowIndex)
        const pendRowIndex = Math.max(startRowIndex, endRowIndex)
        const pstartColumnIndex = Math.min(startColumnIndex, endColumnIndex)
        const pendColumnIndex = Math.max(startColumnIndex, endColumnIndex)
        return {
          pstartRowIndex,
          pendRowIndex,
          pstartColumnIndex,
          pendColumnIndex
        }
      }
      return false
    }
  },
  methods: {
    isSelectOneCol (dataLen) {
      if (!this.copyPosition) {
        return false
      }
      const {
        pstartRowIndex,
        pendRowIndex,
        pstartColumnIndex,
        pendColumnIndex
      } = this.copyPosition
      if (pstartColumnIndex === pendColumnIndex && pstartRowIndex === 0 && pendRowIndex === dataLen - 1) {
        return true
      }
    },
    emptyCopySelect () {
      this.copy = {
        startRowIndex: null,
        startColumnIndex: null,
        endRowIndex: null,
        endColumnIndex: null
      }
    },
    // 复制数据
    handlerCopyText (e) {
      if (!this.openCopy) {
        return false
      }
      const {
        pstartRowIndex,
        pendRowIndex,
        pstartColumnIndex,
        pendColumnIndex
      } = this.copyPosition
      const list = this.data.slice(pstartRowIndex, pendRowIndex + 1)
      const copyColumn = this._columns.slice(
        pstartColumnIndex,
        pendColumnIndex + 1
      )
      const copyList = list.map((it) =>
        copyColumn.reduce((str, jt) => str + this.getCopyFomart(jt, it), '')
      )
      normal.copy(copyList.join('\n').slice(0, -1))
      e.preventDefault()
    },

    handlerContextmenu (e) {
      if (!this.openCopy) {
        return false
      }
      this.showContextmenu(e)
      e.preventDefault()
    },
    // 显示右键菜单
    showContextmenu (e) {
      const that = this
      if (!this.contextmenuCp) {
        var Profile = Vue.extend({
          render (h) {
            const { style, handlerCopyText, showMenu } = this
            return (
              showMenu && (
                <div id="a" class="sy-table-contextmenu" style={style}>
                  <el-button on-click={handlerCopyText}>复制</el-button>
                </div>
              )
            )
          },
          data () {
            return {
              showMenu: false,
              style: {
                left: '-100px',
                top: '-100px'
              }
            }
          },
          methods: {
            handlerCopyText (e) {
              that.handlerCopyText(e)
            }
          }
        })
        const Menu = new Profile({ el: document.createElement('div') })
        this.contextmenuCp = Menu
        document.body.appendChild(Menu.$el)
        document.body.addEventListener('click', () => {
          this.contextmenuCp.showMenu = false
        })
        document.body.addEventListener('mousewheel', () => {
          this.contextmenuCp.showMenu = false
        })
      }
      this.contextmenuCp.showMenu = true
      this.contextmenuCp.style.left = `${e.pageX}px`
      this.contextmenuCp.style.top = `${e.pageY}px`
    }
  }
}

</script>
