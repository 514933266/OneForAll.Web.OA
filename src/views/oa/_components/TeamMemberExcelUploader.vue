<template>
  <div>
    <excel-uploader ref="uploader" @upload="upload" :uploading="importing" :templateUrl="templateUrl"></excel-uploader>
    <el-table border :data="errors" height="400px" :row-class-name="getRowClassName">
      <el-table-column prop="RowIndex" label="行号" width="50">
        <template slot-scope="scope">
          {{scope.row.RowIndex + 1}}
        </template>
      </el-table-column>
      <el-table-column prop="Source[0]" label="工号"></el-table-column>
      <el-table-column prop="Source[1]" label="姓名"></el-table-column>
      <el-table-column prop="Source[2]" label="职级"></el-table-column>
      <el-table-column prop="Source[3]" label="身份证号"></el-table-column>
      <el-table-column prop="Source[4]" label="部门"></el-table-column>
      <el-table-column prop="Source[5]" label="是否主管"></el-table-column>
      <el-table-column prop="Source[6]" label="电话"></el-table-column>
      <el-table-column prop="Source[7]" label="邮箱"></el-table-column>
      <el-table-column prop="Source[8]" label="入职日期"></el-table-column>
      <el-table-column prop="Source[9]" label="员工类型"></el-table-column>
      <el-table-column prop="Source[10]" label="备注"></el-table-column>
      <el-table-column prop="Columns" label="错误原因" width="200">
        <template slot-scope="scope">
          <ul>
            <li v-for="item in scope.row.Columns" :key="item.ColumnIndex">
              <span><label>列</label>{{item.ColumnIndex + 1}}：{{item.Error}}</span>
            </li>
          </ul>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import API from '../../../apis/oa-api'

export default {
  name: 'OATeamMemberExcelUploader',
  props: {
    teamId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      importing: false, // 正在导入
      importSuccess: false, // 导入成功
      errors: [] // 导入返回的错误数据
    }
  },
  computed: {
    // 模板下载地址
    templateUrl () {
      return this.$root.getApi(API.KEY, API.TEAM.MEMBER_EXCEL_TEMPLATE)
    }
  },
  methods: {
    upload (data) {
      this.importing = true
      const formData = new FormData()
      formData.append('files', data.file, data.filename)
      const url = this.$root.getApi(API.KEY, API.TEAM.MEMBER_EXCEL).replace(/{id}/, this.teamId)
      this.axios.post(url, formData).then(response => {
        this.importing = false
        if (!response.Status) {
          this.$refs.uploader.uploadError('上传失败，请根据提示修改后重新上传')
          this.errors = response.Data
        } else {
          this.errors = []
        }
      })
    },
    getRowClassName ({ row, rowIndex }) {
      if (row.Columns.length > 0) {
        return 'error-row'
      }
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
.el-table {
  margin-top: 20px;

  /deep/ .error-row {
    color: #f56c6c;
  }
}
</style>
