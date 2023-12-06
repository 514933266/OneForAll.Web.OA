<template>
  <el-drawer :append-to-body="true" title="审核人设置" :visible.sync="flow.approverDrawer" direction="rtl" class="set_promoter" size="550px" @open="open">
    <div class="demo-drawer__content">

      <div class="drawer_content">
        <div class="approver_content">
          <el-radio-group v-model="approverConfig.settype" class="clear" @change="changeType">
            <el-radio :label="1">指定成员</el-radio>
            <el-radio :label="2">主管</el-radio>
            <el-radio :label="4">发起人自选</el-radio>
            <el-radio :label="5">发起人自己</el-radio>
            <el-radio :label="7">连续多级主管</el-radio>
          </el-radio-group>
          <!-- 指定成员 -->
          <el-button type="primary" @click="addApprover" v-if="approverConfig.settype==1">添加/修改成员</el-button>
          <div class="selected_list" v-if="approverConfig.settype==1">
            <span v-for="(item,index) in approverConfig.nodeUserList" :key="index">
              {{item.type === 'employee'?item.employeeName:item.departmentName}}
              <i class="el-icon-close" @click="del(index)"></i>
            </span>
            <a v-if="approverConfig.nodeUserList.length!=0" @click="approverConfig.nodeUserList=[]">清除</a>
          </div>
        </div>
        <!-- 主管 -->
        <div class="approver_manager" v-if="approverConfig.settype==2">
          <p>
            <span>发起人的：</span>
            <el-select v-model="approverConfig.directorLevel" placeholder="请选择" size="small">
              <el-option v-for="item in directorMaxLevel" :key="item" :label="item==1?'直接主管':'第'+item+'级主管'" :value="item">
              </el-option>
            </el-select>
          </p>
          <p class="tip">找不到主管时，由上级主管代审批</p>
        </div>
        <div class="approver_self" v-if="approverConfig.settype==5">
          <p>该审批节点设置“发起人自己”后，审核人默认为发起人</p>
        </div>
        <div class="approver_self_select" v-show="approverConfig.settype==4">
          <el-radio-group v-model="approverConfig.selectMode" style="width: 100%;">
            <el-radio :label="1">选一个人</el-radio>
            <el-radio :label="2">选多个人</el-radio>
          </el-radio-group>
          <h3>选择范围</h3>
          <el-radio-group v-model="approverConfig.selectRange" style="width: 100%;" @change="changeRange">
            <el-radio :label="1">全公司</el-radio>
            <el-radio :label="2">指定成员</el-radio>
            <el-radio :label="3">指定角色</el-radio>
          </el-radio-group>
          <el-button type="primary" @click="addApprover" v-if="approverConfig.selectRange==2">添加/修改成员</el-button>
          <el-button type="primary" @click="addApprover" v-if="approverConfig.selectRange==3">添加/修改角色</el-button>
          <div class="selected_list" v-if="approverConfig.selectRange==2||approverConfig.selectRange==3">
            <span v-for="(item,index) in approverConfig.nodeUserList" :key="index">
              {{item.type === 'employee'?item.employeeName:item.departmentName}}
              <i class="el-icon-close" @click="del(index)"></i>
            </span>
            <a v-if="approverConfig.nodeUserList.length!=0&&approverConfig.selectRange!=1" @click="approverConfig.nodeUserList=[]">清除</a>
          </div>
        </div>
        <div class="approver_manager" v-if="approverConfig.settype==7">
          <p>审批终点</p>
          <p style="padding-bottom:20px">
            <span>发起人的：</span>
            <el-select v-model="approverConfig.examineEndDirectorLevel" placeholder="请选择" size="small">
              <el-option v-for="item in directorMaxLevel" :key="item" :label="item==1?'最高层级主管':'第'+item+'层级主管'" :value="item">
              </el-option>
            </el-select>
          </p>
        </div>
        <div class="approver_some" v-if="(approverConfig.settype==1&&approverConfig.nodeUserList.length>1)||approverConfig.settype==2||(approverConfig.settype==4&&approverConfig.selectMode==2)">
          <p>多人审批时采用的审批方式</p>
          <el-radio-group v-model="approverConfig.examineMode" class="clear">
            <el-radio :label="1">依次审批</el-radio>
            <br />
            <el-radio :label="2" v-if="approverConfig.settype!=2">会签(须所有审核人同意)</el-radio>
          </el-radio-group>
        </div>
        <div class="approver_some" v-if="approverConfig.settype==2||approverConfig.settype==7">
          <p>审核人为空时</p>
          <el-radio-group v-model="approverConfig.noHanderAction" class="clear">
            <el-radio :label="1">自动审批通过/不允许发起</el-radio>
            <br />
            <el-radio :label="2">转交给审核管理员</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div class="demo-drawer__footer clear">
        <el-button type="primary" @click="saveApprover">确 定</el-button>
        <el-button @click="closeDrawer">取 消</el-button>
      </div>
      <employees-dialog ref="employees" @change="sureApprover" :resList="approverConfig.nodeUserList" />
    </div>
  </el-drawer>
