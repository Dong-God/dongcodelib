<template>
  <div
    class="sy-debunk positionContainer"
    :style="{ top: `${pos.top}px` }"
    @mousedown="handlerMousedown"
  >
    <transition name="showEditContainer">
      <div
        v-show="showEditContainer"
        class="editContainer"
        @mouseenter="showEditContainerEnter"
        @mouseleave="showEditContainerLeave"
      >
        <div class="editItem face" @click="showDialog">
          <img
            class="bunkImg faceImg"
            src="./../../../static/img/bunk.png"
            alt=""
          />
          <span class="editText">吐个槽</span>
        </div>
        <div
          :class="['editItem', { face: likeIt === 0 }]"
          id="face"
          @click="toggleStartAndFigur"
        >
          <div id="faceImg" class="positionFace faceImg">
            <img
              class="bunkImg pad"
              src="./../../../static/img/good2.png"
              alt=""
            />
            <img
              :style="rotateTrasition"
              class="figur"
              src="./../../../static/img/figur.png"
              alt=""
            />
          </div>
          <transition name="star">
            <div v-show="showStarBox" class="starBox">
              <img class="starBig" src="./../../../static/img/star.png" alt="" />
              <img
                class="starMiddle"
                src="./../../../static/img/star.png"
                alt=""
              />
              <img class="starSmall" src="./../../../static/img/star.png" alt="" />
            </div>
          </transition>
          <span class="editText">{{ likeIt === 0 ? "点个赞" : "已点赞" }}</span>
        </div>
      </div>
    </transition>
    <div
      class="feedbackContainer"
      @mouseenter="showEditContainerEnter"
      @mouseleave="showEditContainerLeave"
    >
      <img
        class="feedbackImg"
        src="./../../../static/img/relog.png"
        alt=""
        draggable="false"
      />
      <div class="feedbackText">意见反馈</div>
    </div>
    <el-dialog
      append-to-body
      :close-on-click-modal="false"
      @close="close"
      :visible="dialogVisible"
      width="474px"
      custom-class="sy-debunk"
    >
      <div slot="title">
        <div class="debunkTitle">意见反馈</div>
      </div>
      <div class="content">
        <img class="debunkImg" src="./../../../static/img/bunk.png" alt="" />
        <div class="debunkText">吐个槽</div>
        <el-form :model="form">
          <el-form-item label-width="0">
            <el-input
              resize="none"
              type="textarea"
              v-model="form.debunkValue"
              autocomplete="off"
              maxlength="200"
              placeholder="请输入您的吐槽~"
              :show-word-limit="true"
            >
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button class="onSubmit" type="primary" @click="onSubmit(form)"
          >提 交</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'sy-debunk',
  props: {
    data: {
      type: Object,
      default () {
        return {
          name: '',
          system: '',
          token: '',
          sy_baseUrl: ''
        }
      }
    }
  },
  data () {
    return {
      pos: {
        top: Math.min(window.innerHeight - 50, this.getLocalPos()),
        relativetop: 0
      },
      showEditContainer: false,
      showStarBox: false,
      rotateTrasition: {
        transform: 'rotate(0deg)'
      },
      deg: 0,
      timer: null,
      // 原有外部传入参数
      dialogVisible: false,
      star: 0,
      likeIt: 0,
      form: {
        debunkValue: ''
      }
    }
  },
  methods: {
    addListen () {
      document.addEventListener('mouseup', this.handlerMouseup)
      document.addEventListener('mousemove', this.handlerMousemove)
    },
    unListen () {
      document.removeEventListener('mouseup', this.handlerMouseup)
      document.removeEventListener('mousemove', this.handlerMousemove)
    },
    getLocalPos () {
      const pos = localStorage.syDebunkPos
      return pos || 110
    },
    handlerMousemove (e) {
      if (this.syDebunkPosDown) {
        this.pos.top = e.clientY + this.pos.relativetop
        if (this.pos.top <= 0) {
          this.pos.top = 0
        }
        const maxHeight = window.innerHeight - 50
        if (this.pos.top >= maxHeight) {
          this.pos.top = maxHeight
        }
        localStorage.syDebunkPos = this.pos.top
      }
    },
    handlerMousedown (e) {
      this.pos.relativetop = this.pos.top - e.clientY
      this.syDebunkPosDown = true
    },
    handlerMouseup () {
      this.syDebunkPosDown = false
    },
    showEditContainerEnter () {
      this.showEditContainer = true
    },
    showEditContainerLeave () {
      this.showEditContainer = false
    },
    async toggleStartAndFigur () {
      if (this.likeIt === 1) {
        this.$message.warning('您今天已经点过赞了哦~')
        return false
      }
      this.showStarBox = !this.showStarBox
      if (this.showStarBox) {
        this.timer = setInterval(() => {
          this.deg -= 3
          if (this.deg < -30) {
            clearInterval(this.timer)
            this.timer = null
            return false
          }
          this.rotateTrasition = {
            transform: 'rotate(' + this.deg + 'deg)'
          }
        }, 80)
        const params = {
          great: 1,
          name: this.data.name,
          system: this.data.system
        }
        await this.feedbackCreate(params)
        this.likeIt = 1
        await this.getfeedbackState()
        await this.$message.success('点赞成功')
      }
    },
    close () {
      this.form = {
        debunkValue: ''
      }
      this.dialogVisible = false
    },
    showDialog () {
      this.dialogVisible = true
    },
    async onSubmit (form) {
      if (form.debunkValue.trim() === '') {
        this.$message.warning('您还未填写你的吐槽哦')
        return false
      }
      const params = {
        great: 0,
        name: this.data.name,
        system: this.data.system,
        content: form.debunkValue.trim()
      }
      await this.feedbackCreate(params)
      this.$message.success('操作成功')
      await this.close()
    },
    async getfeedbackState () {
      const params = {
        great: 1,
        name: this.data.name,
        system: this.data.system
      }
      const result = await this.feedbackState(params)
      if (result === 1) {
        this.likeIt = 1
        this.showStarBox = true
        this.rotateTrasition = {
          transform: 'rotate(-30deg)'
        }
      }
    },
    feedbackCreate (params) {
      axios.defaults.headers = {
        'Content-Type': 'application/json',
        'X-Session-Id': this.data.token
      }
      return new Promise((resolve, reject) => {
        axios
          .post(this.data.sy_baseUrl + '/tool/feedback/create', params)
          .then((res) => {
            if (+res.data.code === 0) {
              resolve(res.data.data)
            } else {
              this.$message.error(res.data.msg)
              reject(res)
            }
          })
          .catch((err) => {
            this.$message.error(err && err.data && err.data.msg)
            reject(err)
          })
      })
    },
    // 判断是否点赞
    feedbackState (params) {
      axios.defaults.headers = {
        'Content-Type': 'application/json',
        'X-Session-Id': this.data.token
      }

      return new Promise((resolve, reject) => {
        axios
          .post(
            this.data.sy_baseUrl + '/tool/feedback/get/great/state',
            params
          )
          .then((res) => {
            if (+res.data.code === 0) {
              resolve(res.data.data)
            } else {
              this.$message.error(res.data.msg)
              reject(res)
            }
          })
          .catch((err) => {
            this.$message.error(err && err.data && err.data.msg)
            reject(err)
          })
      })
    }
  },
  mounted () {
    this.addListen()
    this.getfeedbackState()
  },
  beforeDestroy () {
    this.unListen()
  }
}
</script>

