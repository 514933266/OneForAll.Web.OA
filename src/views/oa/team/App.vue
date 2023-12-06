<template>
  <el-container v-loading="loading" class="ofa-container">
    <!-- 组织架构 -->
    <el-aside class="tree">
      <div class="header">
        <search-input slotPrefix placeholder="搜索" v-model="searchTeamName" size="small"></search-input>
        <el-button-group>
          <el-button :type="listValid ? 'primary' : ''" @click="listValid = true" size="small">
            <font-awesome-icon fas icon="sitemap"></font-awesome-icon>&nbsp;组织架构
          </el-button>
          <el-button :type="listValid ? '' : 'danger'" @click="listValid = false" size="small">
            <font-awesome-icon fas icon="trash-alt"></font-awesome-icon>&nbsp;回收站
          </el-button>
        </el-button-group>
      </div>
      <el-tree highlight-current accordion :expand-on-click-node="false" :data="list"
        :filter-node-method="filterTeamNode" :props="{ children: 'Children' }" @node-click="clickTreeNode"
        ref="teamTree" class="ofa-tree" node-key="Id" :empty-text="listValid ? '暂无部门' : '暂无已删除的部门'" size="small">
        <span class="tree-node" slot-scope="{ data }">
          <span>
            <font-awesome-icon v-if="data.Id == $store.state.guid" fas icon="building" style="margin-right:5px;">
            </font-awesome-icon>
            <font-awesome-icon v-else fas icon="network-wired" style="margin-right:5px;"></font-awesome-icon>
            <label>{{ data.Name }}&nbsp;</label>
            <label>({{ data.MemberNumber }}人)</label>
          </span>
        </span>
      </el-tree>
      <div v-show="listValid && (!list || list.length < 1) && !loading" class="tree-label">
        <el-link :underline="false" type="primary" @click="showAddTeamDialog">点击创建
        </el-link>
      </div>
    </el-aside>
    <!-- 右侧面板 -->
    <el-main class="right-content">
      <div class="empty-tab">
        <div class="tenant-info">
          <label class="name ofa-text-title">{{currentNode.Name}}</label>
          <el-tag class="tag" effect="dark" size="small">{{currentNode.Type}}</el-tag>
          <el-tag v-show="currentNode.LeaderName" class="tag" type="warning" effect="dark" size="small">
            {{currentNode.LeaderName}}</el-tag>
          <el-button round v-show="currentNode.Id != $store.state.guid" @click="showUpdateTeamDialog"
            style="margin-left:10px;width:80px;" size="small">编辑</el-button>
        </div>
        <div class="child-container">
          <div class="title ofa-text-title">
            <font-awesome-icon fas icon="sitemap"></font-awesome-icon>&nbsp;下级部门
          </div>
          <div class="btn-title">
            <el-button @click="showAddTeamDialog" size="small">
              <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;添加子部门
            </el-button>
            <el-button :disabled="!childList || childList.length === 0" @click="initMemberTableRowDrop" size="small">
              <font-awesome-icon fas icon="sort"></font-awesome-icon>&nbsp;调整排序
            </el-button>
          </div>
          <el-collapse-transition>
            <div v-show="isSortableChildTeam" class="sort-title">
              <label style="margin-right:10px;">可通过拖动部门调整位置</label>
              <el-button @click="submitSortChildList" type="text" size="small">保存</el-button>
              <el-button @click="destroyMemberTableRowDrop" type="text" size="small">撤销</el-button>
            </div>
          </el-collapse-transition>
          <el-table :show-header="false" :data="childList" row-key="Id" ref="memberTable" empty-text="当前部门不包含下级部门"
            max-height="400" size="small">
            <el-table-column prop="Name">
              <template slot-scope="scope">
                <label>{{ scope.row.Name }}{{ scope.row.LeaderName ? '-' + scope.row.LeaderName : '' }}&nbsp;</label>
                <label class="ofa-text-grey">（直属 {{ scope.row.MemberNumber }} 人）</label>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="child-member-box">
          <div class="title ofa-text-title">
            <font-awesome-icon fas icon="users"></font-awesome-icon>&nbsp;部门人员
          </div>
          <div class="btn-title">
            <div>
              <el-button @click="showAddMemberDrawer" type="primary" size="small">
                <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;添加人员
              </el-button>
              <el-button @click="excelDialogVisiable = true" size="small">
                <font-awesome-icon fas icon="file-import"></font-awesome-icon>&nbsp;批量导入
              </el-button>
              <el-button :disabled="memberList.length === 0" @click="showTransferDialog" size="small">
                <font-awesome-icon fas icon="users-cog"></font-awesome-icon>&nbsp;修改部门
              </el-button>
              <el-button plain :disabled="memberList.length === 0" @click="delMember" type="danger" size="small">
                <font-awesome-icon fas icon="user-times"></font-awesome-icon>&nbsp;移除
              </el-button>
              <el-button plain :disabled="memberList.length === 0" @click="leaveMember" type="warning" size="small">
                <font-awesome-icon fas icon="users-slash"></font-awesome-icon>&nbsp;离职
              </el-button>
            </div>
            <div>
              <el-checkbox v-model="memberSearchOption.isOnJob" size="small">在职</el-checkbox>
            </div>
          </div>
          <el-table :data="filterMemberList" @selection-change="memberSelectionChange" empty-text="当前部门暂无人员"
            max-height="400" size="small">
            <el-table-column type="selection" width="50" header-align="center" align="center"></el-table-column>
            <el-table-column label="姓名" prop="Name">
              <template slot-scope="scope">
                <div class="person-name-box">
                  <el-avatar :src="(domain + scope.row.IconUrl)" fit="contain" class="person-icon">
                    {{getSubName(scope.row.Name)}}
                  </el-avatar>
                  <label style="margin-left:8px;">{{scope.row.Name}}</label>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="职级" prop="Job"></el-table-column>
            <el-table-column label="手机" prop="Phone"></el-table-column>
            <el-table-column label="邮箱" prop="Email"></el-table-column>
            <el-table-column label="入职日期" prop="EntryDate" width="120">
              <template slot-scope="scope">
                <label class="ofa-text-danger" v-if="scope.row.IsLeave">已离职</label>
                <label
                  v-else>{{ scope.row.EntryDate? new Date(scope.row.EntryDate).toString('yyyy-MM-DD') : '未入职' }}</label>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-main>
    <!-- 部门抽屉 -->
    <el-drawer :visible.sync="teamDrawerVisiable" :modal="false" :show-close="false" direction="rtl" size="380px"
      class="ofa-drawer">
      <div slot="title">
        <span class="title">{{isAdd ? '添加' : '编辑'}}部门</span><label class="title-tips">Team</label>
      </div>
      <el-form :model="entity" :rules="validationRule" label-width="120px" class="form" ref="form" size="small">
        <el-form-item label="部门名称" prop="Name">
          <el-input v-model.trim="entity.Name" placeholder="请输入部门名称，如XX部" size="small"></el-input>
        </el-form-item>
        <el-form-item label="上级" prop="ParentId">
          <team-cascader showRoot :rootName="tenant.Name" v-model="entity.ParentId" ref="teamCascader"
            placeholder="请选择上级" size="small">
          </team-cascader>
        </el-form-item>
        <el-form-item label="类型" prop="Type">
          <el-select allow-create filterable v-model="entity.Type" placeholder="部门类型" size="small">
            <el-option v-for="item in typeList" :key="item.Id" :label="item.Name" :value="item.Name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="直接负责人" prop="LeaderId">
          <el-select filterable remote :remote-method="getPersons" v-model="entity.LeaderId" no-data-text="请搜索员工名称设置"
            placeholder="直接负责人" size="small">
            <el-option disabled label="未选择" :value="$store.state.guid"></el-option>
            <el-option v-for="item in personList" :key="item.Id" :label="item.Name" :value="item.Id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="footer">
        <el-button v-show="!entity.IsDeleted" type="primary" @click="submit" size="small">
          <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;{{isAdd ? '创建' : '保存'}}
        </el-button>
        <el-button v-show="!isAdd" :type="entity.IsDeleted ? 'success' : 'danger'" @click="remove" size="small">
          {{entity.IsDeleted ? '恢复' : '删除'}}
        </el-button>
        <el-button v-show="permissions.Delete && entity.IsDeleted" type="danger" @click="del" size="small">彻底删除
        </el-button>
        <el-button type="warning" @click="teamDrawerVisiable = false" size="small">
          取消
        </el-button>
      </div>
    </el-drawer>
    <!-- 人员抽屉 -->
    <el-drawer :visible.sync="memberDrawerVisiable" :modal="false" :show-close="false" direction="rtl" size="380px"
      class="ofa-drawer">
      <div slot="title">
        <span class="title">{{isAddMember ? '添加' : '编辑'}}成员</span><label class="title-tips">Member</label>
      </div>
      <div>
        <el-alert center v-if="isAddMember" :closable="false" type="warning" style="margin-bottom:10px;">
          <el-button @click="personDialogVisible = true" type="text" size="small">
            <font-awesome-icon fas icon="hand-point-right"></font-awesome-icon>&nbsp;<u>点击此处</u>
          </el-button>，从现有人员档案中选择加入
        </el-alert>
        <el-form :model="memberEntity" :rules="memberValidationRules" label-width="120px" class="form" ref="memberForm"
          size="small">
          <el-form-item label="姓名" prop="Name">
            <el-input v-model.trim="memberEntity.Name" placeholder="姓名" size="small"></el-input>
          </el-form-item>
          <el-form-item label="性别" prop="Sex">
            <el-radio-group v-model="memberEntity.Sex" size="small">
              <el-radio :label="false">女</el-radio>
              <el-radio :label="true">男</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="加入部门" prop="TeamId">
            <team-cascader v-model="memberEntity.TeamId" ref="teamCascader" size="small" placeholder="请选择上级">
            </team-cascader>
          </el-form-item>
          <el-form-item label="职级" prop="Job">
            <el-select clearable v-model="memberEntity.Job" placeholder="岗位职级" size="small">
              <el-option v-for="item in jobs" :key="item.Id" :label="item.Name" :value="item.Name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="手机" prop="MobilePhone">
            <el-input v-model.trim="memberEntity.MobilePhone" placeholder="联系手机" size="small"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="Email">
            <el-input v-model.trim="memberEntity.Email" placeholder="电子邮箱" size="small"></el-input>
          </el-form-item>
          <el-form-item label="身份证" prop="IdCard">
            <el-input v-model="memberEntity.IdCard" placeholder="身份证" size="small"></el-input>
          </el-form-item>
          <el-form-item label="管理" prop="IsLeader">
            <el-checkbox v-model="memberEntity.IsLeader" size="small"></el-checkbox>
          </el-form-item>
          <el-divider content-position="left">入职信息</el-divider>
          <el-form-item label="工号" prop="WorkNumber">
            <el-input v-model="memberEntity.WorkNumber" placeholder="工号" size="small"></el-input>
          </el-form-item>
          <el-form-item label="入职时间" prop="EntryDate">
            <el-date-picker v-model="memberEntity.EntryDate" value-format="yyyy-MM-dd" type="date" placeholder="入职时间"
              size="small">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="员工类型" prop="EmployeeType">
            <el-select v-model="memberEntity.EmployeeType" placeholder="员工类型" size="small">
              <el-option v-for="item in employeeTypes" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="员工状态" prop="EmployeeStatus">
            <el-select v-model="memberEntity.EmployeeStatus" placeholder="员工状态" size="small">
              <el-option v-for="item in employeeStatus" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注" prop="Remark" placeholder="备注" size="small">
            <el-input v-model="memberEntity.Remark"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="footer">
        <el-button type="primary" @click="submitMember" size="small">
          <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;{{isAddMember ? '添加' : '保存'}}
        </el-button>
        <el-button v-show="!isAddMember" type="danger" @click="delMember" size="small">删除
        </el-button>
        <el-button type="warning" @click="memberDrawerVisiable = false" size="small">
          取消
        </el-button>
      </div>
    </el-drawer>
    <!-- 批量加入团队弹窗 -->
    <el-dialog custom-class="ofa-dialog" :title="'添加成员到-' + currentNode.Name" :visible.sync="personDialogVisible"
      @open="getNoTeamPersons" width="80%">
      <div style="margin-bottom:10px;">
        <search-input v-model="searchPersonKey" slotPrefix placeholder="搜索" style="width:200px" size="small">
        </search-input>
        <el-checkbox v-model="searchTeamMember" @change="getNoTeamPersons" style="margin-left:10px;" size="small">搜索团队成员
        </el-checkbox>
      </div>
      <el-table border :data="noTeamPersonList.filter(data => !searchPersonKey || data.Name.includes(searchPersonKey))"
        @selection-change="noTeamPersonSelectionChange" empty-text="没有可加入部门的人员" max-height="400" size="small">
        <el-table-column type="selection" width="50" header-align="center" align="center"></el-table-column>
        <el-table-column label="姓名" prop="Name"></el-table-column>
        <el-table-column label="手机" prop="MobilePhone"></el-table-column>
        <el-table-column label="职级" prop="Job"></el-table-column>
        <el-table-column label="入职日期" prop="EntryDate" width="120">
          <template slot-scope="scope">
            {{ scope.row.EntryDate? new Date(scope.row.EntryDate).toString('yyyy-MM-DD') : '未入职' }}
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="personDialogVisible = false" size="small">取消</el-button>
        <el-button type="primary" @click="addMemberFromPerson" size="small">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 人员调动弹窗 -->
    <el-dialog custom-class="ofa-dialog" title="人员调动" :visible.sync="transferDialogVisiable" width="30%">
      <team-cascader style="width: 100%" v-model="transferTarget" placeholder="请选择目标部门" size="small"></team-cascader>
      <span slot="footer" class="dialog-footer">
        <el-button @click="transferDialogVisiable = false" size="small">取消</el-button>
        <el-button type="primary" @click="transferSubmit" size="small">确 定</el-button>
      </span>
    </el-dialog>
    <!-- Excel导入弹窗 -->
    <el-dialog append-to-body :visible.sync="excelDialogVisiable" :title="`导入成员到-${currentNode.Name}`"
      custom-class="ofa-dialog" width="80%">
      <excel-uploader :teamId="selectedNode.Id" size="small"></excel-uploader>
    </el-dialog>
  </el-container>
