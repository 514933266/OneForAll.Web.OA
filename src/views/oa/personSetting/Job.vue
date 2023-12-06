<template>
  <el-container v-loading="loading" class="ofa-container column job-box">
    <!-- 头部条 -->
    <div class="job-title">
      <div class="job-title-text">职位管理<span class="sub-title" style="margin-left: 10px;">共有<label
            class="ofa-text-primary"> {{list.length}} </label>条数据</span></div>
      <div>
        <el-button @click="toLevelPage" type="text">
          <i class="el-icon-setting"></i>
          职级管理
        </el-button>
        <span class="right-line">|</span>
        <el-button @click="toDutyPage" type="text">
          <i class="el-icon-bell"></i>
          职务管理
        </el-button>
      </div>
    </div>
    <!-- 内容区域 -->
    <div class="job-content">
      <div class="job-left-tab">
        <div class="tab-title">
          <span>职位类别</span>
          <el-dropdown @command="changeType">
            <div>
              <span>切换</span>
              <i class="el-icon-caret-bottom"></i>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="0">全部</el-dropdown-item>
              <el-dropdown-item v-for="item in types" :key="item.Id" :command="item.Id">{{item.Name}}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="tab-all">
          <el-button @click="changeType('0')" type="text">全部</el-button>
          <i class="ofa-text-title hover el-icon-plus" @click="showAddTypeDialog"></i>
        </div>
        <el-tree default-expand-all :highlight-current="true" ref="typeTree" :data="types" props="{ id: 'Id' }"
          @node-click="showUpdateTypeDialog" node-key="Id" class="ofa-tree">
          <span slot-scope="{ data }" class="tree-node">
            <span>{{ data.Name }}</span>
          </span>
        </el-tree>
      </div>
      <div class="job-right-table">
        <div class="search-bar">
          <div>
            <el-input v-model="searchOption.name" placeholder="搜索职位名称" suffix-icon="el-icon-search" style="width:200px"
              class="mr10" size="small"></el-input>
            <team-cascader v-model="searchOption.teamId" placeholder="请选择所属部门" size="small" style="margin-right: 10px;">
            </team-cascader>
            <el-select clearable v-model="searchOption.isEnabled" placeholder="是否启用" class="mr10" size="small">
              <el-option label="已启用" :value="true"></el-option>
              <el-option label="未启用" :value="false"></el-option>
            </el-select>
            <el-button type="text" @click="filter" size="small">筛选</el-button>
          </div>
          <div>
            <el-button type="primary" @click="showAddDrawer" size="small">新增职位</el-button>
          </div>
        </div>
        <el-table ref="table" :data="filterList" tooltip-effect="dark" class="ofa-table" height="600">
          <el-table-column label="职位名称" prop="Name">
          </el-table-column>
          <el-table-column prop="TeamName" label="部门">
          </el-table-column>
          <el-table-column prop="TypeName" label="职位类别">
          </el-table-column>
          <el-table-column prop="LevelName" label="对应职级">
          </el-table-column>
          <el-table-column prop="DutyName" label="对应职务">
          </el-table-column>
          <el-table-column prop="IsEnabled" label="使用状态">
            <template slot-scope="scope"><label
                :class="scope.row.IsEnabled ? 'ofa-text-success' : 'ofa-text-danger'">{{ scope.row.IsEnabled ? '已启用' : '停用' }}</label></template>
          </el-table-column>
          <el-table-column label="操作" width="140">
            <template slot-scope="scope">
              <el-button @click="showUpdateDrawer(scope.row)" type="text">编辑</el-button>
              <el-button @click="stop(scope.row)" type="text"
                :class="['hover', scope.row.IsEnabled ? 'ofa-text-danger' : 'ofa-text-success']">
                {{ scope.row.IsEnabled ? '停用' : '启用' }}</el-button>
              <el-button @click="del(scope.row)" type="text" class="ofa-text-danger hover">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-drawer :visible.sync="drawerVisiable" direction="rtl" class="ofa-drawer" size="380px">
          <div slot="title">
            <span class="title">{{isAdd ? '添加' : '编辑'}}职位</span><label class="title-tips">Job</label>
          </div>
          <el-form ref="form" :model="entity" label-width="120px" :rules="validationRule">
            <el-form-item label="职位名称" prop="Name">
              <el-input v-model="entity.Name" size="small" placeholder="职位名称"></el-input>
            </el-form-item>
            <el-form-item label="部门" prop="TeamId">
              <team-cascader showRoot v-model="entity.TeamId" placeholder="请选择所属部门" size="small" style="margin-right: 10px;">
              </team-cascader>
            </el-form-item>
            <el-form-item label="职位类别" prop="TypeId">
              <el-select clearable v-model="entity.TypeId" placeholder="职位类别" class="mr10" size="small">
                <el-option label="无" :value="$store.state.guid"></el-option>
                <el-option v-for="item in types" :key="item.Id" :label="item.Name" :value="item.Id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="对应职级" prop="LevelId">
              <el-select clearable v-model="entity.LevelId" placeholder="对应职级" class="mr10" size="small">
                <el-option label="无" :value="$store.state.guid"></el-option>
                <el-option v-for="item in levels" :key="item.Id" :label="item.Name" :value="item.Id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="对应职务" prop="DutyId">
              <el-select clearable v-model="entity.DutyId" placeholder="对应职务" class="mr10" size="small">
                <el-option label="无" :value="$store.state.guid"></el-option>
                <el-option v-for="item in dutys" :key="item.Id" :label="item.Name" :value="item.Id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="启用" prop="IsEnabled">
              <el-checkbox v-model="entity.IsEnabled" size="small"></el-checkbox>
            </el-form-item>
          </el-form>
          <div class="footer">
            <el-button type="primary" @click="submit">
              <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;保存
            </el-button>
            <el-button type="warning" @click="drawerVisiable = false">
              取消
            </el-button>
          </div>
        </el-drawer>
      </div>
    </div>
    <!-- 弹窗添加类别 -->
    <el-dialog :title="isAddType ? '添加类别' : '修改类别'" :visible.sync="typeDialogVisible" width="30%"
      custom-class="ofa-dialog">
      <el-form :model="typeEntity" :rules="jobTypeValidationRule" ref="typeForm" label-width="120px">
        <el-form-item prop="Name" label="类别名称:">
          <el-input v-model.trim="typeEntity.Name" size="small" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item prop="Remark" label="备注:">
          <el-input v-model="typeEntity.Remark" :rows="4" type="textarea" size="small" placeholder="请输入备注内容"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="typeDialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="submitType" size="small">确 定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
