<template>
  <el-container v-loading="loading" class="ofa-container column">
    <el-header class="header">
      <div class="header-box">
        <label class="title">员工档案字段设置</label>
        <div>
          <el-button @click="showDialog">新建分组</el-button>
          <el-button @click="sortDialogVisible = true">分组排序</el-button>
        </div>
      </div>
    </el-header>
    <el-main class="content">
      <div class="guide-box">
        <div class="card">
          <div class="icon ofa-bg-primary">
            <font-awesome-icon fas icon="folder"></font-awesome-icon>
          </div>
          <div class="text">
            <div class="title">员工档案</div>
            <div>可设置以下哪些字段，员工在「员工档案」中可见和可修改</div>
          </div>
        </div>
        <div class="card">
          <div class="icon ofa-bg-warning">
            <font-awesome-icon fas icon="file-alt"></font-awesome-icon>
          </div>
          <div class="text">
            <div class="title">入职登记表</div>
            <div>可设置以下哪些字段，员工在「员工档案」中可见和可修改</div>
          </div>
        </div>
        <div class="card">
          <div class="icon ofa-bg-success">
            <font-awesome-icon fas icon="user"></font-awesome-icon>
          </div>
          <div class="text">
            <div class="title">个人信息展示</div>
            <div>可设置以下哪些字段，员工之间相互可见</div>
          </div>
        </div>
      </div>
      <el-alert show-icon :closable="false" title="温馨提示" type="warning" description="可根据企业实际情况自定义人员档案字段，字段设置后，员工可在「员工档案」等3个地方看到">
      </el-alert>
      <div v-for="item in list" :key="item.Id">
        <el-form status-icon :model="entity" class="form" label-width="80px">
          <div class="table-header">
            <span class="label">{{item.Text}}</span>
            <el-button v-show="item.fieldSorting" @click="summitFieldSort(item)" type="primary">完成调整
            </el-button>
            <el-dropdown v-show="!item.fieldSorting" @command="handleDropdownCommand">
              <el-button type="text">
                设置<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-show="item.IsEditable" :command="{ key: 'edit', entity: item }">编辑分组
                </el-dropdown-item>
                <el-dropdown-item :command="{ key: 'addField', entity: item }">添加字段</el-dropdown-item>
                <el-dropdown-item :command="{ key: 'sort', entity: item }">调整顺序</el-dropdown-item>
                <el-dropdown-item v-if="!item.IsDefault" :command="{ key: 'del', entity: item }">删除分组
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <el-alert v-show="item.fieldSorting" title="请上下拖拽移动字段调整位置" type="warning" :closable="false"
            class="fieldSorting-alert"></el-alert>
          <el-table :data="item.Fields" :ref="'fieldTable' + item.SortNumber" row-key="Id" class="ofa-table">
            <el-table-column prop="Text" label="字段名称" align="left">
              <template slot-scope="scope">
                <label>{{scope.row.Text}}</label>
                <el-tooltip class="item" effect="dark" :content="scope.row.Tips" placement="top">
                  <font-awesome-icon v-show="scope.row.Tips" fas icon="info-circle" style="margin-left:2px;">
                  </font-awesome-icon>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="Type" label="类型" align="center" width="100">
              <template slot-scope="scope">
                {{ fieldTypeList.find(w=> w.value === scope.row.Type ).label }}
              </template>
            </el-table-column>
            <el-table-column prop="IsRequired" label="必填" align="center" width="200">
              <template slot-scope="scope">
                <font-awesome-icon v-show="scope.row.IsRequired" fas icon="check" class="check-icon">
                </font-awesome-icon>
              </template>
            </el-table-column>
            <el-table-column prop="IsEmployeeVisiable" label="员工在档案可见" align="left" width="200">
              <template slot-scope="scope">
                <font-awesome-icon v-show="scope.row.IsEmployeeVisiable" fas icon="check" class="check-icon">
                </font-awesome-icon>
                <label v-show="scope.row.IsEnabledEmployeEdit">&nbsp;允许员工修改</label>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="left" width="200">
              <template slot="header">
                操作
                <el-tooltip effect="dark" content="部分系统默认设置字段不支持停用和删除" placement="top">
                  <el-button v-show="item.Fields.findIndex(w => !w.IsShowEnabled || !w.IsDefault) > -1" type="text"
                    class="ofa-text-grey" style="margin-left:5px;">
                    <font-awesome-icon fas icon="info-circle"></font-awesome-icon>
                  </el-button>
                </el-tooltip>
              </template>
              <template slot-scope="scope">
                <el-button disabled v-show="item.fieldSorting" type="text">
                  <font-awesome-icon fas icon="bars"></font-awesome-icon>
                </el-button>
                <span v-show="!item.fieldSorting">
                  <el-button @click="showFieldDrawer(item.Id, scope.row)" type="text">编辑</el-button>
                  <el-button v-show="!scope.row.IsDefault && scope.row.IsShowEnabled"
                    @click="enableField(item.Id, scope.row)" type="text">{{ scope.row.IsEnabled ? '停用' : '启用'}}
                  </el-button>
                  <el-popconfirm v-show="!scope.row.IsDefault" @onConfirm="deleteField(item.Id, scope.row)"
                    title="确定删除该字段吗？" icon="el-icon-info" icon-color="red" style="margin-left:10px;">
                    <el-button slot="reference" type="text" class="ofa-text-danger">删除
                    </el-button>
                  </el-popconfirm>
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </div>
    </el-main>
    <!-- 字段信息抽屉 -->
    <el-drawer :visible.sync="drawerVisiable" :modal="false" :show-close="false" direction="rtl" size="480px"
      class="ofa-drawer">
      <div slot="title">
        <span class="title">{{isAddField ? '添加' : '编辑' + fieldEntity.Text }}字段</span><label class="title-tips">Field</label>
      </div>
      <div>
        <el-alert v-show="fieldEntity.IsDefault" :closable="false" type="warning" style="margin-bottom:10px;">
          系统默认字段，部分内容不支持修改</el-alert>
        <el-form :model="fieldEntity" label-width="160px" class="form" ref="fieldForm">
          <el-form-item label="字段名称：" prop="Text">
            <el-input v-model.trim="fieldEntity.Text" :disabled="!fieldEntity.IsEnableText" placeholder="输入字段名称">
            </el-input>
          </el-form-item>
          <el-form-item label="类型：" prop="Type">
            <el-select v-model.trim="fieldEntity.Type" @change="changeFieldType" :disabled="!fieldEntity.IsEnableType"
              placeholder="字段类型">
              <el-option v-for="fieldType in fieldTypeList" :key="fieldType.id" :label="fieldType.label"
                :value="fieldType.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="fieldEntity.IsEnableAddTypeDetail" label="选项内容：" prop="TypeDetails">
            <el-button v-show="fieldEntity.IsEnableAddTypeDetail" @click="addTypeDetail" type="text">新增</el-button>
            <div v-for="(typeDetail, i) in fieldEntity.TypeDetails" :key="typeDetail.id" class="type-detail-box">
              <el-input :disabled="!fieldEntity.IsEnableType" v-model.trim="typeDetail.Name"></el-input>
              <div v-show="fieldEntity.IsEnableAddTypeDetail" class="remove">
                <el-button @click="removeTypeDetail(i)" type="text" class="ofa-text-danger">
                  <font-awesome-icon fas icon="minus"></font-awesome-icon>
                </el-button>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="提示：" prop="Placeholder">
            <el-input v-model.trim="fieldEntity.Placeholder" placeholder="请输入字段提示，以便员工理解"></el-input>
          </el-form-item>
          <el-form-item label="要求员工必填：" prop="IsRequired">
            <template slot="label">
              要求员工必填
              <el-tooltip class="item" effect="dark" content="员工在填写入职登记表和编辑个人档案时，是否要求必填该字段" placement="top">
                <i class="el-icon-warning-outline" style="margin-left:2px;"></i>
              </el-tooltip>&nbsp;：
            </template>
            <el-radio-group v-model="fieldEntity.IsRequired" :disabled="!fieldEntity.IsEnableRequired">
              <el-radio :label="true">必填</el-radio>
              <el-radio :label="false">选填</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="在入职登记中：" prop="IsEntryFileVisiable">
            <template slot="label">
              在入职登记中
              <el-tooltip class="item" effect="dark"
                :content="fieldEntity.IsEnableEntryFileVisiable ? '在新员工入职的入职登记表中，是否显示该字段' : `默认在入职登记表中${fieldEntity.IsEmployeeVisiable ? '显示' : '隐藏' }，不允许设置`"
                placement="top">
                <i class="el-icon-warning-outline" style="margin-left:2px;"></i>
              </el-tooltip>&nbsp;：
            </template>
            <el-radio-group v-model="fieldEntity.IsEntryFileVisiable"
              :disabled="!fieldEntity.IsEnableEntryFileVisiable">
              <el-radio :label="true">显示</el-radio>
              <el-radio :label="false">隐藏</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="在个人档案中：">
            <template slot="label">
              在个人档案中
              <el-tooltip class="item" effect="dark"
                :content="fieldEntity.IsEnableEmployeeVisiable ? '在员工查看个人档案时，该字段是否对他可见' : `默认在个人档案中对员工${fieldEntity.IsEmployeeVisiable ? '可见' : '不可见' }，不允许设置`"
                placement="top">
                <i class="el-icon-warning-outline" style="margin-left:2px;"></i>
              </el-tooltip>&nbsp;：
            </template>
            <el-radio-group v-model="fieldEntity.IsEmployeeVisiable" :disabled="!fieldEntity.IsEnableEmployeeVisiable">
              <el-radio :label="true">对员工可见</el-radio>
              <el-radio :label="false">对员工隐藏</el-radio>
            </el-radio-group>
            <el-radio-group v-model="fieldEntity.IsEmployeeEditable" :disabled="!fieldEntity.IsEnableEmployeeEditable">
              <el-radio :label="true">员工可自行修改</el-radio>
              <el-radio :label="false">员工不可修改</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <div class="footer">
        <el-button type="primary" @click="submitField">
          <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;{{isAddField ? '添加' : '保存'}}
        </el-button>
        <el-button type="warning" @click="drawerVisiable = false">
          取消
        </el-button>
      </div>
    </el-drawer>
    <!-- 分组弹窗 -->
    <el-dialog custom-class="ofa-dialog" :title="isAdd ? '新建分组' : '编辑分组'" :visible.sync="dialogVisible" width="30%">
      <el-form :model="entity" label-position="top" label-width="120px" class="form" ref="form">
        <el-form-item prop="Text">
          <el-input v-model.trim="entity.Text" placeholder="请输入分组名称"></el-input>
        </el-form-item>
        <el-form-item v-show="entity.IsShowGrouped" prop="IsGrouped">
          <el-checkbox v-model="entity.IsGrouped">支持分组添加</el-checkbox>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分组排序弹窗 -->
    <el-dialog @opened="initSortTableRowDrop" custom-class="ofa-dialog" title="分组排序" :visible.sync="sortDialogVisible"
      width="30%">
      <span slot="title" class="dialog-footer">
        <label>分组排序</label>
        <label class="ofa-text-grey" style="font-size: 12px;">&nbsp;拖动调整位置</label>
      </span>
      <el-table :data="list" :show-header="false" ref="sortTable" row-key="Id" class="sort-table"
        row-class-name="sort-table-row" cell-class-name="sort-table-cell">
        <el-table-column prop="Text" label="名称" align="left">
          <template slot-scope="scope">
            <div :class="['sort-row-label', scope.row.IsSortable ? 'allowDrop' : 'disabled']">
              <span>{{scope.row.Text}}</span>
              <span v-show="!scope.row.IsSortable" class="ofa-text-grey" style="font-size: 12px;">系统默认分组，不支持调整排序</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="sortDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSort">确 定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
