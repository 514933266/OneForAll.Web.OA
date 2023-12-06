<template>
  <!-- 发起人抽屉 -->
  <el-drawer :append-to-body="true" title="发起人" :visible.sync="flow.promoterDrawer" direction="rtl" class="set_promoter" size="550px" @open="open">
    <div class="demo-drawer__content">
      <div class="promoter_content drawer_content">
        <div class="drawer_content-text">{{permissionText()}}</div>
        <el-button type="primary" @click="addPromoter">添加/修改发起人</el-button>
      </div>
      <div class="demo-drawer__footer clear">
        <el-button type="primary" @click="savePromoter">确 定</el-button>
        <el-button @click="closeDrawer">取 消</el-button>
      </div>
      <employees-dialog ref="employees" @change="surePromoter" :resList="flowPermission" />
    </div>
  </el-drawer>
</template>
<script>
import EmployeesDialog from './EmployeesDialog.vue'
export default {
  name: 'PromoterDrawer',
  components: { EmployeesDialog },
  inject: ['flow'],
  data () {
    return {
      flowPermission: [],
      promoterVisible: false,
      checkedList: []
    }
  },
  methods: {
    open () {
      this.flowPermission = JSON.parse(JSON.stringify(this.flow.flowPermission))
    },
    permissionText () {
      let str = ''
      this.flowPermission.forEach(element => {
        if (element.type === 'employee') {
          str += element.employeeName + '、'
        } else {
          str += element.departmentName + '、'
        }
      })
      str = str.slice(0, -1)
      return str.length > 0 ? str : '所有人'
    },
    addPromoter () {
      this.$refs.employees.visibleDialog = true
    },
    surePromoter (data) {
      this.flowPermission = data
    },
    // 确定赋值
    savePromoter () {
      this.flow.flowPermission = this.flowPermission
      this.closeDrawer()
    },
    // 关闭
    closeDrawer () {
      this.flow.promoterDrawer = false
    }
  }
}
</script>
<style lang="scss">
.set_promoter {
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

  .promoter_content {
    padding: 0 20px;

    .el-button {
      margin-bottom: 20px;
    }

    .drawer_content-text {
      padding: 18px 0;
      font-size: 14px;
      line-height: 20px;
      color: #000000;
    }
  }
}
</style>