</template>

<script>
import API from '../../../apis/oa-api'
import { PERSON_EMPLOYEE_TYPE, PERSON_EMPLOYEE_STATUS } from '../../../assets/js/oa-const'
import { TEAM, TEAM_FORM } from '../../../router/oa-router'
import TeamCascader from '../_components/TeamCascader'
import ExcelUploader from '../_components/TeamMemberExcelUploader'
import Sortable from 'sortablejs'

export default {
  name: TEAM.name,
  data () {
    return {
      employeeTypes: PERSON_EMPLOYEE_TYPE, // 员工类型
      employeeStatus: PERSON_EMPLOYEE_STATUS, // 员工状态
      activeTab: 'first', // 激活的标签
      transferTarget: '', // 调动的目标
      searchPersonKey: '', // 未加入团队人员过滤
      entity: {}, // 当前部门实体
      currentNode: {}, // 当前点击的树节点
      memberTable: {}, // 成员Table
      list: [], // 组织架构列表
      jobs: [], // 岗位职级
      typeList: [], // 部门类型列表
      childList: [], // 子级部门列表
      memberList: [], // 成员列表
      personList: [], // 人员下拉列表
      noTeamPersonList: [], // 未加入团队人员列表
      memberSelectionList: [], // 选中的成员
      transfereSelectionList: [], // 调动时记录的选中人，用来暂时解决弹窗出现时，table会刷新选项的bug
      noTeamPersonSelectionList: [], // 未加入团队人员选择列表
      isAdd: true, // 是否添加模式
      loading: false, // 加载中
      listValid: true, // 显示有效数据
      isAddMember: false, // 是否添加成员
      loadingType: false, // 类型加载中
      searchTeamMember: false, // 搜索团队成员
      isSortableChildTeam: false, // 启用下级排序
      teamDrawerVisiable: false, // 部门抽屉
      excelDialogVisiable: false, // 成员信息导入弹窗
      personDialogVisible: false, // 批量选择成员弹窗
      memberDrawerVisiable: false, // 人员抽屉
      transferDialogVisiable: false, // 人员调动弹窗
      searchTeamName: '', // 搜索的团队名字
      validationRule: {
        ParentId: [{ required: true, message: '请先选择上级' }],
        Name: [{ required: true, message: '请先填写部门名称' }, { min: 2, max: 20, message: '部门名称长度在2~20之间' }],
        Type: [{ required: true, message: '请先填写类型' }]
      },
      memberEntity: {},
      memberSearchOption: {
        isOnJob: true
      },
      memberValidationRules: {
        TeamId: [{ required: true, message: '请先选择加入部门' }],
        Name: [{ required: true, message: '请先填写人员姓名' }, { min: 2, max: 20, message: '人员姓名长度在2~20之间' }],
        Job: [{ required: true, message: '请先填写岗位职级' }, { min: 2, max: 20, message: '岗位职级长度在2~20之间' }],
        MobilePhone: [{ min: 11, max: 20, message: '手机号码长度错误' }]
      }
    }
  },
  computed: {
    tenant () {
      return this.$store.state.tenant
    },
    selectedNode () {
      if (this.$refs.teamTree) {
        return this.$refs.teamTree.getCurrentNode()
      } else {
        return { Id: this.$store.state.guid }
      }
    },
    domain () {
      return this.$root.getApiDomain(API.KEY)
    },
    permissions () {
      return this.$root.getPermissions(TEAM.name)
    },
    filterMemberList () {
      if (this.memberSearchOption.isOnJob) {
        return this.memberList.filter(data => !data.IsLeave)
      } else {
        return this.memberList
      }
    }
  },
  watch: {
    listValid () {
      this.get()
    },
    searchTeamName (newValue) {
      this.$refs.teamTree.filter(newValue)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      if (!this.loading) {
        this.loading = true
        this.get()
        this.getType()
        this.getJobs()
      }
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.TEAM.URL)
      this.axios.get(url, {
        params: {
          scope: this.listValid ? 0 : 1
        }
      }).then(response => {
        const defaultId = this.$store.state.guid
        const total = response.length > 0 ? response.map(s => s.MemberNumber).reduce((a, b) => a + b) : 0
        const node = {
          Id: defaultId,
          Name: this.tenant.Name,
          Type: '企业',
          ParentId: defaultId,
          MemberNumber: total,
          Children: response
        }
        const tree = [node]
        this.list = tree
        this.loading = false
        this.$nextTick(() => {
          this.currentNode = node
          this.$refs.teamTree.setCurrentKey(defaultId)
        })
      })
    },
    getType () {
      const url = this.$root.getApi(API.KEY, API.TEAM_TYPE.URL)
      this.axios.get(url, {
        params: {
          name: this.entity.Type
        }
      }).then(response => {
        this.typeList = response
      })
    },
    getPerson (id) {
      const url = this.$root.getApi(API.KEY, API.PERSON.URL)
      this.axios.get(`${url}/${id}`).then(response => {
        response.IconUrl = `${this.domain}/${response.IconUrl}`
        this.personList = [response]
      })
    },
    getPersons (key) {
      const url = this.$root.getApi(API.KEY, API.PERSON.URL)
      this.axios.get(url, {
        params: {
          key: key,
          type: 0
        }
      }).then(response => {
        response.forEach(e => {
          e.IconUrl = `${this.domain}/${e.IconUrl}`
        })
        this.personList = response
      })
    },
    getJobs() {
      const url = this.$root.getApi(API.KEY, API.JOB.URL)
      this.axios.get(`${url}?isEnabled=true`)
        .then(response => {
          this.jobs = response
        })
    },
    getSubName (str) {
      return (str && str.length > 0) ? str.substring(0, 1) : 'P'
    },
    clickTreeNode (event, node) {
      this.isSortableChildTeam = false
      this.currentNode = { ...node.data }
      this.$set(this.entity, 'ParentId', node.data.Id)
      this.childList = node.data.Children

      // 不是根节点时才获取成员列表
      if (node.data.Id !== this.$store.state.guid) {
        this.getMembers()
      } else {
        this.memberList = []
      }
    },
    filterTeamNode (value, data, node) {
      if (!value) return true
      return data.Name.indexOf(value) !== -1
    },
    getMembers () {
      if (!this.currentNode) return false
      const url = this.$root.getApi(API.KEY, API.TEAM.MEMBER.replace(/{id}/, this.currentNode.Id))
      this.axios.get(url).then(response => {
        response.forEach(e => {
          e.IconUrl = `${this.domain}/${e.IconUrl}`
        })
        this.memberList = response
      })
    },
    showAddTeamDialog () {
      if (!this.checkTeamSelection()) return false
      this.isAdd = true
      this.entity = { ParentId: this.currentNode.Id }
      this.teamDrawerVisiable = true
    },
    showUpdateTeamDialog () {
      if (!this.checkTeamSelection()) return false
      this.isAdd = false
      this.entity = { ...this.currentNode }
      this.teamDrawerVisiable = true
      if (this.currentNode.LeaderId !== this.$store.state.guid) {
        this.getPerson(this.currentNode.LeaderId)
      }
    },
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.isAdd) {
            this.add()
          } else {
            this.update()
          }
        }
      })
    },
    add () {
      const url = this.$root.getApi(API.KEY, API.TEAM.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) this.get()
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.TEAM.URL)
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) this.get()
        })
    },
    remove () {
      let tips = `确认要移除 ${this.entity.Name}？确认操作后部门成员将会被解散`
      if (this.entity.IsDeleted) tips = `确认要恢复（${this.entity.Type}）${this.entity.Name}`
      this.$confirm(tips, '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.TEAM.URL)
        this.axios.delete(`${url}/${this.entity.Id}`).then(response => {
          if (response.Status) {
            this.teamDrawerVisiable = false
            this.get()
          }
        })
      })
    },
    del () {
      this.$confirm(`确认要彻底删除${this.entity.Name}?删除后不可恢复`, '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.TEAM.URL)
        this.axios.delete(`${url}/${this.entity.Id}?isTrue=true`).then(response => {
          if (response.Status) {
            this.get()
          }
        })
      })
    },
    initMemberTableRowDrop () {
      const _this = this
      this.isSortableChildTeam = true
      const table = this.$refs.memberTable.$el.querySelector('.el-table__body-wrapper tbody')
      this.memberTable = Sortable.create(table, {
        animation: 180,
        delay: 0,
        onEnd ({ newIndex, oldIndex }) {
          const curRow = _this.childList.splice(oldIndex, 1)[0]
          _this.childList.splice(newIndex, 0, curRow)
        }
      })
    },
    destroyMemberTableRowDrop () {
      this.isSortableChildTeam = false
      this.memberTable.destroy()
    },
    submitSortChildList () {
      this.destroyMemberTableRowDrop()
      if (!this.childList || this.childList.length === 0) return false
      const url = this.$root.getApi(API.KEY, API.TEAM.BATCH_SORT)
      this.axios.patch(url, this.childList)
    },
    showAddMemberDrawer () {
      if (!this.checkTeamSelection()) return false
      this.isAddMember = true
      this.memberEntity = { TeamId: this.currentNode.Id, PersonSex: false, EmployeeType: this.employeeTypes[0].label, EmployeeStatus: this.employeeStatus[0].label }
      this.memberDrawerVisiable = true
    },
    memberSelectionChange (rows) {
      this.memberSelectionList = rows
    },
    submitMember () {
      this.$refs.memberForm.validate((valid) => {
        if (valid) {
          if (this.isAddMember) {
            this.addMember()
          }
        }
      })
    },
    addMember () {
      const url = this.$root.getApi(API.KEY, API.TEAM_MEMBER.URL)
      this.axios.post(url, this.memberEntity)
        .then(response => {
          if (response.Status) {
            this.get()
            this.getMembers()
          }
        })
    },
    delMember () {
      if (!this.checkMemberSelection()) return false
      this.$confirm('确认要移除选中成员？', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const ids = this.memberSelectionList.map(s => s.Id)
        const url = this.$root.getApi(API.KEY, API.TEAM.MEMBER_BATCH_DELETE.replace(/{id}/, this.currentNode.Id))
        this.axios.patch(url, ids).then(response => {
          if (response.Status) {
            this.getMembers()
          }
        })
      })
    },
    getNoTeamPersons () {
      let url = this.$root.getApi(API.KEY, API.NO_TEAM_PERSON.URL)
      if (this.searchTeamMember) {
        url = this.$root.getApi(API.KEY, API.TEAM.MEMBER.replace(/{id}/, this.$store.state.guid))
      }
      this.axios.get(url).then(response => {
        this.noTeamPersonList = response
      })
    },
    noTeamPersonSelectionChange (rows) {
      this.noTeamPersonSelectionList = rows
    },
    addMemberFromPerson () {
      if (!this.checkNoTeamSelection()) return false
      const ids = this.noTeamPersonSelectionList.map(s => s.Id)
      const url = this.$root.getApi(API.KEY, API.TEAM.MEMBER.replace(/{id}/, this.currentNode.Id))
      this.axios.post(url, ids).then(response => {
        if (response.Status) {
          this.getNoTeamPersons()
          this.getMembers()
        }
      })
    },
    leaveMember () {
      if (!this.checkMemberSelection()) return false
      this.$confirm('确认选中成员已离职？', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const ids = this.memberSelectionList.map(s => s.Id)
        const url = this.$root.getApi(API.KEY, API.TEAM_MEMBER.BATCH_DELETE)
        this.axios.patch(url, {
          Ids: ids,
          IsLeave: true,
          TeamId: this.currentNode.Id
        }).then(response => {
          if (response.Status) this.getMembers()
        })
      })
    },
    showTransferDialog () {
      if (!this.checkTeamSelection()) return false
      if (!this.checkMemberSelection()) return false
      this.transfereSelectionList = [...this.memberSelectionList]
      this.transferDialogVisiable = true
    },
    transferSubmit () {
      const ids = this.transfereSelectionList.map(s => s.Id)
      const url = this.$root.getApi(API.KEY, API.TEAM_MEMBER.BATCH_TRANSFER)
      this.axios.patch(url, {
        Ids: ids,
        TeamId: this.currentNode.Id,
        TargetTeamId: this.transferTarget
      }).then(response => {
        if (response.Status) {
          this.transferDialogVisiable = false
          this.getMembers()
        }
      })
    },
    checkTeamSelection () {
      if (!this.currentNode) {
        this.$message.error('请先选择一个部门')
        return false
      }
      return true
    },
    checkMemberSelection () {
      if (!this.checkTeamSelection()) return false
      if (this.memberSelectionList.length < 1) {
        this.$message.error('请选择成员')
        return false
      }
      return true
    },
    checkNoTeamSelection () {
      if (!this.checkTeamSelection()) return false
      if (this.noTeamPersonSelectionList.length < 1) {
        this.$message.error('请选择人员')
        return false
      }
      return true
    },
    toFormPage (params) {
      this.$root.browser.navigate({ ...TEAM_FORM, params: params })
    }
  },
  created () {
    this.init()
    // 解决表格拖拽弹出新网页问题
    document.body.ondrop = (event) => {
      event.preventDefault()
      event.stopPropagation()
    }
  },
  // eslint-disable-next-line
  components: { TeamCascader, ExcelUploader, Sortable }
}
</script>

