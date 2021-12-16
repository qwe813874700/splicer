<template>
  <div class="create-window">
    <div class="window-container">
      <div class="container-title">
        窗口标题
      </div>
      <div class="container">
        <el-form>
          <el-form-item label="标题">
            <el-input v-model="windowInfo.titleName" size="small" disabled></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="window-container">
      <div class="container-title">
        窗口坐标
      </div>
      <div class="container">
        <div class="flex-box between">
          <div class="flex-box flex-1">
            <span class="flex-label">x:</span>
            <div class="flex-container">
              <el-input-number v-model="windowInfo.topLeft_X" controls-position="right" :min="0" size="small"></el-input-number>
            </div>
          </div>
          <div class="flex-box b flex-1">
            <span class="flex-label">y:</span>
            <div class="flex-container">
              <el-input-number v-model="windowInfo.topLeft_Y" controls-position="right" :min="0" size="small"></el-input-number>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="window-container">
      <div class="container-title">
        窗口大小
      </div>
      <div class="container">
        <div class="flex-box between">
          <div class="flex-box flex-1">
            <span class="flex-label">w:</span>
            <div class="flex-container">
              <el-input-number v-model="windowInfo.width" controls-position="right" :min="0" size="small"></el-input-number>
            </div>
          </div>
          <div class="flex-box flex-1">
            <span class="flex-label">h:</span>
            <div class="flex-container">
              <el-input-number v-model="windowInfo.height" controls-position="right" :min="0" size="small"></el-input-number>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container-footer">
      <el-button type="primary" @click="createWindow">确认</el-button>
    </div>
  </div>
</template>

<script>
import { popMixin } from '@/api/mixins/popwindow-mixin'
import { popSpliceWindowMixin } from '@/api/mixins/popwindow-mixin.js'
import { getMinNumber } from '@/util/util'
import { navMixin } from '@/api/mixins/nav-mixin.js'

export default {
  mixins: [popMixin, popSpliceWindowMixin, navMixin],
  data () {
    return {
      windowInfo: {
        titleName: null,
        topLeft_X: 0,
        topLeft_Y: 0,
        width: 0,
        height: 0
      }
    }
  },
  created () {
    this.windowInfo.titleName = this.currDevice.label
  },
  methods: {
    createWindow () {
      if (!this.windowInfo.width || !this.windowInfo.height) {
        this.$myMessage('窗口宽度和高度不能为0', 'error')
        return
      }
      const sendData = {
        guihead: 'createWindow',
        groupIdx: this.currSelectGroupId,
        windowInfo: Object.assign(this.windowInfo, {
          windowIdx: getMinNumber(this.deviceList, 'id', 1),
          layerIdx: getMinNumber(this.deviceList, 'id', 1),
          signalEnable: this.currDevice.id,
          videoSrcCh: this.currDevice.id,
          audioSrcCh: this.currDevice.id
        })
      }
      this.$request(sendData).then(res => {
        if (res.result === this.$ERR_CODE) {
          this.$myMessage('创建窗口失败', 'error')
        } else { // 新增窗口成功时, 需要计算出实际的像素数据 并且将添加到deviceList里
          this.$myMessage('创建窗口成功')
          const obj = {
            id: sendData.windowInfo.windowIdx,
            zIndex: sendData.windowInfo.windowIdx,
            width: `${this.getPxVal(sendData.windowInfo.width)}px`,
            height: `${this.getPxVal(sendData.windowInfo.height)}px`,
            left: `${this.getPxVal(sendData.windowInfo.topLeft_X)}px`,
            top: `${this.getPxVal(sendData.windowInfo.topLeft_Y)}px`,
            realX: sendData.windowInfo.topLeft_X,
            realY: sendData.windowInfo.topLeft_Y,
            realWidth: sendData.windowInfo.width,
            realHeight: sendData.windowInfo.height,
            title: sendData.windowInfo.label,
            groupIdx: sendData.groupIdx,
            signalEnable: this.currDevice.id,
            videoSrcCh: this.currDevice.id,
            audioSrcCh: this.currDevice.id
          }
          this.setDeviceList({
            type: 'update',
            index: this.deviceList.length,
            value: obj
          })
          this.createNewWindow(null)
        }
      })
    },
    getPxVal (num) {
      return num / this.everyPxByVal
    }
  }
}
</script>

<style lang="scss">
.create-window {
  width: 350px;
}
</style>