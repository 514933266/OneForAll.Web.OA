<template>
  <div class="flow-box">
    <!-- 左侧tab -->
    <div class="flow-left-tab">
      <div v-for="item,index in tabArr" :key="index" :class="{active:currentIndex===index}" @click="clickLeftTab(index)">
        <i :class="item.icon"></i>
        <span>{{item.name}}</span>
      </div>
    </div>
    <!-- 右侧流程图 -->
    <div class="dingflow-design">
      <!-- 缩放比 -->
      <div class="zoom-box">
        <el-button type="primary" size="mini" class="set-btn" @click="edit = true" v-if="!edit"> 编 辑 </el-button>
        <el-button type="primary" size="mini" class="set-btn" v-else @click="sumit"> 发 布 </el-button>
        <div class="zoom">
          <div :class="'zoom-out'+ (nowVal==50?' disabled':'')" @click="zoomSize(1)"></div>
          <span>{{nowVal}}%</span>
          <div :class="'zoom-in'+ (nowVal==300?' disabled':'')" @click="zoomSize(2)"></div>
        </div>
      </div>
      <!-- 流程图 -->
      <div class="box-scale" id="box-scale" :style="'transform: scale('+nowVal/100+'); transform-origin: 50% 0px 0px;'">
        <node-wrap :nodeConfig.sync="nodeConfig" :flowPermission="flowPermission" />
        <div class="end-node">
          <div class="end-node-circle"></div>
          <div class="end-node-text">流程结束</div>
        </div>
      </div>
    </div>
    <!-- 选择发起人 -->
    <promoter-drawer />
    <!-- 选择抄送人 -->
    <copyer-drawer />
    <!-- 选择审核人 -->
    <approver-drawer />
    <!-- 条件 -->
    <condition-drawer />
  </div>
</template>

<script>
import { PERSON_SETTING_FLOW } from '../../../router/oa-router'
import NodeWrap from '../_components/NodeWrap'
import PromoterDrawer from '../_components/PromoterDrawer'
import CopyerDrawer from '../_components/CopyerDrawer'
import ApproverDrawer from '../_components/ApproverDrawer'
import ConditionDrawer from '../_components/ConditionDrawer'
import data from './../../../assets/js/oa-flow-data.js'
export default {
  name: PERSON_SETTING_FLOW.name,
  provide () {
    return {
      flow: this
    }
  },
  data () {
    return {
      tabArr: [
        { name: '请假流程', icon: 'el-icon-s-order' },
        { name: '加班流程', icon: 'el-icon-s-data' },
        { name: '外出流程', icon: 'el-icon-s-cooperation' },
        { name: '出差流程', icon: 'el-icon-s-goods' }],
      currentIndex: 0,
      nowVal: 100,
      nodeConfig: {},
      flowPermission: [],
      directorMaxLevel: '',
      promoterDrawer: false, // 发起人抽屉显示隐藏
      copyerDrawer: false, // 抄送人抽屉
      copyerConfig: {}, // 节点抄送人的数据
      approverDrawer: false, // 审核人的抽屉显示隐藏flow
      approverConfig: {}, // 节点审核人的数据
      conditionDrawer: false, //  条件显示隐藏
      conditionConfig: {}, // 条件节点
      conditionNodesLength: '',
      edit: false, // 是否可编辑
      isTried: false // 是否验证通过
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      return false
    },
    // 左侧点击tab
    clickLeftTab (index) {
      this.currentIndex = index
    },
    // 缩小放大
    zoomSize (type) {
      if (type === 1) {
        if (this.nowVal === 50) return
        this.nowVal -= 10
      } else {
        if (this.nowVal === 300) return
        this.nowVal += 10
      }
    },
    // 提交
    sumit () {
      this.isTried = true
      console.log(this.checkError(this.nodeConfig));
      const flag = this.checkError(this.nodeConfig)
      if (!flag) {
        return this.$message({
          message: '请完善流程图！',
          type: 'warning'
        })
      } else {
        this.isTried = false
        this.$message({
          message: '发布成功！',
          type: 'success'
        })
        this.edit = false
      }
    },
    // 递归验证每一层的error 都是false
    checkError (obj) {
      if (typeof obj === 'object') {
        for (const key in obj) {
          // eslint-disable-next-line no-prototype-builtins
          if (obj.hasOwnProperty(key)) {
            if (key === 'error' && obj[key] === true) {
              return false
            } else if (!this.checkError(obj[key])) {
              return false
            }
          }
        }
      }
      return true
    }
  },
  created () {
    this.nodeConfig = data.nodeConfig
    this.flowPermission = data.flowPermission
    this.directorMaxLevel = data.directorMaxLevel
  },
  components: { NodeWrap, PromoterDrawer, CopyerDrawer, ApproverDrawer, ConditionDrawer }
}
</script>

<style lang="scss" scoped>
@import './../../../assets/css/oa-flow.css';
.flow-box {
  display: flex;
  box-sizing: border-box;
  font-size: 14px;
  background: #fff;
  height: calc(100vh - 155px);
  overflow: hidden;
  // 左侧tab
  .flow-left-tab {
    overflow-y: auto;
    overflow-x: hidden;
    height: calc(100vh - 171px);
    margin: 8px 0;
    padding: 0 8px;
    width: 150px;
    > div {
      display: flex;
      align-items: center;
      padding-left: 8px;
      height: 34px;
      line-height: 34px;
      margin-bottom: 8px !important;
      background: transparent;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.3s;
      color: #171a1d;
      > i {
        font-size: 16px;
        margin-right: 5px;
      }
    }
    > div:hover {
      background: #eaeced;
    }
    .active {
      background: #eaeced;
      font-weight: 900;
      color: #409eff;
      > i {
        font-weight: 900;
        color: #409eff;
      }
    }
  }
}
</style>
