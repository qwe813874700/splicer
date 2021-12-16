<template>
  <div class="manage-scene">
    <div class="window-container">
      <div class="container-title">
        场景ID
      </div>
      <div class="container mg-b">
        <div class="table-container">
          <el-table
            :data="sceneList"
            style="min-height: 100%"
            max-height="200"
            size="mini"
            border
            highlight-current-row
            ref="manegeTable"
            @row-click="handleCurrentChange"
            @row-contextmenu="(row) => showMenu(row)">
            <el-table-column  prop="id" label="序号" width="80"></el-table-column>
            <el-table-column  prop="name" label="场景名"></el-table-column>
          </el-table>
        </div>
      </div>
      <!-- <div class="flex-box mg-t mg-b">
        <div class="flex-label">图标:</div>
        <el-select size="mini" class="mg-r"></el-select>
        <el-checkbox>添加为快速按钮</el-checkbox>
      </div> -->
      <div class="flex-box">
        <div class="flex-label w-39">名称:</div>
        <el-input size="mini" class="flex-1" v-model="currentRow.name"></el-input>
      </div>
    </div>
    <div class="container-footer">
      <el-button type="primary" size="mini" @click="confirmManage">确认</el-button>
    </div>
  </div>
</template>

<script>
import { sceneMixin } from '@/api/mixins/scene-mixin'
import { remote } from 'electron'
import { popSpliceWindowMixin } from '@/api/mixins/popwindow-mixin'

const { Menu, MenuItem } = remote
export default {
  mixins: [ sceneMixin, popSpliceWindowMixin ],
  data () {
    return {
    }
  },
  methods: {
    showMenu (row) { // 右键显示菜单
      const menu = new Menu()
      const menuItem = new MenuItem({
        label: '删除场景',
        click: () => {
          this.deleteList(row.id)
        }
      })
      menu.append(menuItem)
      menu.popup(remote.getCurrentWindow())
    },
    deleteList (id) {
      this.sceneList.splice(this.sceneList.findIndex(item => item.id === id), 1)
      if (this.currentRow.id === id) {
        this.currentRow = {
          id: null,
          name: ''
        }
        this.$ref['manegeTable'].setCurrentRow()
      }
    },
    confirmManage () {
      if (this.currentRow.id && this.currentRow.name.trim() === '') {
        this.$myMessage('场景名不能为空', 'error')
        return false
      }
      if (this.currentRow.id) {
        this.sceneList[this.sceneList.findIndex(item => item.id === this.currentRow.id)]['name'] = this.currentRow.name
      }
      this.saveStore()
      this.setCurrOpenWindow(null)
    }
  }
}
</script>

<style lang="scss">
.manage-scene {
  width: 500px;
  .table-container {
    height: 200px;
  }
  .flex-label {
    width: 30px;
    &.w-39 {
      width: 39px;
    }
  }
}
</style>