import API from '../../../apis/oa-api'
import { PERSON_FIELD_TYPE } from '../../../assets/js/oa-const'
import { PERSON_SETTING, PERSON_FORM } from '../../../router/oa-router'
import Sortable from 'sortablejs'

export default {
  name: PERSON_SETTING.name,
  data () {
    return {
      fieldTypeList: PERSON_FIELD_TYPE, // 字段类型
      loading: false, // 加载中
      dialogVisible: false, // 排序弹窗显示
      sortDialogVisible: false, // 排序弹窗显示
      isAdd: false, // 是否添加分组
      drawerVisiable: false, // 显示抽屉
      isAddField: false, // 当前是否创建字段模式
      list: [], // 人员资料列表
      entity: {}, // 当前正在编辑的分组
      fieldEntity: {}, // 当前正在编辑的设置
      sortingTable: {}, // 当前正在启用拖拽排序的table
      total: 1, // 总数据量
      pageIndex: 1, // 页码
      pageSize: 10 // 页数
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(PERSON_SETTING.name)
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
      const url = this.$root.getApi(API.KEY, API.SETTING.URL)
      this.axios.get(url).then(response => {
        response.forEach(e => {
          this.$set(e, 'fieldSorting', false)
        })
        this.list = response
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
      this.pageIndex = 1
      this.$nextTick(() => { this.get() })
    },
    selectionChange (rows) {
      this.selectionList = rows
    },
    showDialog (entity) {
      if (!entity.Id) {
        this.isAdd = true
        this.entity = { IsShowGrouped: true }
      } else {
        this.isAdd = false
        this.entity = { ...entity }
      }
      this.dialogVisible = true
    },
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.isAdd) {
            this.add()
          } else {
            this.update()
          }
        }
      })
    },
    add () {
      const url = this.$root.getApi(API.KEY, API.SETTING.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.dialogVisible = false
            this.get()
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.SETTING.URL)
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.dialogVisible = false
            this.get()
          }
        })
    },
    del (entity) {
      this.$confirm(`确认要彻底删除分组${entity.Text}?删除后不可恢复`, '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.SETTING.URL)
        this.axios.delete(`${url}/${entity.Id}`).then(response => {
          if (response.Status) {
            this.get()
          }
        })
      })
    },
    handleDropdownCommand (command) {
      switch (command.key) {
        case 'addField':
          this.showFieldDrawer(command.entity.Id); break
        case 'sort':
          this.showSortButton(command.entity, true); break
        case 'edit':
          this.showDialog(command.entity); break
        case 'del':
          this.del(command.entity); break
      }
    },
    initSortTableRowDrop () {
      const _this = this
      const table = this.$refs.sortTable.$el.querySelector('.el-table__body-wrapper tbody')
      Sortable.create(table, {
        handle: '.allowDrop', // 允许拖拽的类名
        animation: 180,
        delay: 0,
        onEnd ({ newIndex, oldIndex }) {
          const curRow = _this.list.splice(oldIndex, 1)[0]
          _this.list.splice(newIndex, 0, curRow)
        }
      })
    },
    submitSort () {
      const data = this.list.map(e => { return e.Id })
      const url = this.$root.getApi(API.KEY, API.SETTING.BATCH_SORT)
      this.axios.patch(url, data).then(response => {
        if (response.Status) {
          this.sortDialogVisible = false
          this.get()
        }
      })
    },
    showFieldDrawer (settingId, entity) {
      if (entity) {
        this.isAddField = false
        this.fieldEntity = { ...entity, SettingId: settingId }
      } else {
        this.isAddField = true
        this.fieldEntity = {
          TypeDetails: [],
          SettingId: settingId,
          IsEnableText: true,
          IsEnableType: true,
          IsShowEnabled: true,
          IsEnableRequired: true,
          IsEnableEmployeeEditable: true,
          IsEnableEmployeeVisiable: true,
          IsEnableEntryFileVisiable: true
        }
      }
      this.drawerVisiable = true
    },
    showSortButton (entity, fieldSorting) {
      entity.fieldSorting = fieldSorting
      this.initFieldTableRowDrop(entity)
    },
    summitFieldSort (entity) {
      entity.fieldSorting = false
      this.destroyFieldTableRowDrop(entity)
      const data = entity.Fields.map(e => { return e.Id })
      const url = this.$root.getApi(API.KEY, API.SETTING.FIELD_BATCH_SORT.replace(/{id}/, entity.Id))
      this.axios.patch(url, data).then(response => {
        if (response.Status) {
          this.get()
        }
      })
    },
    initFieldTableRowDrop (entity) {
      const tableName = 'fieldTable' + entity.SortNumber
      const table = this.$refs[tableName][0].$el.querySelector('.el-table__body-wrapper tbody')
      this.sortingTable = Sortable.create(table, {
        animation: 180,
        delay: 0,
        onEnd ({ newIndex, oldIndex }) {
          const curRow = entity.Fields.splice(oldIndex, 1)[0]
          entity.Fields.splice(newIndex, 0, curRow)
        }
      })
    },
    destroyFieldTableRowDrop () {
      this.sortingTable.destroy()
    },
    changeFieldType (value) {
      if (value === 5 || value === 6) {
        this.$set(this.fieldEntity, 'IsEnableAddTypeDetail', true)
      } else {
        this.$set(this.fieldEntity, 'IsEnableAddTypeDetail', false)
      }
    },
    addTypeDetail () {
      this.$prompt('请输入要新增的选项内容,多个值可用逗号（,）隔开', '新增类型选项', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[\S]+$/,
        inputErrorMessage: '请输入选项值'
      }).then(({ value }) => {
        const arr = value.split(',')
        let num = this.fieldEntity.TypeDetails.length
        arr.forEach(item => {
          this.fieldEntity.TypeDetails.push({ Name: item, Value: num })
          num++
        })
      })
    },
    removeTypeDetail (index) {
      this.fieldEntity.TypeDetails.splice(index, 1)
    },
    submitField () {
      this.$refs.fieldForm.validate((valid) => {
        if (valid) {
          if (this.isAddField) {
            this.addField()
          } else {
            this.updateField()
          }
        }
      })
    },
    addField () {
      const url = this.$root.getApi(API.KEY, API.SETTING.FIELD.replace(/{id}/, this.fieldEntity.SettingId))
      this.axios.post(url, this.fieldEntity).then(response => {
        if (response.Status) {
          this.get()
        }
      })
    },
    updateField () {
      const url = this.$root.getApi(API.KEY, API.SETTING.FIELD.replace(/{id}/, this.fieldEntity.SettingId))
      this.axios.put(url, this.fieldEntity).then(response => {
        if (response.Status) {
          this.get()
        }
      })
    },
    deleteField (settingId, entity) {
      const url = this.$root.getApi(API.KEY, API.SETTING.FIELD_DELETE.replace(/{id}/, settingId).replace(/{fieldId}/, entity.Id))
      this.axios.delete(url).then(response => {
        if (response.Status) {
          this.get()
        }
      })
    },
    enableField (settingId, entity) {
      const url = this.$root.getApi(API.KEY, API.SETTING.FIELD_ENABLE.replace(/{id}/, settingId).replace(/{fieldId}/, entity.Id))
      this.axios.patch(url).then(response => {
        if (response.Status) {
          this.get()
        }
      })
    },
    toFormPage (params) {
      this.$root.navigate({ ...PERSON_FORM, params: params })
    }
  },
  created () {
    this.init()
    // 解决表格拖拽弹出新网页问题
    document.body.ondrop = (event) => {
      event.preventDefault()
      event.stopPropagation()
    }
  },
  // eslint-disable-next-line
  components: { Sortable }
}
</script>

