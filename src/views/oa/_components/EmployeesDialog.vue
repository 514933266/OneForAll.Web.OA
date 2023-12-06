<template>
  <el-dialog title="选择成员" :visible.sync="visibleDialog" width="600px" append-to-body custom-class="ofa-dialog promoter_person" @open="open">
    <div class="person_body">
      <div class="person_tree">
        <el-input placeholder="搜索成员" prefix-icon="el-icon-search" v-model="searchVal" size="small" />
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="组织架构" name="1"></el-tab-pane>
          <el-tab-pane label="角色列表" name="2" v-if="isShow"></el-tab-pane>
        </el-tabs>
        <div class="select-box">
          <div v-for="item,index in list" :key="index">
            <!-- 角色 -->
            <div class="check_box" v-if="item.type === 'role'">
              <el-checkbox v-model="item.check" />
              <div>
                <i class="el-icon-s-custom"></i>
                {{item.roleName}}
              </div>
            </div>
            <!-- 部门 -->
            <div class="check_box" v-if="item.type === 'department'">
              <el-checkbox v-model="item.check" />
              <div style="flex:1">
                <i class="el-icon-s-cooperation"></i>
                {{item.departmentName}}
              </div>
              <i class="el-icon-caret-bottom ">下级</i>
            </div>
            <!-- 人员 -->
            <div class="check_box" v-if="item.type === 'employee'">
              <el-checkbox v-model="item.check" />
              <div>
                <i class="el-icon-user-solid"></i>
                {{item.employeeName}}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="select-result">
        <div class="result-title">
          <div>已选（{{total}}）</div>
          <div class="clean" @click="clean">清空</div>
        </div>
        <div>
          <div v-for="el,index in selectArr" :key="index">
            <div v-if="el.type === 'role'" class="check_box_el">
              <i class="el-icon-s-custom"></i>
              <span>{{el.roleName}}</span>
              <i class="el-icon-error" @click="el.check=false"></i>
            </div>
            <div v-if="el.type === 'department'" class="check_box_el">
              <i class="el-icon-s-cooperation"></i>
              <span>{{el.departmentName}}</span>
              <i class="el-icon-error" @click="el.check=false"></i>
            </div>
            <div v-if="el.type === 'employee'" class="check_box_el">
              <i class="el-icon-user-solid"></i>
              <span>{{el.employeeName}}</span>
              <i class="el-icon-error" @click="el.check=false"></i>
            </div>
          </div>
        </div>
      </div>

    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visibleDialog=false">取 消</el-button>
      <el-button type="primary" @click="saveDialog">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'EmployeesDialog',
  props: ['isShow', 'resList'],
  data () {
    return {
      visibleDialog: false,
      activeName: '1',
      searchVal: '',
      list: []
    }
  },
  computed: {
    total () {
      return this.selectArr.length
    },
    selectArr () {
      return this.list.filter(x => x.check)
    }
  },
  methods: {
    open () {
      this.list = [
        { type: 'department', departmentKey: 'RLXZB_V2', departmentName: '人力行政部', id: '150', parentId: '0', departmentNames: '人力行政部', check: false },
        { type: 'department', departmentKey: 'ZNBN', departmentName: '法务部', id: '324', parentId: '0', departmentNames: '法务部', check: false },
        { type: 'employee', id: '53128111', employeeName: '亚nan', isLeave: '0', open: 'false', check: false }
      ]
      this.resList.forEach(x => {
        this.list.forEach(y => {
          if (y.id == x.id) {
            y.check = true
          }
        })
      })
    },
    clean () {
      this.list.forEach(element => {
        element.check = false
      })
    },
    handleClick () {
      this.searchVal = ''
      if (this.activeName == 1) {
        this.list = [
          { type: 'department', departmentKey: 'RLXZB_V2', departmentName: '人力行政部', id: '150', parentId: '0', departmentNames: '人力行政部', check: false },
          { type: 'department', departmentKey: 'ZNBN', departmentName: '法务部', id: '324', parentId: '0', departmentNames: '法务部', check: false },
          { type: 'employee', id: '53128111', employeeName: '亚nan', isLeave: '0', open: 'false', check: false }
        ]
      } else {
        this.list = [
          { type: 'role', code: 'SHGLY', roleId: '1', scope: '1', roleName: '审核管理员', description: '初始化内置审批角色', status: '1', check: false },
          { type: 'role', code: '', roleId: '2', scope: '1', roleName: '招商事业部', description: '', status: '1', check: false },
          { type: 'role', code: '', roleId: '3', scope: '1', roleName: '互联网部门', description: '', status: '1', check: false },
          { type: 'role', code: '', roleId: '4', scope: '1', roleName: '销售部', description: '', status: '1', check: false },
          { type: 'role', code: '', roleId: '5', scope: '1', roleName: '战区一', description: '', status: '1', check: false },
          { type: 'role', code: '', roleId: '6', scope: '1', roleName: '战区二', description: '', status: '1', check: false },
          { type: 'role', code: '', roleId: '7', scope: '1', roleName: 'JAVA开发', description: '', status: '1', check: false },
          { type: 'role', code: '', roleId: '8', scope: '1', roleName: '测试审批角色', description: '', status: '1', check: false }
        ]
      }
    },
    saveDialog () {
      this.visibleDialog = false
      this.$emit('change', JSON.parse(JSON.stringify(this.selectArr)))
    }
  }
}
</script>
<style lang="scss" >
.promoter_person {
  .el-dialog__header {
    padding: 0 0 0 20px;
    line-height: 50px;
    height: 50px;
    background: #fff;
    border-bottom: 1px solid #f2f2f2;
  }
  .el-dialog__header .el-dialog__title {
    font-size: 16px;
    line-height: 50px;
    color: #333333;
  }
  .el-dialog__footer {
    border-top: 1px solid #f2f2f2;
    padding-bottom: 10px;
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
}
</style>

<style lang="scss" scoped>
.person_body {
  display: flex;
  border: 1px solid #f5f5f5;
  height: 500px;
}
.tree_nav span {
  display: inline-block;
  padding-right: 10px;
  margin-right: 5px;
  max-width: 6em;
  color: #38adff;
  font-size: 12px;
  cursor: pointer;
  // background: url(~@/assets/images/jiaojiao.png) no-repeat right center;
}
.tree_nav span:last-of-type {
  background: none;
}
.person_tree {
  box-sizing: border-box;
  padding: 10px 12px 0 8px;
  width: 280px;
  height: 100%;
  border-right: 1px solid #f5f5f5;
}
.person_tree input {
  padding-left: 22px;
  width: 210px;
  height: 30px;
  font-size: 12px;
  border-radius: 2px;
  border: 1px solid #d5dadf;
  // background: url(~@/assets/images/list_search.png) no-repeat 10px center;
  background-size: 14px 14px;
  margin-bottom: 14px;
}

.select-box {
  height: 420px;
  overflow-y: auto;
  .check_box {
    padding: 5px 0;
    display: flex;
    align-items: center;
    .el-checkbox {
      margin-right: 5px;
    }
  }
}
.select-result {
  width: 276px;
  font-size: 14px;
  height: 460px;
  overflow-y: auto;
  .check_box_el {
    display: flex;
    align-items: center;
    padding: 8px;
    span {
      flex: 1;
    }
    i {
      margin-right: 5px;
    }
    .el-icon-error {
      cursor: pointer;
    }
  }
}

.result-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 19px;
  padding-right: 20px;
  line-height: 37px;
  border-bottom: 1px solid #f2f2f2;
  .clean {
    cursor: pointer;
    color: #46a6fe;
  }
}
</style>>