<!--动画-->
<style scoped>
/* 动画 */
.showEditContainer-enter {
  opacity: 0;
}
.showEditContainer-enter-active {
  transition: opacity 0.5s;
}

.face:hover .faceImg {
  top: -2px;
}

.star-enter {
  opacity: 0;
}
.star-enter-active {
  transition: opacity 2s;
}
</style>
<!--定位元素-->
<style scoped>
.positionContainer {
  user-select: none;
  height: 50px;
  box-sizing: border-box;
  background: transparent;
  position: absolute;
  right: 37px;
  z-index: 50;
}
.editContainer {
  width: 176px;
  height: 50px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.6);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.16);
  border-radius: 25px;
  position: relative;
  z-index: 100;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.feedbackContainer {
  position: absolute;
  right: 0;
  top: 0;
  width: 50px;
  height: 50px;
  background: var(--main-color);
  border-radius: 25px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.16);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: absolute;
  z-index: 150;
}
.feedbackImg {
  width: 20px;
  height: 20px;
}
.feedbackText {
  flex-shrink: 0;
  font-size: 12px;
  transform: scale(0.7);
  color: #ffffff;
  font-family: PingFangSC-Semibold, PingFang SC;
  font-weight: 500;
}
.editItem {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: 17px;
  cursor: pointer;
  position: relative;
}
.bunkImg {
  width: 34px;
  height: 34px;
  position: relative;
}
.pad {
  box-sizing: border-box;
  padding: 3px;
}
.editText {
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #fff;
  transform: scale(0.65);
}
.figur {
  position: absolute;
  left: 3px;
  bottom: 6px;
}
.positionFace {
  width: 32px;
  height: 32px;
  position: relative;
}
.starBox {
  position: absolute;
  left: -3px;
  top: 10px;
}
.starBig {
  position: absolute;
  top: 0;
  left: 0;
  transform: scale(1.5);
}
.starMiddle {
  position: absolute;
  top: -5px;
  left: -5px;
  transform: scale(1.1);
}
.starSmall {
  position: absolute;
  top: 5px;
  left: -5px;
  transform: scale(1.1);
}
</style>
<!--dialog-->
<style scoped>
.debunkTitle {
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #333333;
}

.content {
  box-sizing: border-box;
  padding: 30px 0 0;
  text-align: center;
}

.debunkImg {
  width: 44px;
  height: 44px;
}

.debunkText {
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #999999;
  margin: 12px 0 10px 0;
}

.dialog-footer {
  padding-bottom: 28px;
  padding-top: 10px;
  text-align: center;
}

.onSubmit {
  width: 321px;
  height: 40px;
  border: none;
  /* background-color: var(--main-color); */
  border-radius: 4px;
}
</style>
<!--dialog-->
<style  lang="less">
.sy-debunk {
  .el-dialog__header {
    background-color: #efefef;
    padding: 0;
    height: 40px;
    line-height: 40px;
    text-align: center;
    border-radius: 4px;
    position: relative;
  }

  .el-dialog__headerbtn {
    top: 50%;
    transform: translateY(-50%);
  }

  .el-dialog__body {
    padding: 0;
  }

  .el-dialog__footer {
    padding: 0;
  }

  .el-textarea__inner {
    width: 321px;
    height: 86px;
    background: #f9f9f9;
    border-radius: 4px;
    outline: none;
    border: none;
    margin: 0 auto;
  }
  .el-textarea .el-input__count {
    color: #909399;
    background: #fff;
    position: absolute;
    font-size: 12px;
    bottom: 5px;
    right: 82px;
  }
  .el-form-item {
    margin-bottom: 0 !important;
  }

  .el-badge__content.is-fixed {
    right: 15px;
    top: 3px;
  }
  .el-badge__content {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    // height: 12px;
    // font-size: 12px;
    // border-radius: 6px;
    // transform: scale(0.5);
  }
}
</style>
