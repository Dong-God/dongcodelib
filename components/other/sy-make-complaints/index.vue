<template>
  <div class="sy-make-complaints-mian">
    <div class="sy-make-complaints-title" @click="elDialogShow">
      <svg
        t="1624520324336"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="809"
        width="16"
        height="16"
      >
        <path
          d="M512 64a448 448 0 1 0 0 896A448 448 0 0 0 512 64z m55.488 644.992c-4.8 5.248-9.728 13.056-14.912 20.736-12.16 18.56-24.768 37.952-41.984 38.272H510.08c-17.6 0-31.36-19.328-44.736-38.144a147.2 147.2 0 0 0-18.56-22.912 281.216 281.216 0 0 1-21.632-6.144c-1.088-0.128-2.176-0.128-3.2-0.32h2.112C326.016 668.288 256 584.192 256 485.376 256 358.656 370.56 256 512 256c141.312 0 256 102.656 256 229.376-0.192 109.44-85.952 200.832-200.512 223.616z"
          p-id="810"
        ></path>
        <path
          d="M470.336 482.24c0 24.192 18.624 43.84 41.664 43.84 23.04 0 41.664-19.648 41.664-43.84 0-24.192-18.624-43.84-41.664-43.84-23.04 0-41.664 19.648-41.664 43.84zM324.48 482.24c0 24.192 18.56 43.84 41.6 43.84 23.04 0 41.664-19.648 41.664-43.84 0-24.192-18.624-43.84-41.6-43.84-23.04 0-41.728 19.648-41.728 43.84zM616.256 482.24c0 24.192 18.624 43.84 41.6 43.84 23.04 0 41.728-19.648 41.728-43.84 0-24.192-18.688-43.84-41.664-43.84-23.04 0-41.664 19.648-41.664 43.84z"
          p-id="811"
        ></path>
      </svg>
      <span class="make-tucao">意见反馈</span>
    </div>
    <el-dialog
      append-to-body
      :close-on-click-modal="false"
      @close="close"
      :visible="dialogVisible"
      width="474px"
      custom-class="sy-make-complaints"
    >
      <div slot="title">
        <div class="debunkTitle">意见反馈</div>
      </div>
      <div class="imgBox">
        <div class="makeComplaintsBox" @click="inptFlag(1)">
          <img class="bunkImg" src="./../../../static/img/bunk.png" alt="" />
          <span class="editText">吐个槽</span>
        </div>
        <div class="giveTheThumbsUp" @click="inptFlag(0)">
          <div
            :class="['smile', { smileBox: likeIt === 0 }]"
            @click="toggleStartAndFigur"
          >
            <img class="smileImg" src="./../../../static/img/good2.png" alt="" />
            <img
              :style="rotateTrasition"
              class="figur"
              src="./../../../static/img/figur.png"
              alt=""
            />

            <transition name="star">
              <div v-show="showStarBox" class="starBox">
                <img class="starBig" src="./../../../static/img/star.png" alt="" />
                <img
                  class="starMiddle"
                  src="./../../../static/img/star.png"
                  alt=""
                />
                <img
                  class="starSmall"
                  src="./../../../static/img/star.png"
                  alt=""
                />
              </div>
            </transition>
          </div>
          <span class="editText">{{ likeIt === 0 ? "点个赞" : "已点赞" }}</span>
        </div>
      </div>
      <div class="feedbackBox" v-show="inptShow">
        <el-input
          resize="none"
          type="textarea"
          placeholder="请输入您的吐槽～"
          v-model="debunkValue"
          autocomplete="off"
          maxlength="200"
          :show-word-limit="true"
        ></el-input>
      </div>
      <div class="onSubmit" v-show="inptShow" @click="sendMsg(debunkValue)">
        吐槽
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'sy-make-complaints',
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
      rotateTrasition: {
        transform: 'rotate(0deg)'
      },
      showStarBox: false,
      deg: 0,
      timer: null,
      debunkValue: '',
      star: 0,
      likeIt: 0,
      dialogVisible: false,
      inptShow: false
    }
  },
  created () {},
  methods: {
    // 点赞
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
        this.$message.success('点赞成功')
      }
    },
    // 吐槽
    async sendMsg (debunkValue) {
      if (debunkValue.trim() === '') {
        this.$message.warning('您还未填写你的吐槽哦')
        return false
      }
      const params = {
        great: 0,
        name: this.data.name,
        system: this.data.system,
        content: debunkValue.trim()
      }
      await this.feedbackCreate(params)
      this.$message.success('操作成功')
      this.close()
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
    close () {
      this.debunkValue = ''
      this.dialogVisible = false
      this.inptShow = false
    },
    elDialogShow () {
      this.debunkValue = ''
      this.dialogVisible = true
      this.getfeedbackState()
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
    },
    inptFlag (i) {
      if (+i === 0) {
        this.inptShow = false
      } else {
        this.inptShow = true
      }
    }
  }
}
</script>
<style lang="less"  scoped>
.titel {
  width: 72px;
  height: 25px;
  font-size: 18px;
  font-family: PingFangSC-Semibold, PingFang SC;
  font-weight: 600;
  color: #333333;
  line-height: 25px;
  margin: 0 auto;
}
.imgBox {
  width: 321px;
  height: 100%;
  margin: 39px auto 0;
  display: flex;
  cursor: pointer;
}
.makeComplaintsBox {
  margin-left: 45px;
  transition: display 1s;
}
.makeComplaintsBox img,
span {
  display: block;
  width: 44px;
  text-align: center;
}
.makeComplaintsBox img {
  position: relative;
}
.makeComplaintsBox img:hover {
  top: -2px;
}
.makeComplaintsBox span {
  margin-top: 17px;
  color: #626266;
  font-size: 14px;
}

