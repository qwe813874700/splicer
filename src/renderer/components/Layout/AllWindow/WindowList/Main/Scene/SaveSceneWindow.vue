<template>
  <div class="save-scene">
    <div class="flex-box between">
      <div class="window-container w-200">
        <div class="container-title">
          场景ID
        </div>
        <div class="container">
          <el-input-number :min="1" v-model="sceneInfo.id" size="mini" ></el-input-number>
        </div>
      </div>
      <div class="window-container w-100">
        <div class="container-title">
          场景名称
        </div>
        <div class="container">
          <el-input v-model="sceneInfo.name" size="mini"></el-input>
        </div>
      </div>
    </div>
    <div class="container-footer">
      <el-button type="primary" size="small" @click="saveScene">确认</el-button>
    </div>
  </div>
</template>

<script>
import { sceneMixin } from '@/api/mixins/scene-mixin'
import { popSpliceWindowMixin } from '@/api/mixins/popwindow-mixin'
import { saveMixins } from '@/api/mixins/save-mixin'

export default {
  mixins: [ sceneMixin, popSpliceWindowMixin, saveMixins ],
  data () {
    return {
      sceneInfo: {
        id: 1,
        name: '场景1'
      }
    }
  },
  created () {
    this._initSceneInfo()
    console.log(this.sceneList)
  },
  methods: {
    _initSceneInfo () {
      this.sceneInfo = {
        id: this.$util.getMinNumber(this.sceneList, 'id', 1),
        name: `场景${this.$util.getMinNumber(this.sceneList, 'id', 1)}`
      }
    },
    async saveScene () { // 保存场景, 物理屏, 逻辑屏设置, 分组设置, 窗口设置, 将数据转换成指令
      if (this.groupList.length === 0) {
        this.$myMessage('请先创建分组', 'error')
        return false
      }
      if (this.sceneList.findIndex(item => item.id === this.sceneInfo.id) > -1) {
        this.$myMessage('该场景ID已存在', 'error')
        return false
      }
      this.$writeLog(`保存场景: ID: ${this.sceneInfo.id} 名称: ${this.sceneInfo.name}`, this.$logType.OPERATION_CODE)
      const sendDataList = await this.allDataSave()
      this.sceneList.push(Object.assign(this.sceneInfo, { sendDataList }))
      this.saveStore()
      this.$writeLog('保存场景完成', this.$logType.OPERATION_CODE)
      this.setCurrOpenWindow(null)
    }
  }
}
</script>

<style lang="scss">
.save-scene {
  width: 400px;
  .w-100 {
    width: 100px;
  }
  .w-200 {
    width: 200px;
  }
}
</style>
