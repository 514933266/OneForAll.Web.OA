<template>
  <div class="resume readonly">
    <!-- 基础信息 -->
    <div class="left">
      <div class="pic-box">
        <el-image :src="entity.IconUrl">
          <div slot="error" class="image-slot">
            <img src="../../../assets/img/empty.jpg" />
          </div>
        </el-image>
      </div>
      <div class="info-box">
        <ul>
          <li>
            <span v-if="entity.Sex">
              <font-awesome-icon fas icon="mars" class="ofa-text-primary"></font-awesome-icon>
              &nbsp;男&nbsp;{{entity.Age}}&nbsp;岁
            </span>
            <span v-else>
              <font-awesome-icon fas icon="venus" class="ofa-text-danger"></font-awesome-icon>
              &nbsp;女&nbsp;{{entity.Age}}&nbsp;岁
            </span>
            <span><label v-if="entity.LeaveDate">离职</label><label v-else>在职</label></span>
          </li>
          <li>
            <span>
              <font-awesome-icon fas icon="calendar-alt"></font-awesome-icon>&nbsp;工作年限
            </span><span>{{entity.WorkAge}}&nbsp;年</span></li>
          <li><span>
              <font-awesome-icon fas icon="phone"></font-awesome-icon>&nbsp;联系电话
            </span><span>{{entity.Contact ? entity.Contact: '无'}}</span></li>
          <li><span>
              <font-awesome-icon fas icon="envelope"></font-awesome-icon>&nbsp;电子邮箱
            </span><span>{{entity.Email ? entity.Email : '无'}}</span></li>
        </ul>
      </div>
      <div class="skill-box">
        <div class="header">
          <font-awesome-icon fas icon="wrench"></font-awesome-icon>&nbsp;技能特长
        </div>
        <div class="content">
          <ul>
            <li v-for="skill in entity.Skills" :key="skill.num">
              <span>
                {{skill.Name}}
              </span>
            </li>
            <li v-show="!entity.Skills">暂无特长</li>
          </ul>
        </div>
      </div>
    </div>
    <!-- 个人信息 -->
    <div class="right">
      <div class="base-info-box">
        <div>
          <h2>{{entity.Name}}</h2>
        </div>
        <ul>
          <li>
            <span>
              <font-awesome-icon fas icon="globe"></font-awesome-icon>
              &nbsp;国籍&nbsp;{{entity.Country ? entity.Country : '未填写'}}
            </span>
            <span>
              <font-awesome-icon fas icon="heart"></font-awesome-icon>
              &nbsp;民族&nbsp;{{entity.National ? entity.National : '未填写'}}
            </span>
          </li>
          <li>
            <span>
              <font-awesome-icon fas icon="birthday-cake"></font-awesome-icon>
              &nbsp;生日&nbsp;{{entity.Birthday ? new Date(entity.Birthday).toString('yyyy年MM月dd日') : '未填写'}}
            </span>
            <span>
              <font-awesome-icon fas icon="id-card"></font-awesome-icon>
              &nbsp;证件&nbsp;{{entity.IdCard ? entity.IdCard : '未填写'}}
            </span>
          </li>
          <!-- <li>
            <span>
              <font-awesome-icon fas icon="map"></font-awesome-icon>
              &nbsp;户籍&nbsp;{{entity.Native ? entity.Native : '未填写'}}
            </span>
          </li> -->
          <li>
            <font-awesome-icon fas icon="map-marker"></font-awesome-icon>
            &nbsp;地址&nbsp;{{entity.Address ? entity.Address : '未填写'}}
          </li>
          <li>
            <span>
              <font-awesome-icon fas icon="user"></font-awesome-icon>
              &nbsp;岗位&nbsp;{{entity.Job ? entity.Job : '未填写'}}
            </span>
            <span>
              <font-awesome-icon fas icon="calendar"></font-awesome-icon>
              &nbsp;入职&nbsp;{{entity.LeaveDate ? new Date(entity.EntryDate).toString('yyyy年MM月dd日') : '未填写'}}
            </span>
            <span v-if="entity.LeaveDate">
              <font-awesome-icon fas icon="calendar"></font-awesome-icon>
              &nbsp;离职&nbsp;{{new Date(entity.LeaveDate).toString('yyyy年MM月dd日')}}
            </span>
          </li>
          <li>
            <span>
              <font-awesome-icon fas icon="graduation-cap"></font-awesome-icon>
              &nbsp;学历&nbsp;{{degrees[entity.Degree]}}
            </span>
            <span>
              <font-awesome-icon fas icon="book"></font-awesome-icon>
              &nbsp;专业&nbsp;{{entity.Major ? entity.Major : '未填写'}}
            </span>
          </li>
        </ul>
      </div>
      <!-- 工作经历 -->
      <div class="exp-info-box">
        <div class="header">
          <font-awesome-icon fas icon="paper-plane"></font-awesome-icon>&nbsp;工作经历
        </div>
        <div>
          <ul>
            <li v-for="exp in entity.Exps" :key="exp.num">
              <div class="top">
                <span>
                  {{new Date(exp.StarDate).toString('yyyy-MM-dd')}}&nbsp;至&nbsp;{{exp.EndDate ? new
                                Date(exp.EndDate).toString('yyyy-MM-dd') : '至今'}}
                </span>
                <span>
                  {{exp.Company}}&nbsp; {{exp.Job}}
                </span>
              </div>
              <div class="content">
                {{exp.Remark}}
              </div>
            </li>
            <li v-if="!entity.Exps">暂时没有更多的工作经历</li>
          </ul>
        </div>
      </div>
      <!-- 教育背景 -->
      <div class="edu-info-box">
        <div class="header">
          <font-awesome-icon fas icon="graduation-cap"></font-awesome-icon>&nbsp;教育背景
        </div>
        <div>
          <ul>
            <li v-for="edu in entity.Edus" :key="edu.num">
              <div class="top">
                <span>
                  {{new Date(edu.StarDate).toString('yyyy-MM-dd')}}&nbsp;至&nbsp;{{new
                                Date(edu.EndDate).toString('yyyy-MM-dd')}}
                </span>
                <span>
                  {{edu.School}}
                </span>
              </div>
              <div class="content">
                {{edu.Remark}}
              </div>
            </li>
            <li v-if="!entity.Edus">暂时没有更多的教育背景</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OAReadonlyResume',
  props: {
    value: {
      type: Object,
      default: null
    }
  },
  watch: {
    value (newValue) {
      this.entity = newValue
    }
  },
  data () {
    return {
      entity: {},
      areaCode: '', //                                  选中的地区
      showExps: false, //                               是否展开显示工作经历
      showEdus: false, //                               是否展开显示教育经历
      degrees: ['小学', '初中', '职专', '中技', '高中', '专科', '本科', '硕士', '博士'],
      degreeOptions: [
        {
          label: '初等教育',
          options: [{ value: 0, label: '小学' }]
        },
        {
          label: '中等教育',
          options: [{ value: 1, label: '初中' }, { value: 2, label: '职专' }, { value: 3, label: '中技' }, { value: 4, label: '高中' }]
        },
        {
          label: '高等教育',
          options: [{ value: 5, label: '专科' }, { value: 6, label: '本科' }, { value: 7, label: '硕士' }, { value: 8, label: '博士' }]
        }
      ]
    }
  },
  methods: {
    init () {
      this.entity = this.value
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.resume {
  display: flex;
  border: 1px solid #ebeef5;

  &:hover {
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2)
  }

  .left {
    color: #fff;
    width: 250px;
    padding: 20px;
    background-color: rgb(51, 55, 68);

    label {
      color: #fff;
    }

    /deep/.pic-box {
      padding-top: 1.25rem;
      display: flex;
      justify-content: center;

      .crop-uploader,
      img {
        margin: 0;
        width: 160px;
        height: 220px;
        border: 1px solid #ebeef5;
        box-shadow: 0 0 6px #ccc;
      }
    }

    .info-box {

      li {
        &:nth-child(1) {
          text-align: center;
        }

        >span {
          display: inline-block;
          margin-bottom: 5px;
        }
      }
    }

    .skill-box {

      header {
        margin-bottom: 5px;
      }

      .content {
        text-align: center;
      }
    }
  }

  .right {
    flex: 1;
    padding: 20px;

    .base-info-box {
      table {
        width: 100%;
      }

      .el-form-item {
        margin-bottom: 0;
      }

      .el-date-editor,
      .el-cascader,
      .el-select {
        width: 100%;
      }
    }

    .exp-info-box,
    .edu-info-box {
      padding: 1.25rem;

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      li {
        padding: 10px 0;
      }

      .top {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;

        >span {
          display: flex;
          align-items: center;
          flex-wrap: inherit;
          width: 50%;

          /deep/ .el-form-item {
            margin-bottom: 0;
          }
        }
      }

      .content {
        padding: .875rem 0;

        /deep/ textarea {
          height: 150px;
        }
      }
    }
  }
}

.readonly {
  .info-box {
    padding: 20px 0;

    li {
      margin-bottom: .875rem;
      display: flex;
      justify-content: space-between;
    }
  }

  .skill-box {
    padding: 20px 0;

    li {
      text-align: left;
      padding-top: .875rem;
    }
  }

  .base-info-box {
    padding: 1.25rem;

    li {
      padding: .875rem .875rem .875rem 0;

      span {
        display: inline-block;
        margin-right: 50px;
        min-width: 200px;

        >svg {
          width: 16px;
          height: 16px;
        }
      }
    }
  }

  .exp-info-box,
  .edu-info-box {
    padding: 1.25rem;

    .header {
      justify-content: flex-start !important;
    }

    li {
      padding: .875rem 0;

      .top {
        display: flex;
        justify-content: space-between;
      }

      .content {
        padding: .875rem 0;
      }
    }
  }
}
</style>
