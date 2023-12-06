<template>
  <el-container class="ofa-form">
    <el-header content-position="left" class="form-header" shadow="never">
      <div class="header-box">
        <label class="title">钉钉接入设置</label>
        <div>
          <el-button @click="submit" type="primary">保存</el-button>
        </div>
      </div>
    </el-header>
    <el-main class="form-content">
      <el-card content-position="left" shadow="never">
        <div slot="header">
          <span class="card-header-label">基本信息</span>
        </div>
        <el-alert show-icon title="操作提示" type="warning" style="margin-bottom:20px;">
          <ul class="tips">
            <li>钉钉开发接入设置，如不清楚获取方式和API权限配置，请联系开发人员</li>
          </ul>
        </el-alert>
        <el-row type="flex" class="content-row">
          <el-col>
            <el-form status-icon ref="form" :rules="validationRules" :model="entity" :disabled="disabled" class="form"
              label-width="120px">
              <el-form-item label="CompanyId" prop="CompanyId">
                <el-input v-model.trim="entity.CompanyId"></el-input>
              </el-form-item>
              <el-form-item label="AgentId" prop="AgentId">
                <el-input v-model.trim="entity.AgentId"></el-input>
              </el-form-item>
              <el-form-item label="AppKey" prop="AppKey">
                <el-input v-model.trim="entity.AppKey"></el-input>
              </el-form-item>
              <el-form-item label="AppSecret" prop="AppSecret">
                <el-input v-model.trim="entity.AppSecret"></el-input>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col class="r-col">
            <el-divider direction="vertical"></el-divider>
            <el-checkbox v-model="entity.SyncPerson">同步人员档案</el-checkbox>
            <el-checkbox v-model="entity.SyncTeam">同步组织架构</el-checkbox>
          </el-col>
        </el-row>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import API from '../../../apis/oa-api'
import { ACCESS_DINGDING } from '../../../router/oa-router'

// 钉钉接入设置
export default {
  name: ACCESS_DINGDING.name,
  data () {
    return {
      loading: false, // 加载中
      entity: {},
      validationRules: {
        CompanyId: [{ required: true, message: '请先填写CompanyId', trigger: 'blur' }, { min: 2, max: 200, message: '长度在2到200个字符', trigger: 'blur' }],
        AgentId: [{ required: true, message: '请先填写AgentId', trigger: 'blur' }, { min: 2, max: 200, message: '长度在2到200个字符', trigger: 'blur' }],
        AppKey: [{ required: true, message: '请先填写AppKey', trigger: 'blur' }, { min: 2, max: 200, message: '长度在2到200个字符', trigger: 'blur' }],
        AppSecret: [{ required: true, message: '请先填写AppSecret', trigger: 'blur' }, { min: 2, max: 200, message: '长度在2到200个字符', trigger: 'blur' }]
      }
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(ROLE.name)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      if (this.loading) return
      this.get()
    },
    get () {
      this.loading = true
      const url = this.$root.getApi(API.KEY, API.DINGDING_SETTING.URL)
      this.axios.get(`${url}/Top`)
        .then(response => {
          this.entity = response
          this.loading = false
        })
    },
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const url = this.$root.getApi(API.KEY, API.DINGDING_SETTING.URL)
          this.axios.post(url, this.entity)
            .then(response => {
              if (response.Status) this.goBack()
            })
        }
      })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.form-header {
  display: flex;
  align-items: center;
  background: #fff;
}
.header-box {
  display: flex;
  justify-content: space-between;
  width: 100%;

  .title {
    font-size: 20px;
  }
}

.form-content {
  margin-top: 20px;
  padding: 0;

  /deep/ .r-col {
    display: flex;
    .el-divider--vertical {
      height: auto !important;
    }
  }
}
</style>
