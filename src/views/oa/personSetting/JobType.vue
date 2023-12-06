<template>
  <el-container v-loading="loading" class="ofa-container column">
    <el-header class="header">
      <span>
        <span class="title">岗位类别<span class="sub-title" style="margin-left: 10px;">共有<label class="ofa-text-primary"> {{list.length}} </label>条数据</span></span>
      </span>
      <span>
        <el-button @click="showAddDialog" type="primary" size="small">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增类别
        </el-button>
      </span>
    </el-header>
    <el-main class="content">
      <!-- 主体内容 -->
      <el-table :data="list" class="ofa-table" size="small">
        <el-table-column type="index" width="50" align="center">
        </el-table-column>
        <el-table-column label="类别名称" prop="Name"></el-table-column>
        <el-table-column label="备注" prop="Remark"></el-table-column>
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button @click="showUpdateDialog(scope.row)" type="text" size="small">编辑</el-button>
            <el-button @click="del(scope.row)" type="text" class="ofa-text-danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
    <!-- 弹窗：添加类别 -->
    <el-dialog :title="isAdd ? '添加类别' : '修改类别'" :visible.sync="dialogVisible" width="30%" custom-class="ofa-dialog">
      <el-form :model="entity" :rules="validationRule" ref="typeForm" label-width="120px">
        <el-form-item prop="Name" label="类别名称:">
          <el-input v-model.trim="entity.Name" size="small" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item prop="Remark" label="备注:">
          <el-input v-model="entity.Remark" :rows="4" type="textarea" size="small" placeholder="请输入备注内容"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="submit" size="small">确 定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>
  
<script>
import API from '../../../apis/oa-api'
import {
  PERSON_SETTING_JOB_TYPE
} from '../../../router/oa-router'

// 岗位类别
export default {
  name: PERSON_SETTING_JOB_TYPE.name,
  data() {
    return {
      loading: false, // 加载中
      isAdd: false, // 是否添加模式
      dialogVisible: false, // 显示弹窗
      searchOption: {
        name: ''
      }, // 搜索条件（关键字）
      list: [], // 列表
      entity: {},
      validationRule: {
        Name: [{ required: true, message: '请先填写类别名称' }, { min: 2, max: 20, message: '类别名称长度在2~20之间' }],
        Remark: [{ min:2, max: 500, message: '备注长度在2到500个字符以内' }]
      },
    }
  },
  computed: {
    permissions() {
      return this.$root.getPermissions(PERSON_SETTING_JOB_TYPE.name)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init() {
      if (!this.loading) {
        this.loading = true
        this.get()
      }
    },
    get() {
      const url = this.$root.getApi(API.KEY, API.JOB_TYPE.URL)
      this.axios.get(url)
        .then(response => {
          this.list = response
          this.loading = false
        })
    },
    showAddDialog() {
      this.isAdd = true
      this.entity = {}
      this.dialogVisible = true
    },
    showUpdateDialog(row) {
      this.isAdd = false
      this.entity = row
      this.dialogVisible = true
    },
    submit() {
      const valid = this.$refs.typeForm.validate()
      if (valid) {
        if (this.isAdd) {
          this.add()
        } else {
          this.update()
        }
      }
    },
    add() {
      const url = this.$root.getApi(API.KEY, API.JOB_TYPE.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.dialogVisible = false
            this.get()
          }
        })
    },
    update() {
      const url = this.$root.getApi(API.KEY, API.JOB_TYPE.URL)
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.dialogVisible = false
            this.get()
          }
        })
    },
    del(entity) {
      this.$confirm('确认删除当前类别？', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.JOB_TYPE.BATCH_DELETE)
        this.axios.patch(url, [entity.Id])
          .then(response => {
            if (response.Status) {
              this.get()
            }
          })
      })
    }
  },
  created() {
    this.init()
  }
}
</script>
  
<style lang="scss"scoped>
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

  span>div {
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
  