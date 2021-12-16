<template>
  <div class="layout">
    <div class="splice-header">
      <nav-header></nav-header>
    </div>
    <div class="splice-body">
      <div class="body-left">
        <Slider></Slider>
      </div>
      <div class="body-right">
        <splice-window></splice-window>
      </div>
    </div>
    <div class="splice-footer">
      <Footer></Footer>
    </div>
    <div class="splice-pop-window">
      <all-window></all-window>
    </div>
    <Loading v-if="loadingStatus"></Loading>
  </div>
</template>

<script>
import NavHeader from '@/components/Layout/NavHeader/NavHeader'
import Slider from '@/components/Layout/Slider/Slider'
import SpliceWindow from '@/components/Layout/SpliceWindow/SpliceWindow'
import Footer from '@/components/Layout/Footer/Footer'
import AllWindow from '@/components/Layout/AllWindow/AllWindow'
import Loading from '@/components/Common/Loading/Loading'
import Stroe from 'electron-store'
import { ipcRenderer, remote } from 'electron'
import SerialPort from 'serialport'
import { StringDecoder } from 'string_decoder'
import { isJSON, message } from '@/util/util'
import { mapGetters, mapActions } from 'vuex'
import { createLog } from '@/util/log'
const decoder = new StringDecoder('utf8')
const { ipcMain, app } = remote

export default {
  // mixins: [resizeMixin],
  components: {
    NavHeader,
    Slider,
    SpliceWindow,
    Footer,
    AllWindow,
    Loading
  },
  async created () {
    this.setLoadingStatus(true)
    await this._initLogInfo() // 创建log文件
    this._initConnect() // 创建连接
    await this._initGroupInfo() // 查询分组和窗口信息
    this._initMainListening() // 创建监听, 通讯改变时重新连接
    this.setLoadingStatus(false)
  },
  computed: {
    ...mapGetters(['typeObj', 'loadingStatus'])
  },
  methods: {
    ...mapActions(['setLoadingStatus']),
    async _initGroupInfo () {
      this.$writeLog('初始化分组和窗口信息', this.$logType.OPERATION_CODE)
      await this.$store.dispatch('getDeviceListAndgetGroupList')
      this.$writeLog('初始化分组和窗口信息完成', this.$logType.OPERATION_CODE)
    },
    _initLogInfo () {
      const date = new Date()
      const logName = `${app.getPath('logs')}/log_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}.txt`
      this.$store.dispatch('setLogName', logName)
      return createLog(logName)
    },
    _initConnect () { // 创建连接
      const store = new Stroe()
      const typeObj = store.get('connectType')
      if (this.typeObj && typeObj.obj === this.typeObj.obj.path) { // 如果通讯方式不变, 则不重新建立连接
        return false
      } else {
        this.closeConnectAndRemoveLister()
      }
      if (typeObj.type === 'ip') {
        this.$store.dispatch('setTypeObj', typeObj)
      } else { // 如果是串口方式
        const serialObj = new SerialPort(typeObj.obj, {
          baudRate: 115200,
          autoOpen: false
        })
        typeObj.obj = serialObj
        this.$store.dispatch('setTypeObj', typeObj)
        let dataArr = Buffer.from([])
        ipcMain.on('createComContent', (e) => { // 创建一个主进程监听, 否则串口会有失效, 只能在主进程中使用串口
          serialObj.open((err) => {
            if (err) {
              this.$myMessage('串口连接失败', 'error')
            } else {
              serialObj.on('data', (resData) => {
                const timeout = setTimeout(() => {
                  serialObj.flush()
                  dataArr = Buffer.from([])
                }, 5000)
                dataArr = Buffer.concat([dataArr, resData]) // 串口可能分几次回数据, 当拼接为JSON时, 再将数据返回
                const decoderData = decoder.write(dataArr)
                console.log('串口数据回复打印 -> ', decoderData, isJSON(decoderData))
                if (isJSON(decoderData)) {
                  clearTimeout(timeout)
                  dataArr = Buffer.from([])
                  const jsonData = JSON.parse(decoderData)
                  e.sender.send(jsonData.guihead, jsonData)
                }
              })
            }
          })
          serialObj.on('error', (err) => {
            console.log(err)
          })
        })
        ipcRenderer.send('createComContent')
      }
    },
    _initMainListening () {
      ipcMain.on('initConnect', (e) => {
        this._initConnect()
      })
    },
    closeConnectAndRemoveLister () {
      ipcMain.removeAllListeners('createComContent')
      if (!this.typeObj) {
        return false
      }
      if (this.typeObj.type === 'ip') {
        console.log(6)
      } else {
        this.typeObj.obj && this.typeObj.obj.close()
      }
    }
  },
  destroyed () {
    ipcMain.removeAllListeners('initConnect')
    this.closeConnectAndRemoveLister()
  }
}
</script>

<style lang="scss">

</style>
