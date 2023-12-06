<template>
  <el-container v-loading="loading" class="ofa-container column leave-box">
    <!-- 头部条 -->
    <div class="leave-title">
      <div class="leave-title-text">离职管理</div>
      <div>
        <el-button type="text">
          <i class="el-icon-user"></i>
          待退出员工
        </el-button>
        <span class="right-line">|</span>
        <el-button type="text">
          <i class="el-icon-view"></i>
          查看最近离职的人
        </el-button>
        <span class="right-line">|</span>
        <el-button type="text">
          <i class="el-icon-tickets"></i>
          已离职员工
        </el-button>
      </div>
    </div>
    <!-- desc -->
    <div class="title-desc">离职流程中的员工（共{{total}}人）</div>
    <!-- 搜索 -->
    <div class="search-box">
      <div>
        <el-input class="mr10" placeholder="搜索员工" suffix-icon="el-icon-search" v-model="searchOption.name"
          style="width: 20%" size="small">
        </el-input>
        <el-date-picker class="mr10" v-model="searchOption.date" type="daterange" range-separator="~"
          start-placeholder="离职日期" end-placeholder="离职日期" style="width: 40%" value-format="yyyy-MM-dd" size="small">
        </el-date-picker>
      </div>
      <div>
        <el-button type="primary" @click="showDrawer" size="small">办理离职</el-button>
      </div>
    </div>
    <!-- 搜索条件展示区域 -->
    <div class="tag-box" v-if="isShowSearchTag">
      <el-tag closable class="mr10" size="small" color="#f2f2f6" v-if="searchOption.name" @close="close('name')">
        员工{{ searchOption.name }}
      </el-tag>
      <el-tag closable class="mr10" size="small" color="#f2f2f6" v-if="searchOption.date" @close="close('date')">
        预计入职日期{{ searchOption.date[0] }}~{{ searchOption.date[1] }}</el-tag>
      <el-button type="text" class="mr10" @click="search">查询</el-button>
      <el-button type="text" class="mr10" @click="reset"> 重置 </el-button>
      <span>筛选出{{list.length}}人</span>
    </div>
    <!-- 表格区域 -->
    <el-table :data="list" class="ofa-table" size="small">
      <el-table-column prop="PersonName" label="姓名">
      </el-table-column>
      <el-table-column prop="TeamName" label="部门"> </el-table-column>
      <el-table-column prop="PersonJob" label="职位">
      </el-table-column>
      <el-table-column prop="EmployeeType" label="员工类型" width="100">
      </el-table-column>
      <el-table-column prop="EstimateLeaveDate" label="预计离职日期" width="160">
        <template slot-scope="scope">
          {{ new Date(scope.row.EstimateLeaveDate).toString('yyyy-MM-dd') }}
        </template>
      </el-table-column>
      <el-table-column prop="Reason" label="离职原因" min-width="250">
      </el-table-column>
      <el-table-column prop="Remark" label="备注" min-width="450">
      </el-table-column>
      <el-table-column prop="CreatorName" label="办理人">
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button @click="confirm(scope.row)" type="text">确认离职</el-button>
          <el-button @click="del(scope.row)" type="text" class="ofa-text-danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 抽屉 -->
    <el-drawer :visible.sync="drawerVisiable" :modal="false" :show-close="false" direction="rtl" size="380px"
      class="ofa-drawer">
      <div slot="title">
        <span class="title" >办理离职</span><label class="title-tips">Leave</label>
      </div>
      <div class="content-box">
        <el-alert title="可选择员工办理离职，提交后所选员工将进入待离职状态" type="warning" show-icon class="mb10" style="margin-top:20px;">
        </el-alert>
        <el-form :model="entity" :rules="validationRule" label-width="120px" class="form" ref="form" size="small">
          <el-form-item label="姓名" prop="PersonName">
            <el-input v-model="entity.PersonName" @focus="showPersonDialog" placeholder="请输入员工姓名">
            </el-input>
          </el-form-item>
          <el-form-item label="离职日期" prop="EstimateLeaveDate">
            <el-date-picker type="date" placeholder="选择日期" v-model="entity.EstimateLeaveDate">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="离职原因" prop="Reason">
            <el-input v-model="entity.Reason" @focus="showReasonDialog" placeholder="请输入离职原因"></el-input>
          </el-form-item>
          <el-form-item label="离职备注" prop="Remark">
            <el-input v-model="entity.Remark" placeholder="请输离离职备注" type="textarea">
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-tooltip class="item" effect="dark" content="勾选后，该员工入离职信息将不计入人事异动记录" placement="top-end">
              <el-checkbox v-model="entity.CanCreateHistory" class="ofa-text-grey">该离职员工不计入人事统计</el-checkbox>
            </el-tooltip>
          </el-form-item>
        </el-form>
      </div>
      <div class="footer">
        <el-button type="primary" @click="submit" size="small">
          <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;确认
        </el-button>
        <el-button type="warning" @click="drawerVisiable = false" size="small">
          取消
        </el-button>
      </div>
    </el-drawer>
    <!-- 人员选择弹窗 -->
    <el-dialog custom-class="ofa-dialog" title="选择离职人员" :visible.sync="personDialogVisible" width="80%">
      <div style="margin-bottom:10px;">
        <search-input @change="getPersons" slotPrefix placeholder="搜索" style="width:200px" size="small">
        </search-input>
      </div>
      <el-table border :data="personList" max-height="400" size="small">
        <el-table-column label="姓名" prop="Name"></el-table-column>
        <el-table-column label="手机" prop="MobilePhone"></el-table-column>
        <el-table-column label="职级" prop="Job"></el-table-column>
        <el-table-column label="状态" prop="EmployeeStatus"></el-table-column>
        <el-table-column label="入职日期" prop="EntryDate" width="120">
          <template slot-scope="scope">
            {{ scope.row.EntryDate? new Date(scope.row.EntryDate).toString('yyyy-MM-DD') : '未入职' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button @click="selectPerson(scope.row)" type="text">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="personDialogVisible = false" size="small">取消</el-button>
        <el-button type="primary" @click="addMemberFromPerson" size="small">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 原因选择弹窗 -->
    <el-dialog title="选择离职原因" :visible.sync="reasonDialogVisible" width="30%" custom-class="ofa-dialog reason-dia">
      <div class="dia-title">
        主动原因
        <el-tooltip class="item" effect="dark" content="员工发起离职审批时可选" placement="top-start">
          <i class="el-icon-warning"></i>
        </el-tooltip>
      </div>
      <div class="check-box">
        <el-checkbox-group v-model="reasonList">
          <el-checkbox label="家庭原因" class="mb15" size="small">家庭原因</el-checkbox>
          <el-checkbox label="个人原因" class="mb15" size="small">个人原因</el-checkbox>
          <el-checkbox label="发展原因" class="mb15" size="small">发展原因</el-checkbox>
          <el-checkbox label="合同到期不续签" class="mb15" size="small">合同到期不续签</el-checkbox>
          <el-checkbox label="其他" class="mb15" size="small">其他</el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="dia-title">
        被动原因
        <el-tooltip class="item" effect="dark" content="仅管理员可选" placement="top-start">
          <i class="el-icon-warning"></i>
        </el-tooltip>
      </div>
      <div class="check-box">
        <el-checkbox-group v-model="reasonList">
          <el-checkbox label="协议解除" class="mb15" size="small">协议解除</el-checkbox>
          <el-checkbox label="无法胜任工作" class="mb15" size="small">无法胜任工作</el-checkbox>
          <el-checkbox label="经济性裁员" class="mb15" size="small">经济性裁员</el-checkbox>
          <el-checkbox label="严重违法违纪" class="mb15" size="small">严重违法违纪</el-checkbox>
        </el-checkbox-group>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reasonDialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="selectReason" size="small">确 定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
import API from '../../../apis/oa-api'
import { PERSON_LEAVE } from '../../../router/oa-router'

// 人员离职登记
export default {
  name: PERSON_LEAVE.name,
  data() {
    return {
      searchOption: {
        name: '', // 员工姓名
        teamId: '', // 部门
        teamName: '', // 部门
        date: [], //入职日期
        startDate: '', // 开始入职日期
        endDate: '' // 结束入职日期
      },
      loading: false, // 加载中
      isAdd: false, // 是否添加
      isFirstLoading: true, // 第一次加载
      drawerVisiable: false, // 显示办理入职抽屉
      personDialogVisible: false, // 选择成员弹窗
      reasonDialogVisible: false, // 原因选择弹窗
      total: 0, // 总数据量
      entity: {},
      list: [],
      reasonList: [], // 离职原因选择列表
      personList: [], // 人员下拉列表
      validationRule: {
        PersonName: [{ required: true, message: '请先填写员工姓名' }, { min: 2, max: 20, message: '员工姓名长度在2~20之间' }],
        Reason: [{ required: true, message: '请先填写离职原因' }, { min: 2, max: 50, message: '离职原因长度在2~50之间' }],
        EstimateLeaveDate: [{ required: true, message: '请先选择预计入职时间' }]
      }
    }
  },
  computed: {
    isShowSearchTag() {
      return (this.searchOption.name ||
        this.searchOption.mobilePhone ||
        this.searchOption.date.length > 0)
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
      }
    },
    get () {
      if (this.searchOption.date && this.searchOption.date.length > 0) {
        this.searchOption.startDate = this.searchOption.date[0]
        this.searchOption.endDate = this.searchOption.date[1]
      }
      const url = this.$root.getApi(API.KEY, API.PERSON_LEAVE.URL)
      this.axios.get(url, { 
        params: this.searchOption
      }).then(response => {
        this.list = response
        this.loading = false
        if (this.isFirstLoading) {
          this.isFirstLoading = false
          this.total = this.list.length
        }
      })
    },
    search () {
      this.$nextTick(() => { this.get() })
    },
    getPersons (key) {
      const url = this.$root.getApi(API.KEY, API.PERSON.URL)
      this.axios.get(url, {
        params: {
          key: key,
          type: 0
        }
      }).then(response => {
        this.personList = response
      })
    },
    submit () {
      const valid = this.$refs.form.validate()
      if (valid) {
        if (this.isAdd) {
          this.add()
        } else {
          this.update()
        }
      }
    },
    add () {
      const url = this.$root.getApi(API.KEY, API.PERSON_LEAVE.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.get()
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.PERSON_LEAVE.URL)
      this.axios.put(url, this.entity).then(response => {
        if (response.Status) {
          this.get()
        }
      })
    },
    del(row) {
      this.$confirm(`确认要删除 ${row.PersonName} 离职登记?删除后不可恢复，请谨慎操作！`, '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.PERSON_LEAVE.BATCH_DELETE)
        this.axios.patch(url, [row.Id]).then(response => {
          if (response.Status) {
            this.get()
          }
        })
      })
    },
    reset() {
      this.searchOption.name = ''
      this.searchOption.date = []
      this.searchOption.startDate = ''
      this.searchOption.endDate = ''
    },
    close(key) {
      this[key] = ''
    },
    showDrawer() {
      this.isAdd = true
      this.entity = { PersonId: '', PersonName: '', Reason: '', Remark: '', EstimateLeaveDate: '', CanCreateHistory: false }
      this.drawerVisiable = true
    },
    showPersonDialog () {
      this.personList = []
      this.personDialogVisible = true
    },
    selectPerson (row) {
      this.$set(this.entity, 'PersonId', row.Id)
      this.$set(this.entity, 'PersonName', row.Name)
      this.personDialogVisible = false
    },
    showReasonDialog () {
      this.reasonList = []
      this.reasonDialogVisible = true
    },
    selectReason () {
      let resonStr = ''
      this.reasonList.forEach(e => {
        resonStr += e + ' '
      })
      this.$set(this.entity, 'Reason', resonStr)
      this.reasonDialogVisible = false
    },
    confirm (row) {
      this.$confirm(`确认要人员 ${row.PersonName} 已离职?`, '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.PERSON_LEAVE.CONFIRM).replace(/{id}/, row.Id)
        this.axios.patch(url, row).then(response => {
          if (response.Status) {
            this.get()
          }
        })
      })
    },
    notSupported() {
      this.$message.error('该功能暂未开放')
    }
  },
  mounted() {
    this.init()
  },
}
</script>