</template>
<script>
import EmployeesDialog from './EmployeesDialog.vue'
export default {
  name: 'ApproverDrawer',
  components: { EmployeesDialog },
  inject: ['flow'],
  data () {
    return {
      directorMaxLevel: '',
      approverConfig: {}
    }
  },
  methods: {
    // 打开时赋值
    open () {
      this.directorMaxLevel = this.flow.directorMaxLevel
      this.approverConfig = JSON.parse(JSON.stringify(this.flow.approverConfig))
    },
    // 切换模式
    changeRange () {
      this.approverConfig.nodeUserList = []
    },
    // 切换模式
    changeType (val) {
      this.approverConfig.nodeUserList = []
      this.approverConfig.examineMode = 1
      this.approverConfig.noHanderAction = 2
      if (val == 2) {
        this.approverConfig.directorLevel = 1
      } else if (val == 4) {
        this.approverConfig.selectMode = 1
        this.approverConfig.selectRange = 1
      } else if (val == 7) {
        this.approverConfig.examineEndDirectorLevel = 1
      }
    },
    // 选择人员
    addApprover () {
      this.$refs.employees.visibleDialog = true
    },
    // 选择人员确定后赋值
    sureApprover (data) {
      this.approverConfig.nodeUserList = data
    },
    // 删除单个人员
    del (index) {
      this.approverConfig.nodeUserList.splice(index, 1)
    },
    saveApprover () {
      const { settype } = this.approverConfig
      let arr = null
      switch (settype) {
        case 1:
          arr = ['examineMode', 'nodeUserList', 'settype']
          break
        case 2:
          arr = ['directorLevel', 'examineMode', 'noHanderAction', 'settype']
          break
        case 4:
          arr = ['selectMode', 'selectRange', 'nodeUserList', 'settype', 'examineMode']
          break
        case 5:
          arr = ['settype',]
          break
        case 7:
          arr = ['examineEndDirectorLevel', 'noHanderAction', 'settype']
          break
      }
      arr.forEach(item => {
        this.flow.approverConfig[item] = this.approverConfig[item]
      })
      this.closeDrawer()
    },
    closeDrawer () {
      this.flow.approverDrawer = false
    }
  }
}
</script>
<style lang="scss">
.set_promoter {
  font-size: 14px;
  .approver_content {
    padding-bottom: 10px;
    border-bottom: 1px solid #f2f2f2;
  }

  .approver_self_select .el-button,
  .approver_content .el-button {
    margin-bottom: 20px;
  }

  .approver_content .el-radio,
  .approver_some .el-radio,
  .approver_self_select .el-radio {
    width: 27%;
    margin-bottom: 20px;
  }

  .approver_manager p {
    line-height: 32px;
  }

  .approver_manager select {
    width: 420px;
    height: 32px;
    background: rgba(255, 255, 255, 1);
    border-radius: 4px;
    border: 1px solid rgba(217, 217, 217, 1);
  }

  .approver_manager p.tip {
    margin: 10px 0 22px 0;
    font-size: 12px;
    line-height: 16px;
    color: #f8642d;
  }

  .approver_self {
    padding: 28px 20px;
  }

  .approver_self_select,
  .approver_manager,
  .approver_content,
  .approver_some {
    padding: 20px 20px 0;
  }

  .approver_manager p:first-of-type,
  .approver_some p {
    line-height: 19px;
    font-size: 14px;
    margin-bottom: 14px;
  }

  .approver_self_select h3 {
    margin: 5px 0 20px;
    font-size: 14px;
    font-weight: bold;
    line-height: 19px;
  }
}
</style>
