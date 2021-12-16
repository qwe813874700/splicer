<template>
  <div class="read-window">
    <div class="read-header">
      <div class="flex-box between">
        <div class="flex-box">
          <div class="flex-title">场景ID:</div>
          <el-input type="text" size="mini" class="w-120" v-model="currentRow.id" readonly></el-input>
        </div>
        <div class="flex-box">
          <div class="flex-title">场景名称:</div>
          <el-input type="text" size="mini" class="w-120" v-model="currentRow.name" readonly></el-input>
        </div>
      </div>
    </div>
    <div class="window-container">
      <div class="container-title">
        窗口标题
      </div>
      <div class="table-container">
        <el-table
          :data="sceneList"
          style="min-height: 100%;"
          max-height="459"
          border
          size="mini"
          @row-click="handleCurrentChange">
          <el-table-column  prop="id" label="场景ID" width="100"></el-table-column>
          <el-table-column  prop="name" label="场景名称"></el-table-column>
        </el-table>
      </div>
    </div>
    <div class="container-footer d-flex text-right">
      <el-button type="primary" size="mini" :disabled="!currentRow.id" @click="settingScene">执行</el-button>
      <el-button type="primary" size="mini" @click="setCurrOpenWindow(null)">取消</el-button>
    </div>
  </div>
</template>

<script>
import { sceneMixin } from '@/api/mixins/scene-mixin'
import { popSpliceWindowMixin } from '@/api/mixins/popwindow-mixin'

export default {
  mixins: [ sceneMixin, popSpliceWindowMixin ],
  data () {
    return {
      isCloseWindow: false
    }
  }
}
</script>

<style lang="scss">
.read-window {
  padding: 10px;
  font-size: 12px;
  width: 440px;
  .read-header {
    margin-bottom: 20px;
  }
  .w-120 {
    width: 120px;
  }
  .flex-title {
    width: 60px;
  }
  .table-container {
    height:290px;
    border: 1px solid #000;
  }
}
</style>
