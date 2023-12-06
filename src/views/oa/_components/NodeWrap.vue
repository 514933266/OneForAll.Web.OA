<template>
  <div>
    <!-- 0 发起人 1审批 2抄送 3条件 4路由 -->
    <div class="node-wrap" v-if="nodeConfig.type<3">
      <div class="node-wrap-box" :class="(nodeConfig.type===0?'start-node':'')+(flow.isTried&&nodeConfig.error?'active error':'')">
        <div>
          <div class="title" :style="`background: rgb(${bgColor});`">
            <!-- 头部文字 -->
            <span v-if="nodeConfig.type===0">{{nodeConfig.nodeName}}</span>
            <template v-else>
              <!-- 图标 -->
              <span class="iconfont">{{nodeConfig.type===1?'':''}}</span>
              <!-- 自定义头部文字 -->
              <input type="text" v-if="isInput" class="ant-input editable-title-input" @blur="blurEvent()" v-focus v-model="nodeConfig.nodeName" :placeholder="defaultText">
              <span v-else class="editable-title" @click="clickEvent()">{{nodeConfig.nodeName}}</span>
              <!-- 删除按钮 -->
              <i class="anticon anticon-close close" @click="delNode" v-if="flow.edit"></i>
            </template>
          </div>
          <div class="content" @click="setPerson">
            <div class="text">
              <span class="placeholder" v-if="!showText">请选择{{defaultText}}</span>
              {{showText}}
            </div>
            <i class="anticon anticon-right arrow"></i>
          </div>
          <!-- 验证红圈 -->
          <div class="error_tip" v-if="flow.isTried&&nodeConfig.error">
            <i class="anticon anticon-exclamation-circle"></i>
          </div>
        </div>
      </div>
      <add-node :childNodeP.sync="nodeConfig.childNode"></add-node>
    </div>
    <div class="branch-wrap" v-if="nodeConfig.type===4">
      <div class="branch-box-wrap">
        <div class="branch-box">
          <button class="add-branch" @click="addTerm" v-if="flow.edit">添加条件</button>
          <button class="add-branch" v-else> 条 件 </button>
          <div class="col-box" v-for="(item,index) in nodeConfig.conditionNodes" :key="index">
            <div class="condition-node">
              <div class="condition-node-box">
                <div class="auto-judge" :class="flow.isTried&&item.error?'error active':''">
                  <!-- 左移箭头 -->
                  <div class="sort-left" v-if="index!==0&&flow.edit" @click="arrTransfer(index,-1)"><i class="el-icon-arrow-left"></i></div>
                  <!-- 内容头部 -->
                  <div class="title-wrapper">
                    <input v-if="isInputList[index]" type="text" class="ant-input editable-title-input" @blur="blurEvent(index)" v-focus v-model="item.nodeName">
                    <span v-else class="editable-title" @click="clickEvent(index)">{{item.nodeName}}</span>
                    <span class="priority-title" @click="setPerson(item.priorityLevel)">优先级{{item.priorityLevel}}</span>
                    <i class="anticon anticon-close close" @click="delTerm(index)" v-if="flow.edit"></i>
                  </div>
                  <!-- 右移箭头 -->
                  <div class="sort-right" v-if="index!==nodeConfig.conditionNodes.length-1&&flow.edit" @click="arrTransfer(index)"><i class="el-icon-arrow-right"></i></div>
                  <!-- 内容 -->
                  <div class="content" @click="setPerson(item.priorityLevel)">{{condText(item)}}</div>
                  <!-- 验证红圈 -->
                  <div class="error_tip" v-if="flow.isTried&&item.error">
                    <i class="anticon anticon-exclamation-circle"></i>
                  </div>
                </div>
                <add-node :childNodeP.sync="item.childNode"></add-node>
              </div>
            </div>
            <node-wrap v-if="item.childNode" :nodeConfig.sync="item.childNode"></node-wrap>
            <template v-if="index===0">
              <div class="top-left-cover-line"></div>
              <div class="bottom-left-cover-line"></div>
            </template>
            <template v-if="index===nodeConfig.conditionNodes.length-1">
              <div class="top-right-cover-line"></div>
              <div class="bottom-right-cover-line"></div>
            </template>
          </div>
        </div>
        <add-node :childNodeP.sync="nodeConfig.childNode"></add-node>
      </div>
    </div>
    <node-wrap v-if="nodeConfig.childNode" :nodeConfig.sync="nodeConfig.childNode"></node-wrap>
  </div>
