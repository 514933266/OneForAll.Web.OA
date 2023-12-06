<template>
  <div>
    <div class="person-box">
      <el-avatar :src="domain + entity.IconUrl" fit="contain" class="person-icon">
        {{getSubName(entity.Name)}}
      </el-avatar>
      <div class="person-name">
        <label>{{entity.Name}}</label>
        <el-tag effect="dark" class="tag" style="margin-left: 4px;">
          {{ employeeTypeList.find(w => w.value === entity.EmployeeType).label }}</el-tag>
      </div>
      <div v-for="item in entity.Teams" :key="item.Name" class="person-team">
        <label>{{item.Name}}</label>
        <el-tag effect="plain" class="tag" style="margin-left: 4px;">
          {{ item.Type }}</el-tag>
      </div>
      <div class="person-workage">
        <label class="ofa-text-grey">已在公司工作了{{entity.WorkAge * 365}}天</label>
      </div>
    </div>
    <div class="person-info-box">
      <el-form status-icon :model="entity" ref="resumeForm" class="resume" label-width="80px">
        <div class="row">
          <el-form-item prop="Name" :rules="{ required: true, message: '请填写姓名' }" label="姓名">
            <el-input v-model="entity.Name" placeholder="请输入姓名"></el-input>
          </el-form-item>
        </div>
        <div class="row">
          <el-form-item prop="Birthday" label="生日">
            <el-date-picker v-model="entity.Birthday" type="date" placeholder="请选择出生日期"
              @change="birthdayChange">
            </el-date-picker>
          </el-form-item>
          <el-form-item prop="IdCard" label="身份证">
            <el-input v-model="entity.IdCard" placeholder="请输入身份证"></el-input>
          </el-form-item>
        </div>
        <div class="row">
          <el-form-item prop="EntryDate" label="入职">
            <el-date-picker v-model="entity.EntryDate" value-format="yyyy-MM-dd" align="right" type="date"
              placeholder="选择日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item prop="LeaveDate" label="离职">
            <el-date-picker v-model="entity.LeaveDate" value-format="yyyy-MM-dd" align="right" type="date"
              placeholder="选择日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item prop="Job" :rules="{ required: true, message: '请填写岗位' }" label="岗位">
            <el-input v-model="entity.Job" placeholder="请输入岗位"></el-input>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import API from '../../../apis/oa-api'
import { PERSON_EMPLOYEE_TYPE } from '../../../assets/js/oa-const'

// 员工档案
export default {
  name: 'OAResume',
  props: {
    value: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      entity: {},
      employeeTypeList: PERSON_EMPLOYEE_TYPE // 员工类型
    }
  },
  watch: {
    value (newValue) {
      this.entity = newValue
      this.areaCode = newValue.NativeAreaCode
    },
    entity (newValue) {
      this.$emit('input', newValue)
    }
  },
  computed: {
    domain () {
      return this.$root.getApiDomain(API.KEY)
    }
  },
  methods: {
    init () {
      this.entity = this.value
      this.areaCode = this.entity.NativeAreaCode
    },
    getSubName (str) {
      return (str && str.length > 0) ? str.substring(0, 1) : 'P'
    },
    birthdayChange (value) {
      const birthDayTime = new Date(value).getTime()
      const nowTime = new Date().getTime()
      this.entity.Age = Math.ceil((nowTime - birthDayTime) / 31536000000)
    },
    uploadHeader (upload) {
      const formData = new FormData()
      formData.append('files', upload.file, upload.filename)
      const url = this.$root.getApi(API.KEY, API.PERSON.UPLOAD_HEADER.replace(/{id}/, this.entity.Id))
      this.axios.post(url, formData)
        .then(response => {
          if (response.Status) {
            this.entity.IconUrl = this.domain + response.Data.Result.Url
          }
        })
    },
    validate () {
      let formValid = false
      this.$refs.resumeForm.validate((valid) => { formValid = valid })
      return formValid
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.person-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;

  .person-icon {
    margin-right: 10px;
    border-radius: 50%;
    width: 70px;
    height: 70px;
    font-size: 1.75rem;
    background: rgba(27, 154, 247, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
  }

  .person-name {
    margin-top: 20px;
    font-size: 1.25rem;
    font-weight: bold;
  }

  .person-team {
    margin-top: 10px;
    font-size: 1rem;
  }

  .person-workage {
    margin-top: 10px;
    font-size: 1rem;
  }
}
.person-info-box {
  margin-top: 25px;
  display: flex;
}
</style>
