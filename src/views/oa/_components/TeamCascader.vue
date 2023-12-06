<template>
  <el-cascader ref="teamCascader" :props="{ checkStrictly: true, label: 'Name', children: 'Children', value: 'Id' }"
    v-model="treePath" :options="tree" :placeholder="placeholder" :size="size"></el-cascader>
</template>

<script>
import API from '../../../apis/oa-api'

export default {
  name: 'OATeamCascader',
  props: {
    // 绑定值
    value: { type: String },
    // 水印
    placeholder: { type: String, default: '请选择上级' },
    // 隐藏节点
    hiddenKey: { type: String, default: '' },
    // 显示根节点
    showRoot: { type: Boolean, default: false },
    // 根节点的值
    rootName: { type: String, default: '根节点' },
    // 显示类型
    type: { type: String, default: '' },
    // 尺寸
    size: { type: String, default: 'normal' }
  },
  data () {
    return {
      tree: [],
      treePath: [],
      rootItem: {
        Id: this.$store.state.guid,
        ParentId: this.$store.state.guid,
        Name: this.rootName
      }
    }
  },
  watch: {
    value (newValue) {
      this.init()
    },
    treePath (newValue) {
      const index = newValue.length - 1
      this.$emit('input', newValue[index])
    }
  },
  methods: {
    init () {
      this.get()
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.TEAM.URL)
      this.axios.get(url, {
        params: {
          type: this.type,
          scope: 0
        }
      }).then(response => {
        this.setTree(response)
        this.treePath = this.getTreePath(this.value)
      })
    },
    setTree (tree) {
      if (this.showRoot) {
        tree.unshift(this.rootItem)
      }
      if (this.hiddenKey) tree = this.hiddenNode(tree)
      this.tree = tree
    },
    hiddenNode (source) {
      const index = source.findIndex(w => w.Id === this.hiddenKey)
      if (index > -1) {
        source.splice(index, 1)
      } else {
        source.forEach(e => {
          if (e.Children) e.Children = this.hiddenNode(e.Children)
        })
      }
      return source
    },
    getTreePath (value) {
      let result = [value]
      const option = this.findOption(this.tree, value)
      if (option && option.ParentId !== this.$store.state.guid) {
        result = this.getTreePath(option.ParentId).concat(result)
      }
      return result
    },
    findOption (source, value) {
      if (source) {
        for (let i = 0; i < source.length; i++) {
          const e = source[i]
          if (e.Id === value) {
            return e
          } else {
            const option = this.findOption(e.Children, value)
            if (option) return option
          }
        }
      }
      return null
    },
    getCheckedNodes () {
      return this.$refs.teamCascader.getCheckedNodes()
    }
  },
  created () {
    this.init()
  }
}
</script>
