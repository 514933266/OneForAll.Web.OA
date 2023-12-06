<template>
  <el-container v-loading="loading"  class="ofa-container column formal-box">
    <!-- 头部条 -->
    <div class="formal-title">
      <div class="formal-title-text">转正管理</div>
      <div>
        <el-button type="text" size="small">
          <i class="el-icon-view"></i>
          查看最近转正的人
        </el-button>
      </div>
    </div>
    <!-- desc -->
    <div class="title-desc">试用期员工（共1人）</div>
    <!-- 搜索 -->
    <div class="search-box">
      <div>
        <el-input v-model="searchOption.name" class="mr10" placeholder="搜索员工" suffix-icon="el-icon-search" style="width: 20%" size="small">
        </el-input>
        <team-cascader v-model="searchOption.teamId" class="mr10" placeholder="请选择部门" size="small"> </team-cascader>
        <el-date-picker v-model="searchOption.actualDate" class="mr10" type="daterange" range-separator="~" start-placeholder="实际转正"
          end-placeholder="实际转正" style="width: 20%" value-format="yyyy-MM-dd" size="small">
        </el-date-picker>
        <el-date-picker v-model="searchOption.planDate" class="mr10" type="daterange" range-separator="~" start-placeholder="计划转正"
          end-placeholder="计划转正" style="width: 20%" value-format="yyyy-MM-dd" size="small">
        </el-date-picker>
      </div>
      <div>
        <el-button type="primary" @click="search" size="small">查询</el-button>
      </div>
    </div>
    <!-- 表格区域 -->
    <el-table :data="list" class="ofa-table" size="small">
      <el-table-column prop="Name" label="姓名">
        <template slot-scope="scope">
          <div class="person-name-box">
            <el-avatar :src="(domain + scope.row.IconUrl)" fit="contain" class="person-icon">
              {{getSubName(scope.row.Name)}}
            </el-avatar>
            <label style="margin-left:8px;">{{scope.row.Name}}</label>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="TeamName" label="部门"> </el-table-column>
      <el-table-column prop="Job" label="职位">
      </el-table-column>
      <el-table-column prop="EmployeeType" label="员工类型">
      </el-table-column>
      <el-table-column prop="EntryDate" label="入职日期" width="160">
        <template slot-scope="scope">{{new Date(scope.row.EntryDate).toString('yyyy-MM-dd') }}</template>
      </el-table-column>
      <el-table-column prop="TryDate" label="试用期" width="160">
      </el-table-column>
      <el-table-column prop="PlanEntryDate" label="计划转正日期" width="160">
        <template slot-scope="scope">{{new Date(scope.row.PlanEntryDate).toString('yyyy-MM-dd') }}</template>
      </el-table-column>
      <el-table-column prop="ActualEntryDate" label="实际转正日期" width="160">
        <template slot-scope="scope">{{new Date(scope.row.ActualEntryDate).toString('yyyy-MM-dd') }}</template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="120">
        <template slot-scope="scope">
          <el-button type="text" @click="showDrawer(scope.row)">办理转正</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 抽屉 -->
    <el-drawer :visible.sync="drawerVisiable" :modal="false" :show-closeSearchTag="false" direction="rtl" size="380px"
      class="ofa-drawer">
      <div slot="title">
        <span class="title">办理转正</span><label class="title-tips">Formal</label>
      </div>
      <el-form ref="form" :model="entity" :rules="validationRule" label-width="120px" label-position="right" size="small">
        <el-form-item label="姓名：">
          <div>{{entity.Name}}</div>
        </el-form-item>
        <el-form-item label="入职日期：">
          <div>{{entity.EntryDate}}</div>
        </el-form-item>
        <el-form-item label="实际转正日期：">
          <el-date-picker type="date" placeholder="选择日期" v-model="entity.ActualEntryDate">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div class="footer">
        <el-button type="primary" @click="submit" size="small">
          <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;确认转正
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
import { PERSON_FORMAL } from '../../../router/oa-router'
import TeamCascader from '../_components/TeamCascader'

// 转正管理
export default {
  name: PERSON_FORMAL.name,
  data() {
    return {
      searchOption: {
        name: '', // 姓名
        planDate: [], // 计划转正
        actualDate: [], // 实际转正
        planStartDate: '', // 计划转正-开始日期
        planEndDate: '', // 计划转正-开始日期
        actualStartDate: '', // 实际转正-开始日期
        actualEndDate: '', // 实际转正-开始日期
        teamId: '' // 所属部门
      },
      loading: false, // 加载中
      drawerVisiable: false, // 显示抽屉
      list: [],
      entity: {},
      validationRule: {
        ActualEntryDate: [{ required: true, message: '请先选择实际转正日期' }]
      }
    }
  },
  computed: {
    domain () {
      return this.$root.getApiDomain(API.KEY)
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
      const url = this.$root.getApi(API.KEY, API.PERSON_FORMAL.URL)
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
      if (this.searchOption.planDate && this.searchOption.planDate.length > 0) {
        this.searchOption.planStartDate = this.searchOption.planDate[0]
        this.searchOption.planEndDate = this.searchOption.planDate[1]
      }
      if (this.searchOption.actualDate && this.searchOption.actualDate.length > 0) {
        this.searchOption.actualStartDate = this.searchOption.actualDate[0]
        this.searchOption.actualDate = this.searchOption.actualDate[1]
      }
      this.get()
    },
    getSubName (str) {
      return (str && str.length > 0) ? str.substring(0, 1) : 'P'
    },
    showDrawer(row) {
      this.entity = row
      this.drawerVisiable = true
    },
    submit () {
      const valid = this.$refs.form.validate()
      if (valid) {
        this.confirm()
      }
    },
    confirm () {
      const valid = this.$refs.form.validate()
      if (valid) {
        const url = this.$root.getApi(API.KEY, API.PERSON_FORMAL.CONFIRM).replace(/{id}/, this.entity.Id)
        this.axios.patch(url, this.entity).then(response => {
          if (response.Status) {
            this.drawerVisiable = false
            this.get()
          }
        })
      }
    },
  },
  created() {
    this.init()
  },
  components: { TeamCascader }
}
</script>

<style lang="scss" scoped>
.user-icon {
  display: flex;
  align-items: center;

  label {
    margin-left: 10px;
  }
}

.formal-box {
  padding: 20px;
  font-size: 14px;
  background: #fff;
}

.formal-box .formal-title .el-button {
  padding: 0;
}

.formal-title {
  display: flex;
  justify-content: space-between;
}

.formal-title-text {
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

.flex-c {
  display: flex;
  align-items: center;
}

.mb10 {
  margin-bottom: 10px;
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
</style>
