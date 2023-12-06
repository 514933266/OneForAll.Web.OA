<template>
  <el-container v-loading="loading" class="ofa-container column">
      <div class="header">
        <el-col class="count-box">
          <div class="count-item">
            <font-awesome-icon fas icon="users" class="icon ofa-text-primary"></font-awesome-icon>
            <div class="r-label">
              <h1>{{statisticEntity.TotalOnJobCount}}</h1>
              <label>在职员工</label>
            </div>
          </div>
        </el-col>
        <el-col class="count-box">
          <div class="count-item">
            <font-awesome-icon fas icon="user-tie" class="icon ofa-text-warning"></font-awesome-icon>
            <div class="r-label">
              <h1>{{statisticEntity.NormalCount}}</h1>
              <label>全职员工</label>
            </div>
          </div>
        </el-col>
        <el-col class="count-box">
          <div class="count-item">
            <font-awesome-icon fas icon="user-clock" class="icon ofa-text-success"></font-awesome-icon>
            <div class="r-label">
              <h1>{{statisticEntity.TrialCount}}</h1>
              <label>试用员工</label>
            </div>
          </div>
        </el-col>
        <el-col class="count-box">
          <div class="count-item">
            <font-awesome-icon fas icon="user-graduate" class="icon ofa-text-danger"></font-awesome-icon>
            <div class="r-label">
              <h1>{{statisticEntity.InternCount}}</h1>
              <label>实习生</label>
            </div>
          </div>
        </el-col>
      </div>
      <div class="w-p">
        <el-button type="text" class="ofa-button" @click="toPersonSettingPage" size="small">
          <font-awesome-icon fas icon="cog"></font-awesome-icon>&nbsp;自定义档案字段设置
        </el-button>
        <el-divider direction="vertical"></el-divider>
        <el-button type="text" class="ofa-button" @click="exportExcelDialogVisiable = true" size="small">
          <font-awesome-icon fas icon="file-export"></font-awesome-icon>&nbsp;导出
        </el-button>
        <el-divider direction="vertical"></el-divider>
        <el-upload action="" :http-request="importExcel" :show-file-list="false" ref="uploadExcel" accept="">
          <el-button type="text" class="ofa-button" size="small">
            <font-awesome-icon fas icon="file-import"></font-awesome-icon>&nbsp;导入人员信息
          </el-button>
        </el-upload>
      </div>
      <div class="w-p-2">
        <span>
          <el-button class="ofa-button" @click="showDrawer" size="small">
            <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增人员
          </el-button>
        </span>
        <span class="search-box">
          <el-select v-model="searchOption.onJobStatus" class="type-select" size="small">
            <el-option :value="-1" label="全部"></el-option>
            <el-option :value="0" label="在职"></el-option>
            <el-option :value="1" label="离职"></el-option>
          </el-select>
          <el-input v-model="searchOption.key" class="search-input" placeholder="请输入名称搜索" size="small">
          </el-input>
          <el-button type="primary" @click="search" size="small">
            <font-awesome-icon fas icon="search"></font-awesome-icon>&nbsp;查询
          </el-button>
        </span>
      </div>
      <!-- 主体内容 -->
      <el-table :data="list" class="ofa-table" size="small">
        <el-table-column width="50" align="center" fixed>
          <template slot="header">
            <el-tooltip class="item" effect="dark" content="设置表头" placement="top">
              <font-awesome-icon @click="settingDrawerVisiable = true" fas icon="cog" style="cursor:pointer;">
              </font-awesome-icon>
            </el-tooltip>
          </template>
          <template slot-scope="scope">{{ scope.$index + 1 + (pageIndex - 1) * pageSize }}</template>
        </el-table-column>
        <div v-if="!showCustomerTableField">
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
          <el-table-column label="手机" prop="MobilePhone"></el-table-column>
          <el-table-column label="邮箱" prop="Email"></el-table-column>
          <el-table-column label="入职日期">
            <template
              slot-scope="scope">{{ scope.row.EntryDate ? new Date(scope.row.EntryDate).toString('yyyy年MM月dd日') : '' }}</template>
          </el-table-column>
        </div>
        <div v-else>
          <el-table-column v-for="col in checkedFieldList" :key="col.Id" :prop="col.Name" :label="col.Text">
            <template slot-scope="scope">
              <div v-if="col.Name === 'Name'" class="person-name-box">
                <el-avatar :src="(domain + scope.row.IconUrl)" fit="contain" class="person-icon">
                  {{getSubName(scope.row.Name)}}
                </el-avatar>
                <label style="margin-left:8px;">{{scope.row.Name}}</label>
              </div>
              <label v-else>{{scope.row[col.Name]}}</label>
            </template>
          </el-table-column>
        </div>
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button @click="update(scope.row)" type="text" size="small">编辑</el-button>
            <el-button @click="del(scope.row)" type="text" class="ofa-text-danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex"
        :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange"
        @current-change="pageIndexChange">
      </el-pagination>
    <!-- 人员抽屉 -->
    <el-drawer :visible.sync="drawerVisiable" :modal="false" :show-close="false" direction="rtl" size="380px"
      class="ofa-drawer">
      <div slot="title">
        <span class="title">添加人员</span><label class="title-tips">Person</label>
      </div>
      <div>
        <el-form :model="entity" :rules="validationRule" label-width="120px" class="form" ref="form" size="small">
          <el-form-item label="姓名" prop="Name">
            <el-input v-model.trim="entity.Name" placeholder="姓名"></el-input>
          </el-form-item>
          <el-form-item label="性别" prop=" Sex">
            <el-radio-group v-model="entity.Sex">
              <el-radio :label="false">女</el-radio>
              <el-radio :label="true">男</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="职级" prop="Job">
            <el-select clearable v-model="entity.Job" placeholder="岗位职级" size="small">
              <el-option v-for="item in jobs" :key="item.Id" :label="item.Name" :value="item.Name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="手机" prop="MobilePhone">
            <el-input v-model.trim="entity.MobilePhone" placeholder="联系手机"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="Email">
            <el-input v-model.trim="entity.Email" placeholder="电子邮箱"></el-input>
          </el-form-item>
          <el-form-item label="身份证" prop="IdCard">
            <el-input v-model="entity.IdCard" placeholder="身份证"></el-input>
          </el-form-item>
          <el-divider content-position="left">入职信息</el-divider>
          <el-form-item label="工号" prop="WorkNumber">
            <el-input v-model="entity.WorkNumber" placeholder="工号"></el-input>
          </el-form-item>
          <el-form-item label="入职时间" prop="EntryDate">
            <el-date-picker v-model="entity.EntryDate" value-format="yyyy-MM-dd" type="date" placeholder="入职时间">
            </el-date-picker>
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
      </div>
      <div class="footer">
        <el-button type="primary" @click="submit">
          <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;添加
        </el-button>
        <el-button type="warning" @click="drawerVisiable = false">
          取消
        </el-button>
      </div>
    </el-drawer>
    <!-- 字段抽屉 -->
    <el-drawer ref="fieldSettingDrawer" :visible.sync="settingDrawerVisiable" :modal="false" :show-close="false"
      direction="rtl" size="380px" class="ofa-drawer">
      <div slot="title">
        <span class="title">自定义表头</span><label class="title-tips">Column Setting</label>
      </div>
      <div class="field-container">
        <div class="title ofa-text-title">已选择字段<label class="ofa-text-remark title-tips">可拖拽标签调整顺序</label></div>
          <draggable v-model="checkedFieldList" class="field-checked-box">
            <el-tag v-for="field in checkedFieldList" :key="field.id" closable @close="closeSettingFieldTag(field)"
              effect="dark" class="field-checked-tag" size="small">{{field.Text}}</el-tag>
          </draggable>
        <div class="title ofa-text-title">档案字段</div>
        <div v-for="item in fieldSettingList" :key="item.Id" class="field-box">
          <div class="field-title-box ofa-bg-watermark">
            <el-tooltip class="item" effect="dark" :content="item.tooltips" placement="top">
              <el-checkbox v-model="item.checked" :indeterminate="item.isIndeterminate" :label="item.Text"
                :disabled="item.disabled" @change="checkAllField(item)" size="small"></el-checkbox>
            </el-tooltip>
            <font-awesome-icon fas :icon="item.collapsed ? 'caret-up' : 'caret-down'" style="cursor:pointer;"
              @click="item.collapsed = !item.collapsed" class="ofa-text-grey"></font-awesome-icon>
          </div>
          <el-collapse-transition>
            <div v-show="!item.collapsed" class="field-checkbox-box">
              <el-tooltip v-for="field in item.Fields" :key="field.Id" class="item" effect="dark"
                :content="field.tooltips" placement="top">
                <el-checkbox v-model="field.checked" :label="field.Text" :disabled="field.disabled"
                  @change="checkSettingField(field, item)" size="small">
                </el-checkbox>
              </el-tooltip>
            </div>
          </el-collapse-transition>
        </div>
      </div>
      <div class="footer">
        <el-button type="primary" @click="saveSettingField" size="small">
          <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;保存
        </el-button>
        <el-button type="warning" @click="settingDrawerVisiable = false" size="small">
          取消
        </el-button>
      </div>
    </el-drawer>
    <!-- 导出人员档案弹窗 -->
    <el-dialog custom-class="ofa-dialog" title="导出人员资料" :visible.sync="exportExcelDialogVisiable" width="80%">
      <el-alert :closable="false" title="请选择要导出的人员信息字段，如不选择将会按照默认信息导出" type="warning">
      </el-alert>
      <el-form :model="exportParameter" label-width="120px" class="export-form" style="margin-top:10px;" size="small">
        <el-form-item label="员工类型" prop="EmployeeType">
          <el-select v-model="exportParameter.EmployeeType" placeholder="员工类型">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in employeeTypes" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="员工状态" prop="EmployeeStatus">
          <el-select v-model="exportParameter.EmployeeStatus" placeholder="员工状态">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in employeeStatus" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="在职状态" prop="OnJobStatus">
          <el-select v-model="exportParameter.OnJobStatus" class="type-select">
            <el-option :value="-1" label="全部"></el-option>
            <el-option :value="0" label="在职"></el-option>
            <el-option :value="1" label="离职"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="入职时间" prop="EntryDate">
          <el-date-picker v-model="exportParameter.EntryDate" value-format="yyyy-MM-dd" type="daterange"
            start-placeholder="开始日期" end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="职级" prop="Job">
          <el-input v-model.trim="exportParameter.Jobs" placeholder="岗位职级，多个职级可用空格或,隔开"></el-input>
        </el-form-item>
        <el-form-item label="导出字段" prop="Job">
          <div v-for="item in fieldSettingList" :key="item.Id" class="field-box">
            <div v-if="!item.disabled">
              <div class="field-check-box">
                <div v-for="field in item.Fields" :key="field.Id">
                  <el-checkbox v-model="field.checked" :label="field.Text" :disabled="field.disabled">
                  </el-checkbox>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="exportExcelDialogVisiable = false" size="small">取消</el-button>
        <el-button type="primary" @click="exportExcel" size="small">确 定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
