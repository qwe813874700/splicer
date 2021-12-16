<template>
  <div class="nav-container">
    <div class="nav-group" v-for="item in list" :key="item.label">
      <div class="group-body">
        <div class="group-item" v-for="child in item.children" :key="child.label" @click="openMethods(child.methods, child.sendData, $event)">
          <div class="group-icon">
            <img :src="child.icon" alt="" width="30">     
          </div>
          <div class="group-explain">{{ child.label }}</div>
        </div>
      </div>
      <div class="group-footer">{{ item.label }}</div>
    </div>
  </div>
</template>

<script>
import { navMixin } from '@/api/mixins/nav-mixin.js'
import { popSpliceWindowMixin } from '@/api/mixins/popwindow-mixin'
import { remote, ipcRenderer } from 'electron'
import { saveMixins } from '@/api/mixins/save-mixin'
import { LOCAL_STORE_KEY } from '@/util/global'
import Store from 'electron-store'
import fs from 'fs'
import { StringDecoder } from 'string_decoder'
const decoder = new StringDecoder('utf8')
const { dialog } = remote

export default {
  mixins: [navMixin, popSpliceWindowMixin, saveMixins],
  data () {
    return {
      list: [
        {
          label: '备份恢复',
          children: [
            {
              label: '备份',
              icon: require('@/assets/img/window.png'),
              methods: 'openSaveDialog'
            },
            {
              label: '恢复',
              icon: require('@/assets/img/window.png'),
              methods: 'restoreData'
            }
          ]
        },
        {
          label: '其他',
          children: [
            {
              label: '场景轮询',
              icon: require('@/assets/img/window.png'),
              methods: 'createNewWindow',
              sendData: 13
            }
          ]
        }
      ],
      isOpen: false
    }
  },
  methods: {
    async openSaveDialog () { // 保存备份文件
      if (this.isOpen) {
        return false
      }
      const result = await this.$util.openDialog('showSaveDialog', 'txt')
      if (result) {
        this.$writeLog('备份数据开始', this.$logType.OPERATION_CODE)
        this.setLoadingStatus(true)
        const currData = await this.allDataSave()
        const store = new Store()
        const localData = {}
        for (const key in LOCAL_STORE_KEY) {
          localData[key] = store.get(key)
        }
        const saveData = window.btoa(encodeURIComponent(JSON.stringify({
          localData,
          currData
        })))
        fs.writeFile(result, saveData, (err) => {
          this.setLoadingStatus(false)
          if (err) {
            this.$writeLog(`备份数据失败`, this.$logType.OPERATION_CODE)
          } else {
            this.$writeLog(`备份数据成功, 文件保存至${result}`, this.$logType.OPERATION_CODE)
          }
        })
      }
    },
    async restoreData () {
      const result = await this.$util.openDialog('showOpenDialog', 'txt')
      if (result) {
        fs.readFile(result[0], async (err, data) => {
          if (err) {
            this.$myMessage('打开文件失败,请重新选择文件', 'error')
          } else {
            this.setLoadingStatus(true)
            this.$writeLog(`恢复备份数据开始`, this.$logType.OPERATION_CODE)
            try {
              const { localData, currData } = JSON.parse(decodeURIComponent(window.atob(decoder.write(data)))) // 解析数据
              const store = new Store()
              for (const key in localData) {
                store.set(key, localData[key])
              }
              await this.$loopRequest(currData)
              await this.getDeviceListAndgetGroupList()
              this.setLoadingStatus(false)
              this.$writeLog(`恢复备份文件成功`, this.$logType.OPERATION_CODE)
            } catch (err) {
              this.$myMessage('请选择正确的文件', 'error')
              this.$writeLog(`恢复备份数据失败,文件选择错误`, this.$logType.OPERATION_CODE)
              this.setLoadingStatus(false)
            }
          }
        })
      }
    }
  }
}
</script>

<style></style>
