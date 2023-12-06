<template>
  <el-container v-loading="loading" class="ofa-container column contract-box">
    <!-- 头部条 -->
    <div class="contract-title">
      <div class="contract-title-text">合同管理</div>
    </div>
    <!-- desc -->
    <div class="title-desc">近2个月即将到期和已到期员工（共{{list.length}}人）</div>
    <!-- 搜索 -->
    <div class="search-box">
      <div>
        <team-cascader v-model="searchOption.teamId" placeholder="请选择部门" size="small"> </team-cascader>
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
      <el-table-column prop="ContractFirstDate" label="现合同起始日" width="160">
        <template slot-scope="scope">
          {{ new Date(scope.row.ContractFirstDate).toString('yyyy-MM-dd') }}
        </template>
      </el-table-column>
      <el-table-column prop="ContractEndDate" label="现合同到期日" width="160">
        <template slot-scope="scope">
          {{ new Date(scope.row.ContractEndDate).toString('yyyy-MM-dd') }}
        </template>
      </el-table-column>
      <el-table-column prop="ContractCompany" label="合同公司"> </el-table-column>
      <el-table-column prop="ContractType" label="合同类型" width="160"> </el-table-column>
    </el-table>
  </el-container>
</template>

<script>
import API from '../../../apis/oa-api'
import { PERSON_CONTRACT } from '../../../router/oa-router'
import TeamCascader from '../_components/TeamCascader'

// 人员合同管理
export default {
  name: PERSON_CONTRACT.name,
  data() {
    return {
      searchOption: {
        teamId: '' // 员工姓名
      },
      loading: false, // 加载中
      list: []
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
      const url = this.$root.getApi(API.KEY, API.PERSON_CONTRACT.URL)
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
    getSubName (str) {
      return (str && str.length > 0) ? str.substring(0, 1) : 'P'
    }
  },
  created() {
    this.init()
  },
  components: { TeamCascader }
}
</script>

<style lang="scss" scoped>
.contract-box {
  padding: 20px;
  font-size: 14px;
  background: #fff;
}
.contract-box .contract-title .el-button {
  padding: 0;
}
.contract-title {
  display: flex;
  justify-content: space-between;
}
.contract-title-text {
  color: #151515;
  font-family: PingFangSC-Medium;
  font-size: 18px;
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
