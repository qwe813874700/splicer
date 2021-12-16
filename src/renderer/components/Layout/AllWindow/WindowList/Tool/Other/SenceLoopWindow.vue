<template>
  <div class="loop-window">
    <div class="loop-time d-flex align-items-center">
      <span class="loop-label">轮询间隔:</span>
      <el-input size="mini" class="flex-1 mx-2" type="number" v-model.number="loopTime" :min="0" :disabled="isStart"></el-input>
      <span>秒</span>
    </div>
    <div class="text-center mt-3">
      <el-button size="mini" type="primary" @click="stopLoopSence" :disabled="loopStatus" v-if="this.isStart">停止</el-button>
      <el-button size="mini" type="primary" @click="loopSence" :disabled="loopStatus"  v-if="!this.isStart">开始</el-button>
      <el-button size="mini" type="primary" :disabled="loopStatus" @click="closeWindow">取消</el-button>
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
      isCloseWindow: false,
      isStart: false,
      loopTime: 5,
      loopStatus: false,
      currLoopWindowIndex: 0,
      timeObj: null // 记录setTimeOut的对象
    }
  },
  methods: {
    async loopSence () {
      this.currentRow = JSON.parse(JSON.stringify(this.sceneList[this.currLoopWindowIndex]))
      this.loopStatus = true
      this.isStart = true
      await this.settingScene()
      this.currLoopWindowIndex = this.currLoopWindowIndex === this.sceneList.length - 1 ? 0 : this.currLoopWindowIndex + 1
      this.loopStatus = false
      this.timeObj = setTimeout(() => {
        this.loopSence()
      }, this.loopTime * 1000)
    },
    stopLoopSence () {
      clearTimeout(this.timeObj)
      this.timeObj = null
      this.isStart = false
      this.loopStatus = false
      this.currLoopWindowIndex = 0
    },
    closeWindow () {
      if (this.isStart) {
        this.$myMessage('请先关闭当前轮询', 'error')
      } else {
        this.setCurrOpenWindow(null)
      }
    }
  }
}
</script>

<style lang="scss">
.loop-window {
  width: 250px;
  .loop-label {
    width: 101px;
  }
}
</style>
