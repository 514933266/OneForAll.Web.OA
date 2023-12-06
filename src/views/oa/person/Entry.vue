<template>
  <el-container v-loading="loading" class="ofa-container column entry-box">
    <!-- 头部条 -->
    <div class="entry-title">
      <div class="entry-title-text">入职管理</div>
      <div>
        <el-button @click="notSupported" type="text">
          <i class="el-icon-setting"></i>
          设置新员工入职培训
        </el-button>
        <span class="right-line">|</span>
        <el-button @click="notSupported" type="text">
          <i class="el-icon-bell"></i>
          新员工欢迎公告
        </el-button>
        <span class="right-line">|</span>
        <el-button @click="notSupported" type="text">
          <i class="el-icon-view"></i>
          查看最近入职的人
        </el-button>
      </div>
    </div>
    <!-- desc -->
    <div class="title-desc">待入职员工（共{{total}}人）</div>
    <!-- 搜索 -->
    <div class="search-box">
      <div>
        <el-input class="mr10" placeholder="搜索姓名" suffix-icon="el-icon-search" v-model="searchOption.name"
          style="width: 15%" size="small">
        </el-input>
        <el-input class="mr10" placeholder="手机号码" suffix-icon="el-icon-search" v-model="searchOption.mobilePhone"
          style="width: 15%" size="small">
        </el-input>
        <el-date-picker class="mr10" v-model="searchOption.date" type="daterange" range-separator="~"
          start-placeholder="入职日期" end-placeholder="入职日期" style="width: 25%" value-format="yyyy-MM-dd" size="small">
        </el-date-picker>
        <el-select class="mr10" v-model="searchOption.submit" placeholder="入职登记表" style="width: 15%" size="small">
          <el-option label="是" value="1"></el-option>
          <el-option label="否" value="0"></el-option>
        </el-select>
        <el-input class="mr10" placeholder="办理人" suffix-icon="el-icon-search" v-model="searchOption.createtorName"
          style="width: 15%" size="small">
        </el-input>
      </div>
      <div>
        <el-button type="primary" @click="showDrawer" size="small">办理入职</el-button>
      </div>
    </div>
    <!-- 搜索条件展示区域 -->
    <div class="tag-box" v-show="isShowSearchTag">
      <el-tag closable class="mr10" size="small" color="#f2f2f6" v-show="searchOption.name"
        @closeSearchTag="closeSearchTag('name')">姓名：{{ searchOption.name }}
      </el-tag>
      <el-tag closable class="mr10" size="small" color="#f2f2f6" v-show="searchOption.mobilePhone"
        @closeSearchTag="closeSearchTag('mobilePhone')">手机号：{{ searchOption.mobilePhone }}</el-tag>
      <el-tag closable class="mr10" size="small" color="#f2f2f6" v-show="searchOption.date.length > 0"
        @closeSearchTag="closeSearchTag('date')">
        预计入职日期：{{ searchOption.date[0] }}~{{ searchOption.date[1] }}</el-tag>
      <el-tag closable class="mr10" size="small" color="#f2f2f6" v-show="searchOption.submit != ''"
        @closeSearchTag="closeSearchTag('submit')">
        入职登记表是否提交：{{ searchOption.submit == 1 ? '是' : '否' }}</el-tag>
      <el-tag closable class="mr10" size="small" color="#f2f2f6" v-show="searchOption.creatorName"
        @closeSearchTag="closeSearchTag('creatorName')">
        办理人：{{ searchOption.creatorName }}</el-tag>
      <el-button type="text" class="mr10" @click="search">查询</el-button>
      <el-button type="text" class="mr10" @click="reset">重置</el-button>
      <span>筛选出{{list.length}}人</span>
    </div>
    <!-- 表格区域 -->
    <el-table :data="list" @cell-mouse-enter="(row) => hoverIndex = row.index"
      @cell-mouse-leave="(row) => hoverIndex = -1" class="ofa-table" size="small">
      <el-table-column prop="Name" label="姓名"> </el-table-column>
      <el-table-column prop="TeamName" label="部门"> </el-table-column>
      <el-table-column prop="Job" label="职位"> </el-table-column>
      <el-table-column prop="IsSubmitEntryFile" label="入职登记表" width="140">
        <template slot-scope="scope">
          <div class="date-box">
            <div class="mr10">
              <div>{{ (scope.row.IsSubmitEntryFile ? '是' : '否') }}</div>
            </div>
            <el-button @click="invite(scope.row)" type="text" v-show="hoverIndex == scope.row.index">邀请</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="EstimateEntryDate" label="预计入职时间" width="160">
        <template slot-scope="scope">
          <div class="date-box">
            <div class="mr10">
              <div>{{ new Date(scope.row.EstimateEntryDate).toString('yyyy-MM-DD') }}</div>
              <div v-show="scope.row.IsOverdue" class="color-red">已超期{{scope.row.OverdueDays}}天</div>
            </div>
            <el-button @click="showUpdadteDialog(scope.row)" type="text" v-show="hoverIndex == scope.row.index">调整
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="CreatorName" label="办理人"> </el-table-column>
      <el-table-column prop="address" label="操作" width="120">
        <template slot-scope="scope">
          <el-button type="text" @click="showConfirmDrawer(scope.row)">确认到岗</el-button>
          <el-button @click="del(scope.row)" type="text" class="ofa-text-danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 调整预计入职日期 -->
    <el-dialog title="调整预计入职日期" :visible.sync="dialogVisiable" width="30%" custom-class="ofa-dialog">
      <el-form :model="entity" :rules="validationRule" ref="form" label-position="right" label-width="150px"
        size="small">
        <el-form-item label="员工">
          {{ entity.Name }}
        </el-form-item>
        <el-form-item label="预计入职时间" prop="EstimateEntryDate">
          <el-date-picker v-model="entity.EstimateEntryDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisiable = false" size="small">取 消</el-button>
        <el-button type="primary" @click="submit" size="small">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 办理入职 抽屉 -->
    <el-drawer :visible.sync="drawerVisiable" :modal="false" :show-closeSearchTag="false" direction="rtl" size="380px"
      class="ofa-drawer">
      <div slot="title">
        <span class="title">办理入职</span><label class="title-tips">Entry</label>
      </div>
      <div class="content-box">
        <el-alert title="可手动添加待入职员工，可邀请员工补充入职信息" type="warning" show-icon class="mb10">
        </el-alert>
        <el-form :model="entity" :rules="validationRule" label-width="120px" class="form" ref="form" size="small">
          <el-form-item label="姓名" prop="Name">
            <el-input v-model="entity.Name" placeholder="请输入员工姓名"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="MobilePhone">
            <el-input v-model="entity.MobilePhone" placeholder="请输入手机号码"></el-input>
          </el-form-item>
          <el-form-item label="预计入职日期" prop="EstimateEntryDate">
            <el-date-picker v-model="entity.EstimateEntryDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="部门" prop="TeamId">
            <team-cascader v-model="entity.TeamId" ref="teamCascader" placeholder="请选择入职部门">
            </team-cascader>
          </el-form-item>
          <el-form-item label="职位" prop="Job">
            <el-select clearable v-model="entity.Job" placeholder="岗位职级" size="small">
              <el-option v-for="item in jobs" :key="item.Id" :label="item.Name" :value="item.Name"></el-option>
            </el-select>
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
    <!-- 确认到岗 抽屉 -->
    <el-drawer :visible.sync="confirmDrawerVisiable" :modal="false" :show-closeSearchTag="false" direction="rtl"
      size="380px" class="ofa-drawer">
      <div slot="title">
        <span class="title">确认到岗</span><label class="title-tips">Confirm</label>
      </div>
      <el-form :model="entity" :rules="confirmValidationRule" label-width="120px" class="form" ref="confirmForm"
        size="small">
        <el-form-item label="姓名" prop="Name">
          <el-input disabled v-model.trim="entity.Name" placeholder="姓名"></el-input>
        </el-form-item>
        <el-form-item label="职级" prop="Job">
          <el-input disabled v-model.trim="entity.Job" placeholder="岗位职级"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="MobilePhone">
          <el-input disabled v-model.trim="entity.MobilePhone" placeholder="联系手机"></el-input>
        </el-form-item>
        <el-divider content-position="left">入职信息</el-divider>
        <el-form-item label="工号" prop="WorkNumber">
          <el-input v-model="entity.WorkNumber" placeholder="工号"></el-input>
        </el-form-item>
        <el-form-item label="员工类型" prop="EmployeeType">
          <el-select v-model="entity.EmployeeType" placeholder="员工类型">
            <el-option v-for="item in employeeTypes" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="员工状态" prop="EmployeeStatus">
          <el-select v-model="entity.EmployeeStatus" placeholder="员工状态">
            <el-option v-for="item in employeeStatus" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="Remark">
          <el-input v-model="entity.Remark" placeholder="备注"></el-input>
        </el-form-item>
      </el-form>
      <div class="footer">
        <el-button type="primary" @click="confirm" size="small">
          <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;确认
        </el-button>
        <el-button type="warning" @click="drawerVisiable = false" size="small">
          取消
        </el-button>
      </div>
    </el-drawer>
  </el-container>
