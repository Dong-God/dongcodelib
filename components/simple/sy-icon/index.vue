<template>
  <el-popover
    :placement="placement"
    :title="title"
    :width="width"
    :trigger="trigger"
    :content="content"
  >
    <i class="sy-icon" :class="icon" slot="reference"></i>
  </el-popover>
</template>
<script>
export default {
  name: 'sy-icon',
  props: {
    content: [String],
    icon: [String],
    trigger: {
      default: 'hover',
      type: String
    },
    placement: {
      default: 'top',
      type: String
    },
    title: {
      default: '',
      type: String
    },
    width: {
      default: '',
      type: String
    }
  },
  data () {
    return {}
  },
  computed: {
    accept () {
      return this?.file?.type
        ?.map((it) => this.$utils.MIME_type[it] || it)
        .join(',')
    }
  },
  methods: {},
  created () {},
  mounted () {},
  components: {}
}
</script>
<style lang="less">
</style>
