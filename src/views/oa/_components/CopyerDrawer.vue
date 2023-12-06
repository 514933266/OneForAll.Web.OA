<template>
  <!-- 超送人抽屉 -->
  <el-drawer :append-to-body="true" title="抄送人设置" :visible.sync="flow.copyerDrawer" direction="rtl" class="set_copyer" size="550px" @open="open">
    <div class="demo-drawer__content">
      <div class="copyer_content drawer_content">
        <el-button type="primary" @click="addCopyer">添加成员</el-button>
        <div class="selected_list">
          <span v-for="(item,index) in copyerConfig.nodeUserList" :key="index">
            {{item.type === 'employee'?item.employeeName:item.departmentName}}
            <i class="el-icon-close" @click="del(index)"></i>
          </span>
          <a v-if="copyerConfig.nodeUserList&&copyerConfig.nodeUserList.length!=0" @click="copyerConfig.nodeUserList=[]">清除</a>
        </div>
        <el-checkbox-group v-model="copyerConfig.ccSelfSelectFlag">
          <el-checkbox :true-label="1" :false-label="0">允许发起人自选抄送人</el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="demo-drawer__footer clear">
        <el-button type="primary" @click="saveCopyer">确 定</el-button>
        <el-button @click="closeDrawer">取 消</el-button>
      </div>
      <employees-dialog ref="employees" @change="sureCopyer" :resList="copyerConfig.nodeUserList" />
    </div>
  </el-drawer>
</template>
<script>
import EmployeesDialog from './EmployeesDialog.vue'
export default {
  name: 'CopyerDrawer',
  components: { EmployeesDialog },
  inject: ['flow'],
  data () {
    return {
      copyerConfig: {
        nodeUserList: []
      }
    }
  },
  methods: {
    // 打开时赋值
    open () {
      this.copyerConfig = JSON.parse(JSON.stringify(this.flow.copyerConfig))
    },
    // 打开选择人员
    addCopyer () {
      this.$refs.employees.visibleDialog = true
    },
    // 选择人员确定后赋值
    sureCopyer (data) {
      this.copyerConfig.nodeUserList = data
    },
    // 删除单个人员
    del (index) {
      this.copyerConfig.nodeUserList.splice(index, 1)
    },
    // 点击确定
    saveCopyer () {
      this.flow.copyerConfig.nodeUserList = this.copyerConfig.nodeUserList
      this.flow.copyerConfig.ccSelfSelectFlag = this.copyerConfig.ccSelfSelectFlag
      this.closeDrawer()
    },
    closeDrawer () {
      this.flow.copyerDrawer = false
    }
  }
}
</script>

<style lang="scss">
.set_copyer {
  .el-drawer__header button.el-drawer__close-btn {
    display: none;
  }
  .el-drawer__header {
    margin-bottom: 0;
    padding: 14px 0 14px 20px;
    color: #323232;
    font-size: 16px;
  }
  .demo-drawer__content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .drawer_content {
    flex: 1;
  }
  .demo-drawer__content > div {
    border-top: 1px solid #f2f2f2;
  }

  .el-button {
    min-width: 79px;
    padding: 8px 12px;
    font-size: 12px;
    border-radius: 2px;
    background: #46a6fe;
  }

  .el-button.el-button--default {
    color: #323232;
    background: #f2f2f2;
  }

  .demo-drawer__footer {
    padding: 10px 30px;
    border-top: 1px solid #f2f2f2;
  }

  .demo-drawer__footer .el-button {
    float: right;
    margin-right: 10px;
  }
  .copyer_content {
    padding: 20px 20px 0;

    .el-button {
      margin-bottom: 20px;
    }

    .el-checkbox {
      margin-bottom: 20px;
    }
  }
}
.selected_list {
  > span {
    font-size: 12px;
    i {
      cursor: pointer;
    }
  }
  > a {
    cursor: pointer;
    color: #409eff;
    font-size: 14px;
  }
}
</style>