import API from '../../../apis/oa-api'
import BASE_API from '../../../apis/base-api'
import { PERSON_EMPLOYEE_TYPE, PERSON_EMPLOYEE_STATUS } from '../../../assets/js/oa-const'
import { PERSON, PERSON_FORM, PERSON_SETTING } from '../../../router/oa-router'
import draggable from 'vuedraggable'

// 人员档案
export default {
  name: PERSON.name,
  data () {
    return {
      employeeTypes: PERSON_EMPLOYEE_TYPE, // 员工类型
      employeeStatus: PERSON_EMPLOYEE_STATUS, // 员工状态
      loading: false, // 加载中
      drawerVisiable: false, // 是否显示部门抽屉
      settingDrawerVisiable: false, // 是否显示字段抽屉
      exportExcelDialogVisiable: false, // 显示导出人员档案弹窗
      searchOption: {
        key: '', // 搜索条件（关键字）
        onJobStatus: -1
      },
      entity: {}, // 人员实体
      statisticEntity: {}, // 统计数据
      exportParameter: {
        OnJobStatus: -1,
        EmployeeStatus: '',
        EmployeeType: '',
        Job: '',
        Fields: []
      }, // 导出的请求参数
      list: [], // 人员资料列表
      jobs: [], // 职级
      selectionList: [], // 选中的人员列表
      fieldList: [], // 所有设置的字段名
      fieldSettingList: [], // 字段设置
      exportFieldSettingList: [], // 导出字段设置
      checkedFieldList: [], // 选中的字段
      personalFieldSetting: { Target: 0, VisiableFields: [] }, // 当前用户选中的字段
      total: 1, // 总数据量
      pageIndex: 1, // 页码
      pageSize: 10, // 页数
      validationRule: {
        Name: [{ required: true, message: '请先填写员工姓名' }, { min: 2, max: 20, message: '员工姓名长度在2~20之间' }],
        Job: [{ required: true, message: '请先填写岗位职级' }, { min: 2, max: 20, message: '岗位职级长度在2~20之间' }],
        MobilePhone: [{ min: 11, max: 20, message: '手机号码长度错误' }]
      }
    }
  },
  computed: {
    domain () {
      return this.$root.getApiDomain(BASE_API.KEY)
    },
    permissions () {
      return this.$root.getPermissions(PERSON.name)
    },
    showCustomerTableField () {
      return this.checkedFieldList.length > 0
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      this.checkedFieldList = []
      if (!this.loading) {
        this.loading = true
        this.getJobs()
        this.getStatistic()
        this.getPersonalFieldSetting()
      }
    },
    getStatistic () {
      const url = this.$root.getApi(API.KEY, API.PERSON.STATISTIC)
      this.axios.get(url).then(response => {
        this.statisticEntity = response
      })
    },
    getPersonalFieldSetting () {
      const url = this.$root.getApi(API.KEY, API.TABLE_SETTING.URL) + '?target=0'
      this.axios.get(url).then(response => {
        this.personalFieldSetting = { Target: 0, VisiableFields: [], ...response }
        this.getFieldSettings()
      })
    },
    getFieldSettings () {
      const url = this.$root.getApi(API.KEY, API.SETTING.URL)
      this.axios.get(url).then(response => {
        response.forEach(e => {
          this.$set(e, 'tooltips', e.Text)
          this.$set(e, 'collapsed', false)
          this.$set(e, 'isIndeterminate', false)
          if (e.IsGrouped) {
            this.$set(e, 'disabled', true)
            this.$set(e, 'tooltips', `${e.Text}：该分组中字段支持按组添加，无法在列表中展示`)
          } else if (e.Fields.findIndex(w => w.Type !== 7) < 0) {
            this.$set(e, 'disabled', true)
            this.$set(e, 'tooltips', `${e.Text}：该分组中字段为附件类字段，无法在列表中展示`)
          }
          e.Fields.forEach(field => {
            this.fieldList.push(field)
            this.$set(field, 'tooltips', field.Text)
            this.$set(field, 'checked', false)
            if (field.Type === 7) {
              // 附件类型不可选
              this.$set(field, 'disabled', true)
              this.$set(field, 'tooltips', `${field.Text}：该字段为附件类字段，无法在列表中展示`)
            } else if (e.IsGrouped) {
              // 分组类型不可选
              this.$set(field, 'disabled', true)
              this.$set(field, 'tooltips', `${field.Text}：该字段支持按组添加，无法在列表中展示`)
            }
            var checkIndex = this.personalFieldSetting.VisiableFields.findIndex(w => w === field.Name)
            if (this.personalFieldSetting.VisiableFields && checkIndex > -1) {
              this.$set(field, 'checked', true)
              this.checkSettingField(field, e)
            }
          })
        })
        this.fieldSettingList = response
        this.exportFieldSettingList = Object.assign([], response)
        // 对选中标签重新排序
        this.resortCheckedFieldList()
        this.get()
      })
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.PERSON.URL)
      this.axios.get(`${url}/${this.pageIndex}/${this.pageSize}`, {
        params: {
          key: this.searchOption.key,
          onJobStatus: this.searchOption.onJobStatus
        }
      }).then(response => {
        response.Items.forEach(e => {
          // 根据字段配置解析ExtendInformations数据（人员信息明细）
          this.fieldList.forEach(field => {
            const info = e.ExtendInformations.find(w => w.Name === field.Name)
            let val = info ? info.Value : -1
            if (field.TypeDetails && val !== -1) {
              const item = field.TypeDetails[info.Value]
              if (item) val = item.Value
            }
            this.$set(e, field.Name, val)
          })
        })
        this.total = response.Total
        this.list = response.Items
        this.loading = false
      })
    },
    getJobs() {
      const url = this.$root.getApi(API.KEY, API.JOB.URL)
      this.axios.get(`${url}?isEnabled=true`)
        .then(response => {
          this.jobs = response
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
      this.pageIndex = 1
      this.$nextTick(() => { this.get() })
    },
    getSubName (str) {
      return (str && str.length > 0) ? str.substring(0, 1) : 'P'
    },
    selectionChange (rows) {
      this.selectionList = rows
    },
    resortCheckedFieldList () {
      this.checkedFieldList.sort((a, b) => {
        const prev = this.personalFieldSetting.VisiableFields.indexOf(a.Name)
        const next = this.personalFieldSetting.VisiableFields.indexOf(b.Name)
        return prev - next
      })
    },
    checkAllField (setting) {
      setting.Fields.forEach(e => {
        e.checked = setting.checked
        this.checkSettingField(e, setting)
      })
    },
    checkSettingField (field, setting) {
      if (!setting) setting = this.findFieldSetting(field)
      if (field.checked) {
        this.checkedFieldList.push(field)
      } else {
        this.removeCheckedSettingField(field)
      }
      this.updateSettingIndeterminate(setting)
    },
    closeSettingFieldTag (field) {
      field.checked = false
      const setting = this.findFieldSetting(field)
      this.removeCheckedSettingField(field)
      this.updateSettingIndeterminate(setting)
    },
    removeCheckedSettingField (field) {
      const index = this.checkedFieldList.findIndex(w => w.Id === field.Id)
      if (index > -1) {
        this.checkedFieldList.splice(index, 1)
      }
    },
    findFieldSetting (field) {
      for (let i = 0; i < this.fieldSettingList.length; i++) {
        const element = this.fieldSettingList[i]
        const index = element.Fields.findIndex(w => w.Id === field.Id)
        if (index > -1) return element
      }
      return null
    },
    updateSettingIndeterminate (setting) {
      if (!setting) return false
      // 更新部分选择状态
      const isIndeterminate = setting.Fields.findIndex(w => !w.checked) > -1 && setting.Fields.findIndex(w => w.checked) > -1
      setting.isIndeterminate = isIndeterminate
    },
    showDrawer () {
      this.entity = { Sex: true, EmployeeType: this.employeeTypes[0].label, EmployeeStatus: this.employeeStatus[0].label }
      this.drawerVisiable = true
    },
    submit () {
      const valid = this.$refs.form.validate()
      if (valid) {
        this.add()
      }
    },
    add () {
      const url = this.$root.getApi(API.KEY, API.PERSON.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.get()
            this.getStatistic()
          }
        })
    },
    update (entity) {
      this.toFormPage(entity)
    },
    del (entity) {
      this.$confirm(`确认要删除${entity.Name}人员资料?删除后不可恢复，请谨慎操作！`, '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.PERSON.BATCH_DELETE)
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) {
            this.get()
          }
        })
      })
    },
    importExcel (data) {
      const formData = new FormData()
      formData.append('files', data.file, data.filename)
      const url = this.$root.getApi(API.KEY, API.PERSON.EXCEL)
      this.axios.post(url, formData).then(response => {
        if (response.Status) {
          this.get()
        }
      })
    },
    exportExcel () {
      let fields = []
      this.exportFieldSettingList.forEach(e => {
        const checkedList = e.Fields.filter(w => w.checked).map(m => { return m.Name })
        if (checkedList && checkedList.length > 0) {
          fields = fields.concat(checkedList)
        }
      })

      const startEntryDate = this.exportParameter.EntryDate ? this.exportParameter.EntryDate[0] : ''
      const endEntryDate = this.exportParameter.EntryDate ? this.exportParameter.EntryDate[1] : ''
      const url = this.$root.getApi(API.KEY, API.PERSON.EXCEL)
      this.axios.get(url, {
        params: { ...this.exportParameter, Fields: fields, StartEntryDate: startEntryDate, EndEntryDate: endEntryDate },
        responseType: 'blob'
      }).then(response => {
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
        })
        const downloadElement = document.createElement('a')
        const href = window.URL.createObjectURL(blob) // 创建下载的链接
        downloadElement.href = href
        downloadElement.download = '人员资料.xlsx' // 下载后文件名
        document.body.appendChild(downloadElement)
        downloadElement.click() // 点击下载
        document.body.removeChild(downloadElement) // 下载完成移除元素
        window.URL.revokeObjectURL(href) // 释放掉blob对象
        loading.close()
      })
    },
    saveSettingField () {
      const fields = this.checkedFieldList.map(m => { return m.Name })
      const url = this.$root.getApi(API.KEY, API.TABLE_SETTING.URL)
      this.axios.post(url, {
        ...this.personalFieldSetting,
        Target: 0,
        VisiableFields: fields
      }).then(response => {
        if (response.Status) {
          this.init()
        }
      })
    },
    checkHadSelection () {
      if (this.selectionList.length < 1) {
        this.$message.error('请先选择要操作数据')
        return false
      }
      return true
    },
    toPersonSettingPage () {
      this.$root.navigate({ ...PERSON_SETTING, params: {} })
    },
    toFormPage (params) {
      this.$root.navigate({ ...PERSON_FORM, params: params })
    }
  },
  created () {
    this.init()
  },
  mounted () {
    // 避免拖拽元素打开新标签
    document.body.ondrop = (event) => {
      event.preventDefault()
      event.stopPropagation()
    }
  },
  components: { draggable }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  padding: 20px;

  .count-box {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-right: 10px;

    .count-item {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      height: 60px;
    }

    .r-label {
      margin-left: 20px;
      min-width: 60px;

      h1 {
        margin: 0;
        font-size: 28px;
        color: #333;
      }

      label {
        color: #666;
      }
    }

    .icon {
      padding: 10px;
      font-size: 32px;
      width: 48px;
      height: 48px;
      background: rgb(236, 245, 255);
      border-radius: 50%;
    }
  }
}

.content {
  background: #fff;
}

.w-p {
  display: flex;
  flex-wrap: nowrap;
  justify-content: right;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 20px;
}

.w-p-2 {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  .search-input {
    width: 200px;
    margin-right: .75rem;
  }

  .type-select {
    width: 100px;
    margin-right: .75rem;
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

.field-checked-box {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 10px;

  .field-checked-tag {
    margin: 10px 10px 0 0;
  }
}

.field-container {
  padding: 0 10px;
  overflow-y: auto;
  .title {
    padding: 14px 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .title-tips {
    font-size: .75rem;
    margin-left: 4px;
    font-weight: normal;
  }

  .field-box {
    margin-bottom: 20px;
  }

  .field-title-box {
    padding: 6px 12px;
    color: #666;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 8px;
    font-weight: 600;
  }

  /deep/ .field-checkbox-box {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-start;
    padding: 10px 12px;

    .el-checkbox {
      width: 100px;
      margin-bottom: 10px;
      font-size: .75rem;
      color: #2E3543 !important;
    }
  }
}

.export-form {
  .field-check-box {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    padding: 0 6px;
  }

  .el-checkbox {
    width: 100px;
  }
}
</style>
