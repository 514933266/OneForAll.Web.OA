<template>
  <el-container v-loading="loading" class="ofa-container column">
    <el-header class="header">
      <span>
        <span class="title">团队分类<span class="sub-title" style="margin-left: 10px;">共有<label class="ofa-text-primary">
              {{list.length}} </label>条数据</span></span>
      </span>
      <span class="search-box">
        <search-input v-model="seachOption.key" class="search-input" placeholder="请输入分类名称搜索">
        </search-input>
        <el-button type="primary" @click="showAddDrawer" size="small">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增分类
        </el-button>
      </span>
    </el-header>
    <!-- 主体内容 -->
    <el-table :data="list" class="ofa-table">
      <el-table-column type="index" width="50" align="center">
      </el-table-column>
      <el-table-column label="类型名称" prop="Name"></el-table-column>
      <el-table-column label="允许创建子级" width="160" align="center">
        <template slot-scope="scope">{{ scope.row.CanAddChild ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template slot-scope="scope">
          <el-button @click="showUpdateDrawer(scope.row)" type="text">编辑</el-button>
          <el-button @click="del(scope.row)" type="text" class="ofa-text-danger hover">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 抽屉 -->
    <el-drawer :visible.sync="drawerVisiable" :modal="false" :show-close="false" direction="rtl" size="380px"
      class="ofa-drawer">
      <div slot="title">
        <span class="title">添加团队类型</span><label class="title-tips">Team Type</label>
      </div>
      <div>
        <el-form :model="entity" :rules="validationRule" label-width="120px" class="form" ref="form">
          <el-form-item label="类型名称" prop="Name">
            <el-input v-model.trim="entity.Name" placeholder="姓名" size="small"></el-input>
          </el-form-item>
          <el-form-item label="允许创建子级" prop="CanAddChild">
            <el-checkbox v-model="entity.CanAddChild" size="small"></el-checkbox>
          </el-form-item>
        </el-form>
      </div>
      <div class="footer">
        <el-button type="primary" @click="submit" size="small">
          <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;添加
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
import { TEAM_TYPE } from '../../../router/oa-router'

export default {
  name: TEAM_TYPE.name,
  data () {
    return {
      isAdd: false, // 是否添加模式
      loading: false, // 加载中
      drawerVisiable: false, // 抽屉
      seachOption: {
        key: '', // 搜索条件（关键字）
        type: -1
      },
      entity: {}, // 人员实体
      list: [], // 列表
      selectionList: [], // 选中的人员列表
      validationRule: {
        Name: [{ required: true, message: '请先填写类型名称' }, { min: 2, max: 20, message: '型名称长度在2~20之间' }]
      }
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(TEAM_TYPE.name)
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
      const url = this.$root.getApi(API.KEY, API.TEAM_TYPE.URL)
      this.axios.get(url, {
        params: {
          key: this.seachOption.key
        }
      }).then(response => {
        this.list = response
        this.loading = false
      })
    },
    search () {
      this.$nextTick(() => { this.get() })
    },
    selectionChange (rows) {
      this.selectionList = rows
    },
    showAddDrawer () {
      this.isAdd = true
      this.entity = {}
      this.drawerVisiable = true
    },
    showUpdateDrawer (row) {
      this.isAdd = false
      this.entity = row
      this.drawerVisiable = true
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
      const url = this.$root.getApi(API.KEY, API.TEAM_TYPE.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) this.cancel()
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.TEAM_TYPE.URL)
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.get()
          }
        })
    },
    del (row) {
      this.$confirm('确认要删除选中类型?删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.TEAM_TYPE.BATCH_DELETE)
        this.axios.patch(url, [row.Id]).then(response => {
          if (response.Status) {
            this.get()
          }
        })
      })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  background: #fff;
  justify-content: space-between;

  .title {
    font-size: 1.25rem;
    font-weight: bold;
    color: #666;
  }

  .search-input {
    margin-right: 10px;
  }

  .search-box {
    display: flex;
  }
}
</style>