</template>

<script>
import API from '../../../apis/oa-api'
import { PERSON_ENTRY } from '../../../router/oa-router'
import { PERSON_EMPLOYEE_TYPE, PERSON_EMPLOYEE_STATUS } from '../../../assets/js/oa-const'
import TeamCascader from '../_components/TeamCascader'

// 人员入职管理
export default {
  name: PERSON_ENTRY.name,
  data() {
    return {
      employeeTypes: PERSON_EMPLOYEE_TYPE, // 员工类型
      employeeStatus: PERSON_EMPLOYEE_STATUS, // 员工状态
      hoverIndex: -1,
      searchOption: {
        name: '', // 员工姓名
        mobilePhone: '', //手机号码
        submit: '', // 已提交
        date: [], //入职日期
        startDate: '', // 开始入职日期
        endDate: '', // 结束入职日期
        creatorName: '' // 班里人
      },
      loading: false, // 加载中
      isAdd: false, // 是否添加
      isFirstLoading: true, // 第一次加载
      drawerVisiable: false, // 显示办理入职抽屉
      confirmDrawerVisiable: false, // 显示确认到岗抽屉
      dialogVisiable: false,
      total: 0, // 总数据量
      entity: {},
      list: [],
      jobs: [], // 职级
      validationRule: {
        Name: [{ required: true, message: '请先填写员工姓名' }, { min: 2, max: 20, message: '员工姓名长度在2~20之间' }],
        Job: [{ required: true, message: '请先填写岗位职级' }, { min: 2, max: 20, message: '岗位职级长度在2~20之间' }],
        MobilePhone: [{ required: true, message: '请先填写手机号码' },{ min: 11, max: 20, message: '手机号码长度错误' }],
        TeamId: [{ required: true, message: '请先选择入职部门' }],
        EstimateEntryDate: [{ required: true, message: '请先选择预计入职时间' }]
      },
      confirmValidationRule: {
        Name: [{ required: true, message: '请先填写员工姓名' }, { min: 2, max: 20, message: '员工姓名长度在2~20之间' }],
        Job: [{ required: true, message: '请先填写岗位职级' }, { min: 2, max: 20, message: '岗位职级长度在2~20之间' }],
        MobilePhone: [{ required: true, message: '请先填写手机号码' },{ min: 11, max: 20, message: '手机号码长度错误' }],
        IdCard: [{ required: true, message: '请先填写身份证号' },{ min: 14, max: 20, message: '身份证号长度错误' }]
      }
    }
  },
  computed: {
    isShowSearchTag() {
      return (this.searchOption.name ||
        this.searchOption.mobilePhone ||
        this.searchOption.date.length > 0 ||
        this.searchOption.submit !== '' &&
        this.searchOption.creatorName)
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
        this.getJobs()
      }
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.PERSON_ENTRY.URL)
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
      if (this.searchOption.date && this.searchOption.date.length > 0) {
        this.searchOption.startDate = this.searchOption.date[0]
        this.searchOption.endDate = this.searchOption.date[1]
      }
      this.get()
    },
    getJobs() {
      const url = this.$root.getApi(API.KEY, API.JOB.URL)
      this.axios.get(`${url}?isEnabled=true`)
        .then(response => {
          this.jobs = response
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
      const url = this.$root.getApi(API.KEY, API.PERSON_ENTRY.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.drawerVisiable = false
            this.get()
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.PERSON_ENTRY.URL)
      this.axios.put(url, this.entity).then(response => {
        if (response.Status) {
          this.get()
        }
      })
    },
    del(row) {
      this.$confirm(`确认要删除 ${row.Name} 入职登记?删除后不可恢复，请谨慎操作！`, '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.PERSON_ENTRY.BATCH_DELETE)
        this.axios.patch(url, [row.Id]).then(response => {
          if (response.Status) {
            this.get()
          }
        })
      })
    },
    reset() {
      this.searchOption.name = ''
      this.searchOption.mobilePhone = ''
      this.searchOption.submit = ''
      this.searchOption.date = []
      this.searchOption.startDate = ''
      this.searchOption.endDate = ''
    },
    invite(row) {
      this.$confirm('是否邀请员工完善入职登记表？', '提示',  {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        const url = window.location.host + `/#/entry-file?Id=${row.Id}`
        navigator.clipboard.writeText(url).then(() => {
          this.$message.success('填写地址已复制到粘贴板，可发送给员工查看填写')
        })
      })
    },
    closeSearchTag(key, val) {
      const index = this[key].findIndex((x) => x == val)
      this[key].splice(index, 1)
    },
    showUpdadteDialog (row) {
      this.entity = row
      this.isAdd = false
      this.dialogVisiable = true
    },
    showDrawer() {
      this.isAdd = true
      this.entity = {}
      this.drawerVisiable = true
    },
    showConfirmDrawer (row) {
      this.entity = row
      this.$set(this.entity, 'EmployeeType', this.employeeTypes[0].label)
      this.$set(this.entity, 'EmployeeStatus', this.employeeStatus[0].label)
      this.confirmDrawerVisiable = true
    },
    confirm () {
      const valid = this.$refs.confirmForm.validate()
      if (valid) {
        const url = this.$root.getApi(API.KEY, API.PERSON_ENTRY.CONFIRM).replace(/{id}/, this.entity.Id)
        this.axios.patch(url, this.entity).then(response => {
          if (response.Status) {
            this.confirmDrawerVisiable = false
            this.get()
          }
        })
      }
    },
    notSupported() {
      this.$message.error('该功能暂未开放')
    }
  },
  created() {
    this.init()
  },
  components: { TeamCascader }
}
</script>