import API from '../../../apis/oa-api'
import {
  PERSON_SETTING_JOB,
  PERSON_SETTING_JOB_DUTY,
  PERSON_SETTING_JOB_LEVEL
} from '../../../router/oa-router'
import TeamCascader from '../_components/TeamCascader'

export default {
  name: PERSON_SETTING_JOB.name,
  data() {
    return {
      loading: false, // 加载中
      isAdd: false, // 是否添加
      isAddType: false, // 是否添加类型
      drawerVisiable: false, // 显示抽屉
      typeDialogVisible: false, // 显示添加类型弹窗
      types: [], // 岗位类型
      levels: [], // 职级
      dutys: [], // 职务
      list: [], // 列表
      filterList: [], // 过滤后的列表
      entity: {}, // 岗位实体
      typeEntity: {}, // 类型
      searchOption: {
        key: '', // 搜索条件（关键字）
        teamId: '', // 部门
        isEnabled: '', // 是否启用
        typeId: '' // 类型
      },
      jobTypeValidationRule: {
        Name: [{
          required: true,
          message: '请先填写类别名称'
        }, {
          min: 2,
          max: 20,
          message: '类别名称长度在2~20之间'
        }],
        Remark: [{
          min: 2,
          max: 500,
          message: '备注长度在2到500个字符以内'
        }]
      },
      validationRule: {
        Name: [{
          required: true,
          message: '请先填写岗位名称'
        }, {
          min: 2,
          max: 20,
          message: '岗位名称长度在2~20之间'
        }],
        Remark: [{
          min: 2,
          max: 500,
          message: '备注长度在2到500个字符以内'
        }]
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init() {
      if (this.loading) return false
      this.loading = true
      this.getTypes()
      this.getLevels()
      this.getDutys()
      this.get()
    },
    get() {
      const url = this.$root.getApi(API.KEY, API.JOB.URL)
      this.axios.get(url)
        .then(response => {
          this.list = response
          this.filter()
          this.loading = false
        })
    },
    filter () {
      let arr = Object.assign([], this.list)
      if (this.searchOption.teamId) {
        arr = arr.filter(w => w.TeamId === this.searchOption.teamId)
      }
      if (this.searchOption.typeId) {
        arr = arr.filter(w => w.TypeId === this.searchOption.typeId)
      }
      if (this.searchOption.name) {
        arr = arr.filter(w => w.Name === this.searchOption.name)
      }
      if (this.searchOption.isEnabled !== '') {
        arr = arr.filter(w => w.IsEnabled === this.searchOption.isEnabled)
      }
      this.filterList = arr
    },
    getTypes() {
      const url = this.$root.getApi(API.KEY, API.JOB_TYPE.URL)
      this.axios.get(url)
        .then(response => {
          this.types = response
        })
    },
    getLevels() {
      const url = this.$root.getApi(API.KEY, API.JOB_LEVEL.URL)
      this.axios.get(url)
        .then(response => {
          this.levels = response
        })
    },
    getDutys() {
      const url = this.$root.getApi(API.KEY, API.JOB_DUTY.URL)
      this.axios.get(url)
        .then(response => {
          this.dutys = response
        })
    },
    showAddDrawer() {
      this.isAdd = true
      this.entity = { IsEnabled: true }
      this.drawerVisiable = true
    },
    showUpdateDrawer(row) {
      this.isAdd = false
      this.entity = row
      this.drawerVisiable = true
    },
    submit() {
      const valid = this.$refs.form.validate()
      if (valid) {
        if (this.isAdd) {
          this.add()
        } else {
          this.update()
        }
      }
    },
    add() {
      const url = this.$root.getApi(API.KEY, API.JOB.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.drawerVisiable = false
            this.get()
          }
        })
    },
    update() {
      const url = this.$root.getApi(API.KEY, API.JOB.URL)
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.drawerVisiable = false
            this.get()
          }
        })
    },
    del(row) {
      this.$confirm('确认删除当前岗位？', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.JOB.URL)
        this.axios.patch(url, [row.Id])
          .then(response => {
            if (response.Status) {
              this.get()
            }
          })
      })
    },
    stop(row) {
      const url = this.$root.getApi(API.KEY, API.JOB.SET_ENABLED).replace(/{id}/, row.Id)
      this.axios.patch(url)
        .then(response => {
          if (response.Status) {
            this.get()
          }
        })
    },
    showAddTypeDialog() {
      this.isAddType = true
      this.typeEntity = {}
      this.typeDialogVisible = true
    },
    showUpdateTypeDialog(row) {
      this.isAddType = false
      this.typeEntity = row
      this.typeDialogVisible = true
    },
    submitType() {
      const valid = this.$refs.typeForm.validate()
      if (valid) {
        if (this.isAddType) {
          this.addType()
        } else {
          this.updateType()
        }
      }
    },
    addType() {
      const url = this.$root.getApi(API.KEY, API.JOB_TYPE.URL)
      this.axios.post(url, this.typeEntity)
        .then(response => {
          if (response.Status) {
            this.typeDialogVisible = false
            this.getTypes()
          }
        })
    },
    updateType() {
      const url = this.$root.getApi(API.KEY, API.JOB_TYPE.URL)
      this.axios.post(url, this.typeEntity)
        .then(response => {
          if (response.Status) {
            this.typeDialogVisible = false
            this.getTypes()
          }
        })
    },
    changeType(id) {
      if (id !== '0') {
        this.searchOption.typeId = id
        this.$refs.typeTree.setCurrentKey(id)
      } else {
        this.searchOption.typeId = ''
        this.$refs.typeTree.setCurrentKey(null)
      }
      this.filter()
    },
    toLevelPage() {
      this.$root.navigate(PERSON_SETTING_JOB_LEVEL)
    },
    toDutyPage() {
      this.$root.navigate(PERSON_SETTING_JOB_DUTY)
    }
  },
  created() {
    this.init()
  },
  components: {
    TeamCascader
  }
}
</script>