</template>
<script>
import AddNode from './AddNode'
export default {
  name: 'NodeWrap',
  inject: ['flow'],
  props: ['nodeConfig', 'flowPermission'],
  // 注册局部指令
  directives: {
    focus: {
      // 指令的定义
      inserted: function (el) {
        el.focus()
      }
    }
  },
  data () {
    return {
      placeholderList: ['发起人', '审核人', '抄送人'],
      isInputList: [],
      isInput: false
    }
  },
  computed: {
    defaultText () {
      return this.placeholderList[this.nodeConfig.type]
    },
    showText () {
      let str = ''
      if (this.nodeConfig.type == 0) {
        this.flowPermission.forEach(element => {
          if (element.type === 'employee') {
            str += element.employeeName + '、'
          } else {
            str += element.departmentName + '、'
          }
        })
        str = str.slice(0, -1)
      }
      if (this.nodeConfig.type == 1) {
        const { settype } = this.nodeConfig
        switch (settype) {
          case 1:
            this.nodeConfig.nodeUserList.forEach(element => {
              if (element.type === 'employee') {
                str += element.employeeName + '、'
              } else {
                str += element.departmentName + '、'
              }
            })
            str = str.slice(0, -1)
            break
          case 2:
            str += this.nodeConfig.directorLevel == 1 ? '直接主管' : '第' + this.nodeConfig.directorLevel + '级主管'
            break
          case 4:
            if (this.nodeConfig.selectRange === 1) {
              str += '全公司'
            } else {
              this.nodeConfig.nodeUserList.forEach(element => {
                if (element.type === 'employee') {
                  str += element.employeeName + '、'
                } else {
                  str += element.departmentName + '、'
                }
              })
              str = str.slice(0, -1)
            }
            break
          case 5:
            str += '发起人自己'
            break
          case 7:
            str += this.nodeConfig.examineEndDirectorLevel == 1 ? '最高层级主管' : '第' + (this.nodeConfig.examineEndDirectorLevel) + '层级主管'
            break
        }
      }
      if (this.nodeConfig.type == 2) {
        this.nodeConfig.nodeUserList.forEach(element => {
          if (element.type === 'employee') {
            str += element.employeeName + '、'
          } else {
            str += element.departmentName + '、'
          }
        })
        str = str.slice(0, -1)
      }
      if (str === '') {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.nodeConfig.error = true
      } else {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.nodeConfig.error = false
      }
      return str
    },
    bgColor () {
      return ['87, 106, 149', '255, 148, 62', '50, 150, 250'][this.nodeConfig.type]
    }
  },
  methods: {
    // 点击头部文字 修改输入框 ===0 代表是条件的输入  否则是其他人的输入
    clickEvent (index) {
      if (!this.flow.edit) {
        return
      }
      if (index || index === 0) {
        this.$set(this.isInputList, index, true)
      } else {
        this.isInput = true
      }
    },
    // 失去焦点 同上 防止为空 或复制
    blurEvent (index) {
      if (index || index === 0) {
        this.$set(this.isInputList, index, false)
        this.nodeConfig.conditionNodes[index].nodeName =
          this.nodeConfig.conditionNodes[index].nodeName || `条件${index + 1}`
      } else {
        this.isInput = false
        this.nodeConfig.nodeName = this.nodeConfig.nodeName || this.defaultText
      }
    },
    // 删除节点 不含条件
    delNode () {
      this.$emit('update:nodeConfig', this.nodeConfig.childNode)
    },
    // 点击按钮添加条件
    addTerm () {
      const len = this.nodeConfig.conditionNodes.length + 1
      this.nodeConfig.conditionNodes.push({
        nodeName: '条件' + len,
        type: 3,
        priorityLevel: len,
        conditionList: [],
        nodeUserList: [],
        childNode: null
      })
      this.$emit('update:nodeConfig', this.nodeConfig)
    },
    // 删除条件
    delTerm (index) {
      this.nodeConfig.conditionNodes.splice(index, 1)
      this.nodeConfig.conditionNodes.map((item, index) => {
        item.priorityLevel = index + 1
        item.nodeName = `条件${index + 1}`
      })
      this.$emit('update:nodeConfig', this.nodeConfig)
      if (this.nodeConfig.conditionNodes.length === 1) {
        if (this.nodeConfig.childNode) {
          if (this.nodeConfig.conditionNodes[0].childNode) {
            this.reData(this.nodeConfig.conditionNodes[0].childNode, this.nodeConfig.childNode)
          } else {
            this.nodeConfig.conditionNodes[0].childNode = this.nodeConfig.childNode
          }
        }
        this.$emit('update:nodeConfig', this.nodeConfig.conditionNodes[0].childNode)
      }
    },
    reData (data, addData) {
      if (!data.childNode) {
        data.childNode = addData
      } else {
        this.reData(data.childNode, addData)
      }
    },
    // 点击节点 0 发起人 1审批 2抄送 3条件 4路由
    setPerson (priorityLevel) {
      if (!this.flow.edit) {
        return
      }
      const { type } = this.nodeConfig
      if (type === 0) {
        this.flow.promoterDrawer = true
      } else if (type === 1) {
        this.flow.approverConfig = this.nodeConfig
        this.flow.approverDrawer = true
      } else if (type === 2) {
        this.flow.copyerConfig = this.nodeConfig
        this.flow.copyerDrawer = true
      } else {
        this.flow.conditionConfig = this.nodeConfig.conditionNodes[priorityLevel - 1]
        this.flow.conditionNodesLength = this.nodeConfig.conditionNodes.length
        this.flow.conditionDrawer = true
      }
    },
    condText (item) {
      let str = ''
      item.conditionList.forEach(x => {
        if (x.type === 1) {
          str += `${x.showName}:`
          item.nodeUserList.forEach(element => {
            if (element.type === 'employee') {
              str += element.employeeName + '、'
            } else {
              str += element.departmentName + '、'
            }
          })
          str = str.slice(0, -1)
          str += ';'
        } else {
          if (x.optType !== 6) {
            str += `${x.showName}`
            str += `${['', '<', '>', '≤', '=', '≥'][x.optType]}${x.zdy1};`
          } else {
            str += `${x.zdy1}${['', '<', '≤'][x.opt1]}${x.showName}${['', '<', '≤'][x.opt2]}${x.zdy2};`
          }
        }
      })
      if (item.conditionList.length === 0) {
        str = '其他条件进入此流程'
      }
      return str
    },
    // 条件左右移动
    arrTransfer (index, type = 1) {
      // 向左-1,向右1
      this.nodeConfig.conditionNodes[index] =
        this.nodeConfig.conditionNodes.splice(
          index + type,
          1,
          this.nodeConfig.conditionNodes[index]
        )[0]
      this.nodeConfig.conditionNodes.map((item, index) => {
        item.priorityLevel = index + 1
      })
      this.$emit('update:nodeConfig', this.nodeConfig)
    }
  },
  components: { AddNode }
}
</script>
<style>
.error_tip {
  position: absolute;
  top: 0px;
  right: 0px;
  transform: translate(150%, 0px);
  font-size: 24px;
}

.promoter_person .el-dialog__body {
  padding: 10px 20px 14px 20px;
}

.selected_list {
  margin-bottom: 20px;
  line-height: 30px;
}

.selected_list span {
  margin-right: 10px;
  padding: 3px 6px 3px 9px;
  line-height: 12px;
  white-space: nowrap;
  border-radius: 2px;
  border: 1px solid rgba(220, 220, 220, 1);
}

.selected_list img {
  margin-left: 5px;
  width: 7px;
  height: 7px;
  cursor: pointer;
}
</style>