<style lang="scss" scoped>
.entry-box {
  padding: 20px;
  font-size: 14px;
  background: #fff;
}
.entry-box .entry-title .el-button {
  padding: 0;
}
.entry-title {
  display: flex;
  justify-content: space-between;
}
.entry-title-text {
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
::v-deep .el-select__tags {
  white-space: nowrap;
  overflow: hidden;
  flex-wrap: nowrap;
}
.select-btn {
  margin: 10px 0 15px;
}
::v-deep .el-dialog__header {
  border-bottom: 1px solid #e8e8e8;
}
::v-deep .el-dialog__footer {
  border-top: 1px solid #e8e8e8;
}
.dialog-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 16px;
}
.line-from {
  background-color: #e8e8e8;
  height: 1px;
  margin: 30px 0 16px;
  width: 100%;
}
.date-box {
  display: flex;
  align-items: center;
}
.color-red {
  color: #ff4141;
}

.tag-box .mr10 {
  margin-bottom: 5px;
}
::v-deep .el-tabs__item {
  height: 50px;
  line-height: 50px;
}
.content-box {
  padding: 0 20px 0;
}
.qr-title {
  text-align: center;
  color: #171a1d;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  margin-bottom: 20px;
  margin-top: 8px;
}
.mb10 {
  margin-bottom: 10px;
}
.drawer-box {
  position: relative;
}
.job-desc {
  width: 80%;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  line-height: 1.5;
}
.form-box {
  box-sizing: border-box;
  position: relative;
  height: calc(100vh - 66px);
  padding: 20px 0 50px;
  overflow-y: scroll;
}
.btn-box {
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  border-top: 1px solid #e8e8e8;
  background: #fff;
  height: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 24px 10px 12px;
}
</style>
