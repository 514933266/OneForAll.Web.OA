<template>
  <el-drawer :append-to-body="true" title="条件设置" :visible.sync="flow.conditionDrawer" direction="rtl" class="set_promoter" size="550px" @open="open">

    <el-select v-model="conditionConfig.priorityLevel" placeholder="请选择" size="small" class="priority_level">
      <el-option v-for="item in flow.conditionNodesLength" :key="item" :label="'优先级'+item" :value="item">
      </el-option>
    </el-select>

    <div class="demo-drawer__content">
      <div class="condition_content drawer_content">
        <div class="tip">当审批单同时满足以下条件时进入此流程</div>
        <div v-for="(item,index) in conditionConfig.conditionList" :key="index">
          <span class="ellipsis">{{item.type==1?'发起人':item.showName}}：</span>

          <div v-if="item.type==1" class="selected_list pel-box">
            <div class="pel-list">
              <div @click="addApprover" class="pel-add">添加</div>
              <div>
                <span v-for="(el,index) in conditionConfig.nodeUserList" :key="index">
                  {{el.type === 'employee'?el.employeeName:el.departmentName}}
                  <i class="el-icon-close" @click="del(index)"></i>
                </span>
              </div>
              <div v-if="conditionConfig.nodeUserList.length!=0" @click="conditionConfig.nodeUserList=[]" class="delt">清除</div>
            </div>
            <div class="del" @click="conditionConfig.conditionList.splice(index,1)">删除</div>
          </div>

          <div v-else>

            <div style="display:flex;align-items:center;margin:10px 0">
              <div style="flex:1">
                <el-select v-model="item.optType" size="small" style="width: 200px;">
                  <el-option v-for="item in 6" :key="item" :label="['小于','大于','小于等于','等于','大于等于','介于两个数之间'][item-1]" :value="item"></el-option>
                </el-select>
                <el-input v-if="item.optType!=6" v-model="item.zdy1" size="small" style="width: 100px;"></el-input>
              </div>
              <div class="del" @click="conditionConfig.conditionList.splice(index,1)">删除</div>
            </div>

            <p v-if="item.optType==6">
              <el-input v-model="item.zdy1" size="small" style="width: 100px;"></el-input>
              <el-select v-model="item.opt1" size="small" style="width: 100px;">
                <el-option v-for="item in 2" :key="item" :label="['<','≤'][item-1]" :value="item"></el-option>
              </el-select>
              <span class="ellipsis" style="display:inline-block;width:60px;vertical-align: text-bottom;margin:0 10px">{{item.showName}}</span>
              <el-select v-model="item.opt2" size="small" style="width: 100px;">
                <el-option v-for="item in 2" :key="item" :label="['<','≤'][item-1]" :value="item"></el-option>
              </el-select>
              <el-input v-model="item.zdy2" size="small" style="width: 100px;"></el-input>
            </p>
          </div>

        </div>

        <el-button type="primary" @click="addCondition">添加条件</el-button>
        <el-dialog title="选择条件" :visible.sync="conditionVisible" width="480px" append-to-body class="condition_list set_promoter" @open="openConditionVisible">
          <p>请选择用来区分审批流程的条件字段</p>
          <el-checkbox-group v-model="checkList">
            <el-checkbox label="1">发起人</el-checkbox>
            <el-checkbox label="2">预计费用</el-checkbox>
          </el-checkbox-group>
          <span slot="footer" class="dialog-footer">
            <el-button @click="conditionVisible = false">取 消</el-button>
            <el-button type="primary" @click="sureCondition">确 定</el-button>
          </span>
        </el-dialog>
      </div>
      <div class="demo-drawer__footer clear">
        <el-button type="primary" @click="saveCondition">确 定</el-button>
        <el-button @click="closeDrawer">取 消</el-button>
      </div>
      <employees-dialog ref="employees" @change="sureApprover" :resList="conditionConfig.nodeUserList" />
    </div>
  </el-drawer>
</template>

<script>
import EmployeesDialog from './EmployeesDialog.vue'
export default {
  name: 'ConditionDrawer',
  components: { EmployeesDialog },
  inject: ['flow'],
  data () {
    return {
      conditionVisible: false,
      conditionConfig: {},
      checkList: [],
      conditionList: [],
    }
  },

  methods: {
    // 打开时赋值
    open () {
      this.conditionConfig = JSON.parse(JSON.stringify(this.flow.conditionConfig))
    },
    openConditionVisible () {
      this.checkList = []
      this.conditionConfig.conditionList.forEach(element => {
        this.checkList.push(element.type + '')
      });
    },
    // 选择人员
    addApprover () {
      this.$refs.employees.visibleDialog = true
    },
    // 选择人员确定后赋值
    sureApprover (data) {
      this.conditionConfig.nodeUserList = data
    },
    del (index) {
      this.conditionConfig.nodeUserList.splice(index, 1)
    },
    addCondition () {
      this.conditionVisible = true
    },
    sureCondition () {
      const list = this.conditionConfig.conditionList.map((item, index) => { return item.type })
      this.checkList.forEach((item, key) => {
        const flag = list.includes(item * 1)
        if (!flag) {
          if (item === '1') {
            this.conditionConfig.conditionList.push({
              type: 1,
              showName: '发起人'
            })
          } else {
            this.conditionConfig.conditionList.push({
              type: 2,
              showName: '预计费用',
              optType: 1,
              zdy1: '10',
              zdy2: '',
              opt1: '',
              opt2: ''
            })
          }
        }
      })
      this.conditionVisible = false
    },
    saveCondition () {
      this.flow.conditionConfig.priorityLevel = this.conditionConfig.priorityLevel
      this.conditionConfig.conditionList.forEach(item => {
        if (item.type === 1) {
          this.flow.conditionConfig.nodeUserList = this.conditionConfig.nodeUserList
        }
        this.flow.conditionConfig.conditionList = JSON.parse(JSON.stringify(this.conditionConfig.conditionList))
      })
      if (this.conditionConfig.conditionList.length === 0) {
        this.flow.conditionConfig.nodeUserList = []
        this.flow.conditionConfig.conditionList = []
      }
      this.closeDrawer()
    },
    closeDrawer () {
      this.flow.conditionDrawer = false
    }
  }
}
</script>

<style lang="scss">
.set_promoter {
  .el-drawer__body {
    .priority_level {
      position: absolute;
      top: 6px;
      right: 20px;
      width: 100px;
    }
  }
  .condition_content {
    padding: 20px 20px 0;
    .tip {
      margin: 20px 0;
      width: 510px;
      text-indent: 17px;
      line-height: 45px;
      background: rgba(241, 249, 255, 1);
      border: 1px solid rgba(64, 163, 247, 1);
      color: #46a6fe;
      font-size: 14px;
    }
  }
}
.condition_list {
  .el-dialog__body {
    padding: 16px 26px;
  }
  .el-dialog__header {
    border-bottom: 1px solid #f2f2f2;
  }
  .el-dialog__footer {
    padding: 10px 20px 10px;
    border-top: 1px solid #f2f2f2;
  }
}
.pel-box {
  margin: 10px 0;
  display: flex;
  .pel-list {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    .pel-add {
      margin-right: 10px;
      cursor: pointer;
      color: #409eff;
    }
    span {
      font-size: 12px;
    }
    .el-icon-close {
      cursor: pointer;
    }
  }
  .delt {
    cursor: pointer;
    color: #409eff;
  }
}
.del {
  width: 60px;
  text-align: right;
  cursor: pointer;
  color: #409eff;
}
</style>
