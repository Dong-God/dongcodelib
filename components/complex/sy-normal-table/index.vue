<template>
  <div class="sy-normal-table" :class="{ disabled: disabled }">
    <div class="tip" v-if="tip">
      <div v-for="(it, i) in tip" :key="i" v-html="it.text"></div>
    </div> 
    <div
      class="search-container"
      :class="{ 'filterHide2': !filterShow && filterRowToMore==='2','filterHide1':!filterShow && filterRowToMore === '1' }"
      :style="{ maxHeight: expandAllFilter && 'inherit' }"
      v-if="showFilters"
      @keypress.enter="handlerpageOneSearch"
    >
      <el-form
        class="filters"
        ref="filters"
        :inline="true"
        :label-width="labelWidth"
        @submit.native.prevent
        :model="filterFormModel"
      >
        <el-form-item
          :class="`filters-item ${`filters-item-${String(it.prop || index)}`}`"
          v-for="it in showFilters"
          v-bind="{...it.filterItemBind}"
          :prop="String(it.prop || index)"
          :key="Array.isArray(it.prop) ? it.prop[0] : it.prop || it.label"
        >
          <div slot="label" class="filters-label" v-if="it.label" :style="it.labelStyle">
            <sy-text
              class="filters-label-text"
              :tips="{ content: it.label, placement: 'top' }"
              >{{ it.label }}</sy-text
            >
            <sy-tips v-if="it.tips" v-bind="it.tips" />
          </div>
          <component
            :ref="`filter_${it.prop}`"
            v-bind:is="it.tag"
            v-bind="{ clearable: true, ...it.bind }"
            :style="it.style"
            v-on="it.on"
            :value="getComponentValue(it.prop)"
            @input="setFiltersValue($event, it.prop)"
          >
          </component>
        </el-form-item>
      </el-form>
      <div class="search-item-handle">
        <el-button type="primary" @click="handlerpageOneSearch">查询</el-button>
        <el-button @click="clearFilters" v-if="hasClear">清空</el-button>
        <el-button
          v-if="expand"
          type="text"
          @click="filterShow = !filterShow"
          >{{ filterToggleText }}</el-button
        >
      </div>
    </div>
    <slot name="before"></slot>
    <sy-tabs
      v-if="tabs"
      v-bind="{ ...tabs, value: tabsSelection || tabs.defaultValue }"
      @input="setTabsSelection"
      @change="changeTabs"
    ></sy-tabs>
    <div class="title-container" v-if="btns">
      <sy-button
        v-for="(btn, i) in computedBtns"
        :key="i"
        v-bind="btn"
        :call="(data) => handlerBtnsCall(btn, data)"
        :class="{ showDisabled: btn.showDisabled }"
      />
    </div>
    <component v-bind:is="renderTableTag" :extraData="{
        filtersValue,
        pageFilter,
        selection,
        sort,
        tabsSelection,
      }"
      :disabled="disabled"
      :colspan="colspan"
      :columns="columns"
      :showDetils="showDetils"
      :handlerSearch="handlerSearch"
      :data="tableData"
      :preloadApis="preloadApis"
      :isSearching="isSearching"
      :virtualScroll="virtualScroll"
      :openCopy="openCopy"
      @select="handlerselection"
      @sort="handlerSort"
      :bind="tableBind"
      :on="{
        ...on,
        'row-dblclick': handlerDblclick,
      }"
      ref="table"/>

    <slot name="after"></slot>
    <el-pagination
      v-if="pagination"
      layout="->, total, sizes, prev, pager, next, jumper"
      :pageSize.sync="pageFilter.pageSize"
      :currentPage.sync="pageFilter.pageNo"
      :pageSizes="pageSizes"
      :total="pageFilter.total"
      @size-change="changePage"
      @current-change="changePage"
      @prev-click="changePage"
      @next-click="changePage"
    >
    </el-pagination>
    <sy-form v-if="dialogForm" v-bind="dialogForm" ref="dialogForm" />
  </div>
</template>
<script>
import Vue from 'vue'