<style lang="scss" scoped>
.leave-box {
  padding: 20px;
  font-size: 14px;
  background: #fff;
}
.leave-box .leave-title .el-button {
  padding: 0;
}
.leave-title {
  display: flex;
  justify-content: space-between;
}
.leave-title-text {
  color: #151515;
  font-family: PingFangSC-Medium;
  font-size: 18px;
}
.right-line {
  margin-left: 15px;
  margin-right: 15px;
  color: rgb(216, 216, 216);
}
.title-desc {
  color: rgba(0, 0, 0, 0.65);
  font-size: 16px;
  margin-top: 10px;
}
.search-box {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  margin-bottom: 20px;
}
.mr10 {
  margin-right: 10px;
}
.tag-box .mr10 {
  margin-bottom: 5px;
}
.drawer-title {
  color: #191f25;
  font-size: 20px;
  font-weight: 700;
}
::v-deep .el-drawer__header {
  border-bottom: 1px solid #e8e8e8;
  padding: 20px;
  margin: 0;
}
::v-deep .el-tabs__item {
  height: 50px;
  line-height: 50px;
}
.content-box {
  padding: 0 20px 0;
}
.mb10 {
  margin-bottom: 10px;
}
.dia-title {
  padding: 15px 20px;
  background-color: #f7f7f7;
}
::v-deep .reason-dia .el-dialog__body {
  padding: 10px 0;
}
.check-box {
  padding: 15px 20px;
}
.mb15 {
  margin-bottom: 15px;
}
</style>
