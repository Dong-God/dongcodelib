
<script>
export default {
  name: 'sy-radio',
  props: {
    options: {
      type: [Array, Function, String],
      default () {
        return []
      }
    },
    bind: {
      default () {
        return {}
      }
    },
    value: {
      required: true
    },
    optionsProps: {
      type: Object,
      default () {
        return {
          label: 'label',
          value: 'value'
        }
      }
    },
    radioType: {
      type: String
    }
  },
  data () {
    return {
      items: []
    }
  },
  watch: {
  },
  async created () {},
  computed: {},
  methods: {
    async initOptions () {
      const { options } = this
      if (typeof options === 'string') {
        this.items = this.$dict[options]
      } else if (typeof options === 'function') {
        this.items = await options()
      } else if (Array.isArray(options)) {
        this.items = options
      }
    }
  },
  render (h) {
    const { optionsProps, bind, value, _events, radioType } = this
    const options = this.items.map((it) => {
      return h(radioType === 'button' ? 'el-radio-button' : 'el-radio', {
        class: `sy-${radioType}-radio`,
        props: {
          label: it[optionsProps.value],
          key: it[optionsProps.value],
          disabled: it.disabled
        }
      }, it[optionsProps.label])
    })
    return h('el-radio-group', {
      class: 'sy-radio',
      props: {
        value,
        ...bind
      },
      on: _events
    }, options)
  },
  mounted () {
    this.initOptions()
  }
}
</script>
<style lang="less">
.sy-radio {
  .el-radio.sy-text-radio{
    .el-radio__input{
      display: none;
    }
  }
  .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    color: var(--color-primary);
    background-color: #efebfa;
    border-color: var(--color-primary);
  }
}
</style>