export default {
  name: 'sy-normal-table',
  props: {
    renderTableTag: { default: 'sy-table' },
    labelWidth: { type: String, default: '100px' },
    hasClear: { type: Boolean, default: true },
    initSearch: { type: Boolean, default: true },
    showDetils: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    tip: [Array],
    expandAllFilter: [Boolean],
    filterRowToMore: { type: String, default: '2' },
    filters: [Array, Boolean],
    search: [Function],
    btns: [Array, Function],
    columns: [Array, Function],
    tableBind: [Object],
    virtualScroll: [Object],
    colspan: { type: Array, default: () => [] },
    tabs: { type: Object },
    on: [Object],
    pagination: {
      default: true
    },
    preloadApis: {
      type: [Object],
      default: () => {}
    },
    pageSizes: {
      type: Array
    },
    handleClearFilters: {
      type: Function,
      default: (_) => _
    },
    openCopy: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      dialogForm: null,
      filterShow: false,
      expand: false,
      filtersValue: this.initFiltersValue(),
      tabsSelection: null,
      selection: [],
      sort: {},
      pageFilter: this.getDefaultPagination(),
      tableData: [],
      isSearching: false
    }
  },
  async created () {
    this.initSearchHanlder()
  },
  computed: {
    filterFormModel () {
      const isArrayProp = {}
      this.showFilters.forEach(item => {
        if (Array.isArray(item.prop)) {
          isArrayProp[String(item.prop)] = item.prop.map(it => this.filtersValue[it]).filter(v => v)
        }
      })
      return { ...this.filtersValue, ...isArrayProp }
    },
    computedBtns () {
      if (typeof this.btns === 'function') {
        return this.btns(this)
      } else {
        return this.btns
      }
    },
    // expand () {
    //   console.log(this.$refs.filters)
    //   if (this.filters.length <= 6) {
    //     // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    //     this.filterShow = true
    //     return false
    //   }
    //   return true
    // },
    showFilters () {
      if (!this.filters) {
        return false
      }
      const showFilters = this.filters.filter((it) => {
        if (it.hide) {
          return false
        }
        if (
          it.code &&
          !window.USER_INFO.menus.find((jt) => jt.isShow === '2' || (jt.isShow !== '0' && jt.code === it.code))
        ) {
          return false
        }
        return true
      })
      if (!showFilters.length) {
        return false
      }
      return showFilters
    },
    filterToggleText () {
      return this.filterShow ? '收起' : '展开'
    }
  },
  watch: {},
  methods: {
    // 添加tip功能
    addTip (it, fn) {
      const { hanlderTipMouseenter } = this
      if ((!it.type && it.tip !== false) || it.type === 'tip' || it.tip) {
        return (props) => {
          const value = props.row[it.prop]
          const key = `sy-table-col-tip-hide-${parseInt(
            Math.random() * 1000000
          )}`
          return (
            <el-tooltip
              effect="dark"
              placement="top"
              content={value + ''}
              popper-class={key}
            >
              <span class="text-tip" on-mouseenter={hanlderTipMouseenter(key)}>
                {fn ? fn(props) : value || '-'}
              </span>
            </el-tooltip>
          )
        }
      }
      return fn
    },
    getDefaultPagination () {
      if (typeof this.pagination === 'object') {
        return this.pagination
      }
      return {
        pageNo: 1,
        pageSize: 10,
        total: 0
      }
    },
    // 改变tabs
    changeTabs () {
      this.handlerSearch()
    },
    // 设置tabs选中值
    setTabsSelection (v) {
      this.tabsSelection = v
    },
    // 双击表格显示详情
    handlerDblclick (row, column, cell) {
      const { on } = this
      if (on && on['row-dblclick']) {
        on['row-dblclick'](row, column, cell)
      }
      if (this.showDetils) {
        this.showForm(this.$refs.table._columns, row)
      }
    },
    // 显示详情表格
    showForm (columns, data) {
      const that = this
      columns = columns.filter((it) => it.label && it.type !== 'btns')
      this.dialogForm = {
        dialog: {
          showCancel: false,
          width: '866px'
        },
        formStyle: 'box',
        bind: {
          inline: true // 纵向布局
        },
        list () {
          return JSON.parse(JSON.stringify(columns))
        },
        submit () {
          that.$refs.dialogForm.close()
        }
      }
      setTimeout(() => {
        this.$refs.dialogForm.open('详情', data)
      })
    },
    setExpand () {
      if (this.expandAllFilter) {
        return false
      }
      setTimeout(() => {
        const filters = this.$refs.filters
        if (!filters || !filters.$children.length) {
          return false
        }
        const lastNum = filters.$children.length
        const el = filters.$children[lastNum - 1].$el
        if (el.offsetTop > 40 * this.filterRowToMore) {
          this.expand = true
        }
      })
    },
    // 批量删除函数
    deleteList () {
      if (!this.selection || !this.selection.length) {
        this.$message.error('请选择后删除！')
        return false
      }
      const set = this.selection.map((item) => item._id)
      const resArr = this.tableData.filter((item) => !set.includes(item._id))
      this.selection = []
      this.setValue(resArr)
    },
    handlerBtnsCall (btn, data) {
      if (btn.call) {
        const { tableData, filtersValue, selection, pageFilter, deleteList } =
          this
        btn.call.apply(this, [
          {
            tableData,
            filtersValue,
            selection,
            pageFilter,
            ...data,
            utils: { deleteList }
          },
          this
        ])
      }
    },
    // 直接设置值
    setValue (data) {
      this.tableData = data.map((it) => ({ _id: Math.random(), ...it }))
    },
    getValue () {
      return [...this.tableData]
    },
    setFiltersValue (v, prop) {
      if (Array.isArray(prop)) {
        prop.forEach((it, i) => {
          this.$set(this.filtersValue, it, v ? v[i] : undefined)
        })
      } else {
        this.$set(this.filtersValue, prop, v)
      }
    },
    getComponentValue (prop) {
      if (Array.isArray(prop)) {
        const valueList = prop.map((it) => this.filtersValue[it])
        if (!valueList.filter((it) => it !== undefined).length) {
          return []
        }
        return valueList
      }
      return this.filtersValue[prop]
    },
    // 初始化filter的值
    initFiltersValue () {
      if (!this.filters) {
        return {}
      }
      const values = {}
      this.filters.forEach((it) => {
        if (!it.defaultValue) {
          return false
        }
        if (Array.isArray(it.prop)) {
          it.prop.forEach((prop, i) => {
            values[prop] = it.defaultValue[i]
          })
        } else {
          values[it.prop] =
            it.defaultValue !== undefined ? it.defaultValue : undefined
        }
      })
      return values
    },
    // 点击查询按钮
    handlerpageOneSearch () {
      this.$refs.filters.validate().then(() => {
        this.pageFilter = {
          pageNo: 1,
          pageSize: 10
        }
        this.handlerSearch()
      })
    },
    // 清除过滤器
    async clearFilters () {
      const initValue = this.initFiltersValue()
      this.filtersValue =
        (await this.handleClearFilters(initValue)) || initValue
      this.$nextTick(() => {
        this.handlerpageOneSearch()
      })
    },
    // 触发搜索
    async handlerSearch (isTabChange = false) {
      if (!this.search) {
        return false
      }
      if (isTabChange) {
        this.pageFilter = {
          pageNo: 1,
          pageSize: 10
        }
      }
      this.isSearching = true
      try {
        const { filtersValue, pageFilter, selection, sort, tabsSelection } =
          this
        const data = await this.search({
          filtersValue,
          pageFilter,
          selection,
          sort,
          tabsSelection
        })
        this.tableData = data.list || []
        this.pageFilter.total = data.total
        this.isSearching = false
      } catch (e) {
        this.isSearching = false
      }
    },
    // table selection 事件
    handlerselection (selection) {
      this.selection = selection
      this.$emit('select', selection)
      this.$emit('selection-change', this.selection)
    },
    handlerSort ({ column, prop, order }) {
      this.sort = {
        key: prop,
        value: order && (order === 'descending' ? 'DESC' : 'ASC')
      }
      this.handlerSearch()
      this.$emit('sort', { column, prop, order })
    },
    handerSizeChange (v) {
      this.pageSize = v
      this.changePage()
    },
    initSearchHanlder () {
      this.changePage = Vue.prototype.$utils.debounceWait(() => {
        this.handlerSearch()
      }, 10)
    }
  },
  mounted () {
    if (this.initSearch) {
      this.handlerSearch()
    }
    this.setExpand()
  }
}
</script>
<style lang="less">
.sy-normal-table {
  .search-container {
    .el-form-item__label{
      &::before{
        display: none;
      }
    }
    .filters-item.is-required{
      .filters-label-text {
        &::before{
          content: '*';
          color: #DE3509;
          margin-right: 4px;
         }
      }
    }
    .filters-label {
      position: relative;
      height: 32px;
      .filters-label-text {
        width: 100px;
        padding-right: 16px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
        box-sizing: border-box;
      }
      .sy-tips-wrap {
        position: absolute;
        right: -12px;
        top:0;
      }
    }
  }

  &.disabled {
    .title-container {
      .el-button {
        display: none;
        &.showDisabled {
          display: unset;
        }
      }
    }
  }
  .tip {
    line-height: 16px;
    margin-bottom: 16px;
    background: #f7f8fa;
    color: #909399;
    padding: 8px 16px;
    font-size: 12px;
  }

  .el-tabs {
    padding-top: 16px;
    .el-tabs__header {
      margin: 0;
    }
  }
  .search-container {
    box-sizing: border-box;
    position: relative;
    width: 100%;
    // background-color: #f7f8fa;
    font-size: 0;
    overflow: hidden;
    padding: 8px;
    &.filterHide1 {
      max-height: 50px;
    }
    &.filterHide2 {
      max-height: 100px;
    }
    .filters {
      display: inline-block;
      width: calc(100% - 180px);
      vertical-align: middle;
      .filters-item {
        margin-bottom: 14px;
        .el-form-item__content {
          width: 222px;
        }
      }
    }
    .search-item-handle {
      display: inline-block;
      width: 180px;
      overflow: hidden;
      vertical-align: top;
      text-align: right;
    }
  }
  .title-container {
    width: 100%;
    margin-top: 16px;
    background-color: #ffffff;
    overflow: hidden;
  }
  .el-table {
    margin-top: 16px;
  }
  .el-pagination {
    margin-top: 16px;
    text-align: center;
    .el-pagination__rightwrapper {
      float: unset;
    }
  }
}
</style>