<style lang="scss" scoped>
$border-color: #EBEEF5;
.ofa-container {
  padding-left: 0;

  .tree {
    width: 300px;
    min-height: 650px;
    border-right: 1px solid $border-color;

    .header {
      display: flex;
      flex-direction: column;
      padding: .75rem;
      border-bottom: 1px solid $border-color;

      .el-button-group {
        margin-top: 10px;

        button {
          width: 50%;
        }
      }

    }
  }

  .tree-label {
    display: flex;
    justify-content: center;
    > a {
      font-size: .85rem;
    }
  }

  /deep/.right-content {
    flex: 1;
    padding: 20px;
    position: relative;
    overflow: hidden;

    .btn-box {
      position: absolute;
      right: 0;
      top: 0;
      z-index: 1;

      .el-input {
        width: 150px;
        margin-right: 10px;
      }
    }

    .user-icon {
      border-radius: 50%;
      vertical-align: middle;
      margin-right: 10px;

      img {
        width: 40px;
        height: 40px;
      }
    }
  }

  .tenant-info {
    display: flex;
    align-items: center;

    .name {
      font-size: 1.25rem;
    }

    .tag {
      margin-left: 10px;
    }
  }

  .child-container,
  .child-member-box {
    .title {
      padding: 30px 0;
      font-size: 1.25rem;
    }

    .btn-title {
      padding: 10px;
      background: #F2F6FC;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 10px;
    }

    .sort-title {
      background: rgb(253, 246, 236) none repeat scroll 0% 0%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .person-name-box {
      display: flex;
      align-items: center;

      .person-icon {
        margin-right: 10px;
        border-radius: 50%;
        width: 45px;
        height: 45px;
        background: rgba(27, 154, 247, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
      }
    }
  }
}
</style>
