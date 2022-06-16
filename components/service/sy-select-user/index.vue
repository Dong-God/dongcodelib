<template>
  <sy-select
    ref="select"
    :value="value"
    @input="handlerInput"
    v-bind="bind"
    :options="options"
    :flashOptions="true"
    :remoteMethod="remoteMethod"
  />
</template>
<script>
export default {
  name: 'sy-select-user',
  props: {
    value: {
      type: String
    },
    on: {
      type: Object
    },
    bind: {
      type: Object,
      default: () => ({
        placeholder: '支持花名拼音和中文'
      })
    }
  },
  data () {
    return {
      options: []
    }
  },
  watch: {
    value (v) {
      if (!this.$refs.select.list.length && v) { // 默认值是调接口获取的
        this.getUserInfo()
      }
    }
  },
  computed: {},
  methods: {
    handlerInput (v) {
      this.$emit('input', v)
    },
    async remoteMethod (name) {
      if (!name.length) {
        return []
      }
      let data = await this.$syAjax.get(
        '/dingtalk/api/master/org/list/user/account',
        { params: { name } }
      )
      data = data.map((it) => ({
        label: `${it.name}(${it.loginName})`,
        value: it.loginName
      }))
      // 如果输入的值跟后台返回数据的花名和英文名都不一样，并且输入值是英文时，增加输入值的选项
      if ((!data.find(it => it.label.split('(')[0] === name) && !data.find(it => it.value === name)) && /^[a-zA-Z | _ ]+$/.test(name)) {
        // 判断输入的是不是纯英文，如果是纯英文就添加选项
        data.push({
          label: name,
          value: name
        })
      }
      return data
    },
    async getUserInfo () {
      const data = await this.$syAjax.post(
        '/dingtalk//api/master/org/listUserInfo',
        { loginNames: [this.value] }
      )
      this.options = data.map((it) => ({
        label: `${it.name}(${it.loginName})`,
        value: it.loginName
      }))
    }
  },
  created () {
    this.value && this.getUserInfo()
  },
  mounted () {}
}
</script>
