const API = {
  KEY: 'OneForAll.OA',
  SETTING: {
    URL: '/api/OAPersonSettings',
    FIELD: '/api/OAPersonSettings/{id}/Fields',
    BATCH_SORT: '/api/OAPersonSettings/Batch/SortNumber',
    FIELD_DELETE: '/api/OAPersonSettings/{id}/Fields/{fieldId}',
    FIELD_ENABLE: '/api/OAPersonSettings/{id}/Fields/{fieldId}/IsEnabled',
    FIELD_BATCH_SORT: '/api/OAPersonSettings/{id}/Fields/Batch/SortNumber'
  },
  PERSON: {
    URL: '/api/OAPersons',
    INSERVICE: '/api/OAPersons/Inservice',
    BATCH_DELETE: '/api/OAPersons/Batch/IsDeleted',
    BATCH_LEAVE: '/api/OAPersons/Batch/LeaveDate',
    UPLOAD_HEADER: '/api/OAPersons/{id}/Header',
    UPLOAD_FILE: '/api/OAPersons/{id}/Files',
    STATISTIC: '/api/OAPersons/Statistic',
    EXCEL: '/api/OAPersons/Excel'
  },
  TABLE_SETTING: {
    URL: '/api/OATableColumnSettings'
  },
  NO_TEAM_PERSON: {
    URL: '/api/OANoTeamPersons'
  },
  TEAM: {
    URL: '/api/OATeams',
    TREE: '/api/OATeams/00000000-0000-0000-0000-000000000000/TreeNodes',
    SORT: '/api/OATeams/{id}/SortNumber',
    BATCH_SORT: '/api/OATeams/Batch/SortNumber',
    MEMBER: '/api/OATeams/{id}/Members',
    MEMBER_BATCH_DELETE: '/api/OATeams/{id}/Members/Batch/IsDeleted',
    CHILDNODE_MEMBER: '/api/OATeams/{id}/ChildNodeMembers',
    NOTEAM_MEMBER: '/api/OATeams/{id}/NonMembers',
    MEMBER_EXCEL: '/api/OATeams/{id}/MemberExcel',
    MEMBER_EXCEL_TEMPLATE: '/resources/templates/导入模板-部门成员.xlsx'
  },
  TEAM_TYPE: {
    URL: '/api/OATeamTypes',
    DELETE: '/api/OATeamTypes/{id}'
  },
  TEAM_MEMBER: {
    URL: '/api/OATeamMembers',
    BATCH_DELETE: '/api/OATeamMembers/Batch/IsDeleted',
    BATCH_TRANSFER: '/api/OATeamMembers/Batch/TeamId'
  },
  PERSON_ENTRY: {
    URL: '/api/OAPersonEntrys',
    BATCH_DELETE: '/api/OAPersonEntrys/Batch/IsDeleted',
    CONFIRM: '/api/OAPersonEntrys/{id}/IsConfirm'
  },
  PERSON_LEAVE: {
    URL: '/api/OAPersonLeaves',
    BATCH_DELETE: '/api/OAPersonLeaves/Batch/IsDeleted',
    CONFIRM: '/api/OAPersonLeaves/{id}/IsConfirm'
  },
  PERSON_HISTORY: {
    URL: '/api/OATeamMemberHistorys'
  },
  PERSON_CONTRACT: {
    URL: '/api/OAPersonContracts'
  },
  PERSON_FORMAL: {
    URL: '/api/OAPersonFormals',
    CONFIRM: '/api/OAPersonFormals/{id}/IsConfirm'
  },
  PERSON_CARE: {
    BIRTHDAY: '/api/OAPersonCares/Birthday',
    COMPANY: '/api/OAPersonCares/Company'
  },
  DINGDING_SETTING: {
    URL: '/api/OADingDingSettings'
  },
  JOB: {
    URL: '/api/OAJobs',
    SET_ENABLED: '/api/OAJobs/{id}/IsEnabled'
  },
  JOB_TYPE: {
    URL: '/api/OAJobTypes',
    BATCH_DELETE: '/api/OAJobTypes/Batch/IsDeleted'
  },
  JOB_DUTY: {
    URL: '/api/OAJobDutys',
    BATCH_DELETE: '/api/OAJobDutys/Batch/IsDeleted'
  },
  JOB_LEVEL: {
    URL: '/api/OAJobLevels',
    BATCH_DELETE: '/api/OAJobDutys/Batch/IsDeleted'
  }
}

export default API
