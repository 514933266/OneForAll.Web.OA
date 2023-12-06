<template>
  <el-container v-loading="loading" class="ofa-container column">
    <el-header class="header">
      <span>
        <team-cascader showRoot v-model="searchOption.teamId" rootName="全部" placeholder="部门" size="small"></team-cascader>
      </span>
      <span>
        <el-date-picker v-model="searchOption.dates" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" value-format="yyyy-MM-dd" class="date-picker" size="small">
        </el-date-picker>
        <el-input v-model="searchOption.key" class="search-input" placeholder="请输入名称搜索" size="small">
        </el-input>
        <el-button type="primary" @click="search" size="small">
          <font-awesome-icon fas icon="search"></font-awesome-icon>&nbsp;查询
        </el-button>
      </span>
    </el-header>
    <!-- 主体内容 -->
    <el-main class="content">
      <el-table :data="list" class="ofa-table" size="small">
        <el-table-column label="员工姓名" prop="PersonName"></el-table-column>
        <el-table-column label="职级" prop="PersonJob"></el-table-column>
        <el-table-column label="所在部门" prop="TeamName"></el-table-column>
        <el-table-column label="目标部门" prop="TargetTeamName"></el-table-column>
        <el-table-column label="时间" prop="CreateTime">
          <template
            slot-scope="scope">{{ scope.row.CreateTime ? new Date(scope.row.CreateTime).toString('yyyy年MM月dd日') : '' }}</template>
        </el-table-column>
        <el-table-column label="备注" prop="Remark"></el-table-column>
      </el-table>
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex"
        :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange"
        @current-change="pageIndexChange">
      </el-pagination>
    </el-main>
  </el-container>
</template>

<script>
import API from '../../../apis/oa-api'
import { PERSON_HISTORY } from '../../../router/oa-router'
import TeamCascader from '../_components/TeamCascader'

// 人员异动记录
export default {
  name: PERSON_HISTORY.name,
  data () {
    return {
      loading: false, // 加载中
      searchOption: {
        teamId: this.$store.state.guid,
        key: '',
        dates: [],
        startDate: '',
        endDate: ''
      }, // 搜索条件（关键字）
      list: [], // 列表
      total: 1, // 总数据量
      pageIndex: 1, // 页码
      pageSize: 10 // 页数
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(PERSON_HISTORY.name)
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
      const url = this.$root.getApi(API.KEY, API.PERSON_HISTORY.URL)
      if (this.searchOption.dates) {
        this.searchOption.startDate = this.searchOption.dates[0]
        this.searchOption.endDate = this.searchOption.dates[1]
      }
      this.axios.get(`${url}/${this.pageIndex}/${this.pageSize}`, {
        params: this.searchOption
      }).then(response => {
        this.total = response.Total
        this.list = response.Items
        this.loading = false
      })
    },
    pageSizeChange (value) {
      this.pageSize = value
      this.$nextTick(() => { this.get() })
    },
    pageIndexChange (value) {
      this.pageIndex = value
      this.$nextTick(() => { this.get() })
    },
    search () {
      this.$nextTick(() => { this.get() })
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

  .search-input {
    width: 200px;
  }

  span > div {
    margin-right: 10px;
  }
}
</style>
