<template>
  <div class="device-activate">
    <div>
      设备序列号
    </div>
    <div class="mg-t flex-box">
      <el-input size="mini" readonly v-model="mcuid" class="flex-1 mg-r"></el-input>
      <el-button size="mini" type="primary" @click="copyContent">复制</el-button>
      <input type="text" class="d-none" ref="copyInput">
    </div>
    <div class="mg-t">
      许可文件
    </div>
    <div class="flex-box bewteen mg-t">
      <el-input size="mini" class="flex-1 mg-r" v-model="path" readonly></el-input>
      <el-button size="mini" type="primary" @click="getPath">浏览</el-button>
    </div>
    <div class="flex-box bewteen mg-t">
      <div class="flex-label">
        许可时间
      </div>
      <div class="flex-1 time">
        {{ date }}
      </div>
    </div>
    <div class="container-footer">
      <el-button size="mini" type="primary" :disabled="!path" @click="sendRoot">授权</el-button>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { StringDecoder } from 'string_decoder'
import fs from 'fs'
const decoder = new StringDecoder('utf8')
export default {
  data () {
    return {
      mcuid: null,
      date: '',
      path: '',
      content: null
    }
  },
  created () {
    this._initInfo()
  },
  methods: {
    async _initInfo () {
      await this.getMcuId()
      await this.getDeviceStatus()
    },
    getMcuId () {
      return this.$request({ guihead: 'getMcuInfo' }).then(res => {
        this.mcuid = res.mcuid
      })
    },
    getDeviceStatus () {
      return this.$request({ guihead: 'getActive' }).then(res => {
        this.date = !res.status ? '已过期' : res.date ? new Date(res.date).toLocaleString() : '永久有效'
      })
    },
    getPath () {
      this.$util.openDialog('showOpenDialog', 'sq').then(path => {
        fs.readFile(path[0], (err, data) => {
          if (err) {
            this.$myMessage('打开授权文件失败', 'error')
          } else {
            this.path = path ? path[0] : null
            this.content = decoder.write(data)
          }
        })
      })
    },
    copyContent () {
      const text = this.mcuid
      const input = this.$refs['copyInput']
      input.value = text // 修改文本框的内容
      input.select() // 选中文本
      document.execCommand('copy') // 执行浏览器复制命令
    },
    sendRoot () {
      const sendData = {
        guihead: 'setActive',
        serial: this.content
      }
      this.$request(sendData).then(res => {
        if (res.result === this.$ERR_CODE) {
          this.path = null
          this.content = null
          this.$myMessage('授权失败, 请重新选择授权文件', 'error')
        } else {
          this.$store.dispatch('getDeviceListAndgetGroupList')
          this.$store.dispatch('setCurrOpenWindow', null)
        }
      })
    }
  }
}
</script>

<style lang="scss">
.device-activate {
  width: 410px;
  padding: 10px;
  .time {
    text-align: right;
  }
}
</style>