.giveTheThumbsUp {
  margin-left: 142px;
}
.smile,
span {
  display: block;
  width: 44px;
  text-align: center;
  position: relative;

}
.smile {
  height: 44px;
}
.giveTheThumbsUp .smileBox:hover {
  top: -2px;
}
.smile .smileImg {
  width: 38px;
  height: 38px;
  margin-top: 4px;
}
.smile .figur {
  position: absolute;
  width: 10px;
  height: 15px;
  left: 4px;
  bottom: 4px;
}
.giveTheThumbsUp span {
  margin-top: 17px;
  color: #626266;
  font-size: 14px;
}

.star-enter {
  opacity: 0;
}
.star-enter-active {
  transition: opacity 2s;
}
.starBox {
  position: absolute;
  left: -16px;
  bottom: 10px;
}
.starBox .starBig {
  position: absolute;
  left: 10px;
  bottom: 4px;
  transform: scale(1.9);
}
.starBox .starMiddle {
  position: absolute;
  left: 2px;
  bottom: 11px;
  transform: scale(1.3);
}
.starBox .starSmall {
  position: absolute;
  left: 2px;
  bottom: -2px;
  transform: scale(1.3);
}

.feedbackBox {
  width: 321px;
  height: 86px;
  border-radius: 4px;
  margin: 20px auto;
  resize: none;
}
.onSubmit {
  width: 321px;
  height: 40px;
  background: var(--main-color);
  border-radius: 4px;
  margin: 7px auto;
  line-height: 40px;
  text-align: center;
  font-size: 14px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
}
.sy-make-complaints-title {
  flex: 1;
  height: 32px;
  line-height: 32px;
  border-right: 1px solid var(--border-color);
  width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.sy-make-complaints-title svg {
  width: 14px;
  height: 14px;
}
.sy-make-complaints-title svg path {
  color: #ffffff;
  fill: currentColor;
}
.make-tucao {
  width: 60px;
  font-size: 12px;
  cursor: pointer;
}
</style>
<style >
.sy-make-complaints .feedbackBox .el-textarea__inner {
  width: 321px;
  height: 86px;
  background: #f9f9f9;
  border-radius: 4px;
  outline: none;
  border: none;
  border-color: #f9f9f9;
}
.sy-make-complaints .feedbackBox .el-textarea .el-input__count {
  color: #909399;
  background: #fff;
  position: absolute;
  font-size: 12px;
  bottom: 0px;
  right: 0px;
}
.sy-make-complaints .el-dialog__header {
  background-color: #efefef;
  padding: 0;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 4px;
  position: relative;
  font-size: 14px;
}
.sy-make-complaints .el-dialog__headerbtn {
  top: 50%;
  transform: translateY(-50%);
}
</style>
