<template>
  <div class="property-window">
    <div class="window-container">
      <div class="container-title">
        窗口标题
      </div>
      <div class="container">
        <el-form>
          <el-form-item label="标题">
            <el-input v-model="currSettingObj.title" size="mini" disabled></el-input>
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
          <div class="flex-box">
            <span class="flex-label">x:</span>
            <div class="flex-container">
              <el-input-number v-model="deviceInfo.realX" controls-position="right" :min="0" size="small"></el-input-number>
            </div>
          </div>
          <div class="flex-box b">
            <span class="flex-label">y:</span>
            <div class="flex-container">
              <el-input-number v-model="deviceInfo.realY" controls-position="right" :min="0" size="small"></el-input-number>
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
          <div class="flex-box">
            <span class="flex-label">w:</span>
            <div class="flex-container">
              <el-input-number v-model="deviceInfo.realWidth" controls-position="right" :min="0" size="small"></el-input-number>
            </div>
          </div>
          <div class="flex-box between">
            <span class="flex-label">h:</span>
            <div class="flex-container">
              <el-input-number v-model="deviceInfo.realHeight" controls-position="right" :min="0" size="small"></el-input-number>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container-footer">
      <el-button type="primary" @click="setWindowPro" size="small">确认</el-button>
      <!-- <el-button type="info" @click.left="closeWindow">取消</el-button> -->
    </div>
  </div>
</template>

<script>
import { popMixin } from '@/api/mixins/popwindow-mixin'
import { mapGetters, mapActions } from 'vuex'
export default {
  mixins: [popMixin],
  data () {
    return {
      deviceInfo: {
        realX: 0,
        realY: 0,
        realWidth: 0,
        realHeight: 0
      }
    }
  },
  computed: {
    ...mapGetters(['currSettingObj', 'everyPxByVal', 'deviceList'])
  },
  created () {
    this._initDeviceInfo()
    console.log(this.deviceInfo)
  },
  methods: {
    ...mapActions(['setCurrOpenWindow', 'setProDevice']),
    _initDeviceInfo () {
      this.deviceInfo = JSON.parse(JSON.stringify(this.currSettingObj))
    },
    setWindowPro () {
      const deviceInfo = this.deviceInfo
      const sendData = {
        guihead: 'setWindow',
        groupIdx: deviceInfo.groupIdx,
        windowInfo: {
          windowIdx: deviceInfo.id,
          layerIdx: deviceInfo.zIndex,
          titleName: deviceInfo.title,
          topLeft_X: deviceInfo.realX,
          topLeft_Y: deviceInfo.realY,
          width: deviceInfo.realWidth,
          height: deviceInfo.realHeight,
          signalEnable: deviceInfo.signalEnable,
          videoSrcCh: deviceInfo.videoSrcCh,
          audioSrcCh: deviceInfo.audioSrcCh
        }
      }
      this.$request(sendData).then(res => {
        if (res.result === this.$ERR_CODE) {
          this.$myMessage('设置失败, 请检查您的设置', 'error')
        } else {
          const obj = {
            id: deviceInfo.id,
            zIndex: deviceInfo.zIndex,
            width: `${deviceInfo.realWidth / this.everyPxByVal}px`,
            height: `${deviceInfo.realHeight / this.everyPxByVal}px`,
            left: `${deviceInfo.realX / this.everyPxByVal}px`,
            top: `${deviceInfo.realY / this.everyPxByVal}px`,
            title: deviceInfo.title,
            groupIdx: deviceInfo.groupIdx,
            signalEnable: deviceInfo.signalEnable,
            videoSrcCh: deviceInfo.videoSrcCh,
            audioSrcCh: deviceInfo.audioSrcCh
          }
          this.setDeviceList({
            type: 'update',
            index: this.deviceList.findIndex(item => item.id === deviceInfo.id),
            value: obj
          })
          this.setCurrOpenWindow(null)
          this.setProDevice(null)
        }
      })
    }
  }
}
</script>

<style lang="scss">
.property-window {
  width: 350px;
}
</style>