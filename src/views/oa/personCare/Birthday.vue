<template>
  <el-container v-loading="loading" class="ofa-container column">
    <el-header class="header">
      <span>
        <label class="title">共有{{list.length}}名过生日的员工</label>
      </span>
      <span>
        <team-cascader showRoot v-model="searchOption.teamId" rootName="全部" placeholder="部门" size="small">
        </team-cascader>
        <el-date-picker v-model="searchOption.dates" type="monthrange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" value-format="yyyy-MM-dd" class="date-picker" size="small">
        </el-date-picker>
        <el-button type="primary" @click="search" size="small">
          <font-awesome-icon fas icon="search"></font-awesome-icon>&nbsp;查询
        </el-button>
      </span>
    </el-header>
    <el-main class="content">
      <!-- 主体内容 -->
      <el-table :data="list" class="ofa-table" size="small">
        <el-table-column type="index" width="50" align="center">
        </el-table-column>
        <el-table-column label="姓名" prop="Name">
          <template slot-scope="scope">
            <div class="person-name-box">
              <el-avatar :src="scope.row.IconUrl" fit="contain" class="person-icon">
                {{getSubName(scope.row.Name)}}
              </el-avatar>
              <label style="margin-left:8px;">{{scope.row.Name}}</label>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="职级" prop="Job"></el-table-column>
        <el-table-column label="部门" prop="Teams">
          <template slot-scope="scope">
            <div v-for="item in scope.row.Teams" :key="item.Id">{{item.Name}}</div>
          </template>
        </el-table-column>
        <el-table-column label="员工类型" prop="EmployeeType" width="100"></el-table-column>
        <el-table-column label="员工状态" prop="EmployeeStatus" width="100"></el-table-column>
        <el-table-column label="生日" prop="Birthday" width="100">
          <template
            slot-scope="scope">{{ scope.row.Birthday ? new Date(scope.row.Birthday).toString('MM月dd日') : '' }}</template>
        </el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script>
import API from '../../../apis/oa-api'
import { PERSON_CARE_BIRTHDAY } from '../../../router/oa-router'
import TeamCascader from '../_components/TeamCascader'

// 员工生日
export default {
  name: PERSON_CARE_BIRTHDAY.name,
  data () {
    return {
      loading: false, // 加载中
      searchOption: {
        teamId: this.$store.state.guid,
        dates: [],
        startDate: '',
        endDate: ''
      }, // 搜索条件（关键字）
      list: [] // 列表
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(PERSON_CARE_BIRTHDAY.name)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      if (!this.loading) {
        this.loading = true
        this.searchOption.dates = [new Date(), new Date()]
        this.get()
      }
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.PERSON_CARE.BIRTHDAY)
      if (this.searchOption.dates) {
        this.searchOption.startDate = this.searchOption.dates[0]
        this.searchOption.endDate = this.searchOption.dates[1]
      }
      this.axios.get(url, {
        params: {
          teamId: this.searchOption.teamId,
          startDate: this.searchOption.startDate,
          endDate: this.searchOption.endDate
        }
      }).then(response => {
        this.list = response
        this.loading = false
      })
    },
    search () {
      this.$nextTick(() => { this.get() })
    },
    getSubName (str) {
      return (str && str.length > 0) ? str.substring(0, 1) : 'P'
    }
  },
  mounted () {
    this.init()
  },
  components: { TeamCascader }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  background: #fff;
  justify-content: space-between;
}

.content {
  background: #fff;
}

/deep/ .header {

  .title {
    font-size: 1.25rem;
    font-weight: bold;
    color: #666;
  }

  .search-input {
    width: 200px;
  }

  span > div {
    margin-right: 10px;
  }
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
