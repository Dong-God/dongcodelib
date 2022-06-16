<template>
  <div class="sy-input-dynamic">
    <div v-for="(item , index) in myValue" :key="item.key" class="sy-input-dynamic-item">
      <div class="item">
        <component v-if='tag' :is='tag' v-model="item.value" v-bind="bind" v-on='on' :disabledArr='disabledArr[index]' :disabled='index<disabledNumber'/>
        <slot :value="item.value" v-bind="bind" v-on='on' :disabled='index<disabledNumber' :disabledArr='disabledArr[index]'></slot>
        <el-button type='text' @click="handleClickRemove(item)" v-if="(index >= noDelete) && !item.noDelete && index >= disabledNumber">删除</el-button>
      </div>
    </div>
    <el-button class='sy-input-dynamic-add-btn' v-if="value.length<max" type="text" @click="handleClickAdd">+ {{label}}</el-button>
  </div>
</template>
<script>

export default {
  name: 'sy-input-dynamic',
  props: {
    value: {
      type: Array,
      default () {
        return []
      }
    },
    tag: {
      type: String
    },
    bind: {
      type: Object
    },
    on: {
      type: Object
    },
    disabledNumber: { // 前面多少行禁用，同时没有删除按钮
      type: Number,
      default: 0
    },
    disabledArr: {
      type: Array,
      default () {
        return []
      }
    },
    noDelete: {
      type: Number,
      default: 0
    },
    label: {
      type: String,
      default: '添加'
    },
    delete: {
      type: Function
    },
    max: { // 最多配置数量
      type: Number,
      default: 10
    }
  },
  data () {
    return {
      myValue: [],
      index: 0
    }
  },
  watch: {
    value: {
      handler (val) {
        if (JSON.stringify(this.myValue.map(item => { return item.value })) !== JSON.stringify(val)) {
          this.myValue = val.map(item => {
            return {
              value: item,
              index: '_' + this.index++
            }
          })
        }
      },
      immediate: true,
      deep: true
    },
    myValue: {
      handler (val) {
        this.$emit('input', val.map(item => item.value))
      },
      deep: true
    }
  },
  methods: {
    handleClickAdd () {
      this.value.push(Array.isArray(this.value[0]) ? [] : null)
    },
    handleClickRemove (v) {
      if (this.delete && v.id) {
        this.delete(v, boolen => {
          if (boolen) {
            this.myValue.splice(this.myValue.indexOf(v), 1)
          }
        })
      } else {
        this.myValue.splice(this.myValue.indexOf(v), 1)
      }
    }
  }
}

</script>
<style lang="less">
.sy-input-dynamic {
  .sy-input-dynamic-item {
    .sy-select-warp{
      display: inline-block;
    }
    margin-bottom:10px;
      .item {
        font-size: 0;
      }
      .label {
        display: inline-block;
      }
      .el-input {
        width: 260px;
        margin-right: 10px;
      }
      .el-icon-delete {
        margin-left: 10px;
        color: #8a97aa;
      }
      .el-button--primary {
        margin-left: 12px;
      }
      .el-button--default {
        margin-left: 10px;
      }
      .el-icon-delete {
        cursor: pointer;
        font-size: 12px;
      }
    }
  }
</style>
