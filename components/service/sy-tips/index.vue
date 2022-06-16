<template>
  <div class="sy-tips-wrap">
    <el-tooltip
      :disabled="content.length !== 1"
      class="item"
      effect="dark"
      :content="content[0] && content[0].value"
      v-bind="tooltip"
    >
      <div
        class="sy-tips"
        :class="[`content${content.length}`]"
        @click="showMutipleList"
      >
        <span>{{ label }}</span>
        <i :class="icon"></i>
      </div>
    </el-tooltip>
    <el-dialog :title="label" :visible.sync="dialogTableVisible">
      <div class="sy-tips-list-wrap">
        <div class="list-item" v-for="(it, i) in content" :key="i">
          <div class="label">【{{ it.label }}】</div>
          <div class="value">{{ it.value }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { MemoryCache } from '../../../utils/Cache'
const cache = new MemoryCache('sy-tips-data')
export default {
  name: 'sy-tips',
  props: {
    ajaxData: {},
    text: {},
    label: {},
    icon: {
      default: 'hermes hermes-bangzhuzhongxin'
    },
    tooltip: {
      default: () => ({
        placement: 'top'
      })
    }
  },
  data () {
    return {
      content: '',
      dialogTableVisible: false
    }
  },
  computed: {},
  methods: {
    // 获取数据
    async getContent () {
      const data = await this.$syAjax.post(
        '/common/api/tips/listAllWithTips',
        {
          tenantId: this.ajaxData.tenantId,
          terminal: this.ajaxData.terminal
        }
      )
      return data
    },
    // 显示多条数据
    showMutipleList () {
      if (this.content.length > 1) {
        this.dialogTableVisible = true
      }
    },
    // 获取缓存数据
    async getCache () {
      if (this.ajaxData) { // （以租户id加终端为单位缓存）
        let data = await cache.get(`${this.ajaxData.tenantId}-${this.ajaxData.terminal}`, this.getContent)
        if (this.ajaxData.key) {
          data = data.filter((it) => it.key === this.ajaxData.key)
        } else if (this.ajaxData.type) {
          data = data.filter((it) => it.type === this.ajaxData.type)
        }
        this.content = data
      } else {
        this.content = [{ value: this.text }]
      }
    }
  },
  created () {
    this.getCache()
  },
  mounted () {}
}
</script>
<style scoped lang="less">
.sy-tips-wrap {
  display: inline;
}
.sy-tips {
  display: inline-flex;
  color:#0D1B3F;
  font-size: 14px;
  align-items: center;
  vertical-align: bottom;
  &.content2 {
    cursor: pointer;
  }
  i {
    margin-left: 2px;
    font-size: 16px;
    &:hover {
      color: #0D1B3F;
    }
  }
}
.sy-tips-list-wrap {
  color: #606266;
  margin-top: -20px;
  .list-item {
    display: flex;
    font-size: 12px;
    line-height: 40px;
    border-bottom: 1px solid #e4e7ed;
    .label {
      color: #909399;
      width: 120px;
      text-align: right;
    }
  }
}
</style>