<style lang="scss" scoped>
.job-box {
  padding: 20px;
  font-size: 14px;
  background: #fff;
}

.job-box .job-title .el-button {
  padding: 0;
}

.job-title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.job-title-text {
  color: #151515;
  font-family: PingFangSC-Medium;
  font-size: 18px;
}

.right-line {
  margin-left: 15px;
  margin-right: 15px;
  color: rgb(216, 216, 216);
}

.job-content {
  display: flex;

  .job-left-tab {
    flex-shrink: 0;
    box-sizing: border-box;
    padding-top: 20px;
    padding-right: 10px;
    width: 220px;
    border-right: 1px solid #EBEEF5;

    .tab-all {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15px;

      >span {
        color: #409eff;
      }

      >i {
        cursor: pointer;
      }
    }

    .tab-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15px;

      >span {
        font-size: 16px;
        font-family: PingFangSC-Medium;
      }

      >div {
        padding: 4px 8px;
        border-radius: 20px;
        font-size: 12px;
        background-color: #ebeef5;
        color: #409eff;
        cursor: pointer;
      }
    }

    .ofa-tree {
      .node-btn {
        display: none;
      }

      .tree-node {
        &:hover {
          .node-btn {
            display: block;
          }
        }
      }

      /deep/ .el-tree-node__content {
        margin: 10px 0 0 0 !important;
      }
    }
  }

  .job-right-table {
    width: calc(100vw - 600px);
    flex-shrink: 0;
    padding-top: 20px;
    padding-left: 20px;
  }

  .search-bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    >div {
      margin-bottom: 10px;
    }

    .mr10 {
      margin-right: 10px;
    }
  }
}
</style>