<style lang="scss" scoped>
.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.content {
  margin-top: 20px;
  background: #fff;
}
.header-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .title {
    font-size: 20px;
  }
}

.content {
  .form {
    margin-top: 40px;
  }

  .table-header {
    position: relative;
    font-size: 16px;
    color: #666;
    display: flex;
    justify-content: space-between;

    &:before {
      content: ' ';
      background: #409EFF;
      padding: 2px;
      width: 2px;
      height: 17px;
      display: inline-block;
      left: 0;
      position: absolute;
    }

    .label {
      margin-left: 10px;
    }
  }

  /deep/ th {
    background: rgba(192, 196, 204, 0.1);
    color: #666;
  }

  .check-icon {
    color: #909399;
  }

  .guide-box {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 20px;

    .card {
      padding: 20px;
      display: flex;
      justify-content: flex-start;
    }

    .text {
      margin-left: 10px;
      color: #909399;
    }

    .icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid #F2F6FC;
      font-size: 1.25rem;
      color: #fff;
    }

    .title {
      font-size: 1.25rem;
      margin-bottom: 10px;
      color: #333;
    }
  }
}

.fieldSorting-alert {
  margin: 10px 0;
}

.type-detail-box {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 6px;

  &:hover {
    .remove {
      button {
        display: block;
      }
    }
  }

  .remove {
    margin-left: 4px;
    width: 14px;

    button {
      display: none;
    }
  }
}

.sort-table {
  /deep/ .el-table__body {
    border-collapse: separate !important;
    border-spacing: 0 10px !important;
    table-layout: auto !important;
  }
}

/deep/ .sort-table-row {
  padding: 0;
}

/deep/ .sort-table-cell {
  background-color: #EBEEF5;
  border-bottom: transparent;
  border-radius: 4px;
}

.sort-row-label {
  display: flex;
  justify-content: space-between;
}

.sort-row-label.disabled {
  color: #909399;
}
</style>
