<template>
  <div class="connect">
    <div class="window-container">
      <div class="container-title">控制器通讯端口配置</div>
      <div class="container mg-t">
        <el-row>
          <el-col :span="12">
            <el-radio v-model="type" :label="0">使用NET连接</el-radio>
            <div class="mx-4 my-1">设备IP地址:</div>
            <div class="ms-4">
              <el-input v-model="ip" class="w-50" disabled size="mini"></el-input>
            </div>
          </el-col>
          <el-col :span="12">
            <el-radio v-model="type" :label="1">使用COM连接</el-radio>
            <div class="mx-4 my-1">COM口:</div>
            <div class="ms-4">
              <el-select v-model="comSelect" size="mini" :disabled="type == 0" @visible-change="changeComSelect">
                <el-option v-for="item in comList" :label="item.path" :key="item.pnpId" :value="item.path"></el-option>
              </el-select>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <!-- <div class="window-container">
      <div class="container-title">预设回显设置</div>
      <div class="container mg-t">
        <el-form label-width="130px">
          <el-form-item label="选择接收数据网卡">
            <el-select v-model="comSelect" size="mini">
              <el-option v-for="item in netwrokList" :key="item.mac" :label="item.name" :value="item.address"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div> -->
    <div class="window-container">
      <div class="container-title">网络检测与配置</div>
      <div class="container">
        <el-table :data="deviceList" border size="mini"  :max-height="200" style="height: 200px;" @row-click="handleClickRow">
          <el-table-column
            prop="mac"
            label="MAC地址">
          </el-table-column>
          <el-table-column
            prop="address"
            label="IP地址">
          </el-table-column>
          <el-table-column
            prop="mask"
            label="子网掩码">
          </el-table-column>
          <el-table-column
            prop="gateway"
            label="网关地址">
          </el-table-column>
        </el-table>
        <div class="mt-3 text-end">
          <el-button size="mini" type="primary" @click="serachIp">搜索设备</el-button>
        </div>
      </div>
    </div>
    <div class="window-container">
      <div class="container-title">控制器IP与MAC地址修改</div>
      <div class="container">
        <el-row :gutter="5">
          <el-col :span="6">
            <div class="mx-4 my-1">MAC地址:</div>
            <div class="ms-4">
              <el-input v-model="controlObj.mac" size="mini"></el-input>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="mx-4 my-1">IP地址:</div>
            <div class="ms-4">
              <el-input v-model="controlObj.ip" size="mini"></el-input>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="mx-4 my-1">子网掩码:</div>
            <div class="ms-4">
              <el-input v-model="controlObj.mask" size="mini"></el-input>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="mx-4 my-1">网关:</div>
            <div class="ms-4">
              <el-input v-model="controlObj.gateway" size="mini"></el-input>
            </div>
          </el-col>
        </el-row>
        <div class="mt-3 text-end">
          <el-button size="mini" type="primary" @click="readConfig">读取配置</el-button>
          <el-button size="mini" type="primary">修改配置</el-button>
        </div>
      </div>
    </div>
    <div class="mt-3 text-end">
      <el-button size="mini" type="primary">刷新</el-button>
      <el-button size="mini" type="primary" @click="connectDevice">确认</el-button>
      <el-button size="mini" type="primary">取消</el-button>
    </div>
  </div>
</template>

<script>
import IpInput from '../Common/IpInput/IpInput.vue'
import SerialPort from 'serialport'
import dgram from 'dgram'
import { getNetworkBroadcastAddr } from '../../util/getIp'
import { ipcRenderer } from 'electron'
import Store from 'electron-store'
import { CONNECT_TYPE_IP, CONNECT_TYPE_COM } from '@/util/global'

const os = require('os')
const BROA_ADDRESS = '255.255.255.255' // 广播地址
const SEND_PORT = 30600 // 广播端口
const SEND_BROADCAST_CONTENT = 'a' // 广播内容
const store = new Store()

export default {
  components: {
    IpInput
  },
  data () {
    return {
      type: 0, // 当前使用的是NET连接还是串口连接
      ip: '', // 当前选择设备的IP地址
      comSelect: null, // 串口选择
      deviceSelect: null, // 设备选择
      deviceList: [], // 搜索到的设备列表
      netwrokList: [], // 网卡列表
      networkSelect: '',
      comList: [], // 串口列表
      serialObj: null,
      baudrate: 115200, // 波特率
      controlObj: {
        mac: '08：00：20：0A：8C：6D',
        ip: '192.168.1.100',
        mask: '255.255.255.0',
        gateway: '192.168.1.1'
      }
    }
  },
  created () {
    this.netwrokList = this.getNetwrokInterface()
    this.initData()
    document.title = '通信设置'
    // this.bindUdp()
  },
  computed: {
    ipObj () {
      return this.deviceList.filter(item => item.address === this.ip)[0]
    }
  },
  methods: {
    getNetwrokInterface () {
      const allNetwork = os.networkInterfaces()
      const currAllIp = []

      Object.keys(allNetwork).forEach(key => {
        allNetwork[key].forEach(item => {
          if (item.address !== '127.0.0.1' && item.family === 'IPv4' && item.mac !== '00:00:00:00:00:00') {
            currAllIp.push(Object.assign(item, { name: key }))
          }
        })
      })

      return currAllIp
    },
    initData () {
      SerialPort.list().then(ports => {
        this.comList = ports
        if (!this.comSelect || ports.filter(item => this.comSelect === item.path).length === 0) { // 当已选项在串口列表中未找到时,说明已被断开
          this.comSelect = ports[0].path
        }
      })
    },
    getAllBroadcast () { // 计算出当前所有的广播地址
      const allNetwork = this.getNetwrokInterface()

      const currAllBroadcast = []
      allNetwork.forEach(item => {
        currAllBroadcast.push(getNetworkBroadcastAddr(item.netmask, item.address).broadcast)
      })

      return currAllBroadcast
    },
    addIplist (ipObj) {
      if (ipObj.size === 55 && this.deviceList.filter(item => item.address === ipObj.address).length === 0) {
        this.deviceList.push(ipObj)
      }
    },
    sendUdpByBroadcast () { // 发送udp包当前网卡的广播地址
      const allBroadcast = this.getAllBroadcast()

      allBroadcast.forEach(item => {
        const server = dgram.createSocket('udp4')

        server.bind(() => {
          server.setBroadcast(true)
        })

        server.on('message', (msg, rinfo) => { // 添加广播监听, 收到广播时自动将数据添加到ipList显示出来
          if (msg.byteLength === 55) {
            this.addIplist({
              size: rinfo.size,
              address: rinfo.address,
              mac: msg.slice(0, 6).map(item => item.toString(16)).join(':'),
              gateway: msg.slice(10, 14).join('.'),
              mask: msg.slice(14, 18).join('.')
            })
          }
        })

        server.send(SEND_BROADCAST_CONTENT, SEND_PORT, item)
      })
    },
    sendUdpByIp () { // 用网卡发送UDP包到255.255.255.255
      const allNetworkCard = this.getNetwrokInterface()
      allNetworkCard.forEach(item => {
        const server = dgram.createSocket('udp4')
        server.bind(SEND_PORT, item.address, () => {
          server.setBroadcast(true)
        })
        server.on('message', (msg, rinfo) => {
          if (msg.byteLength === 55) {
            this.addIplist({
              size: rinfo.size,
              address: rinfo.address,
              mac: msg.slice(0, 6).map(item => item.toString(16)).join(':'),
              gateway: msg.slice(10, 14).join('.'),
              mask: msg.slice(14, 18).join('.')
            })
            server.close()
          }
        })
        server.send(SEND_BROADCAST_CONTENT, SEND_PORT, BROA_ADDRESS)
      })
    },
    serachIp () { // 为了以防万一搜不到设备 所以发一次广播地址, 用网卡发一次255.255.255.255
      // this.sendUdpByBroadcast()
      this.sendUdpByIp()
    },
    connectSerial () {
      return new Promise((resolve, reject) => {
        if (this.serialObj) {
          this.serialObj.close()
          this.serialObj = null
        }
        setTimeout(() => {
          this.serialObj = new SerialPort(this.comSelect, {
            baudRate: this.baudrate,
            autoOpen: false
          })
          this.serialObj.on('error', (err) => {
            reject(err)
          })
          this.serialObj.open((err) => {
            if (err) {
              if (err.message.includes('Access denied') && store.get('connectType').obj === this.comSelect) {
                resolve()
              } else {
                reject(err)
              }
            } else {
              resolve()
            }
          })
        }, 100)
      })
    },
    handleClickRow (row, column, event) {
      this.ip = row.address
    },
    connectDevice () {
      if (!this.type) {
        if (this.ip === '') {
          this.$notify({
            title: '错误',
            message: '请选择需要连接的设备',
            type: 'error'
          })
        } else {
          store.set('connectType', {
            type: CONNECT_TYPE_IP,
            obj: this.ipObj
          })
          this.sendMainCommand()
        }
      } else {
        this.connectSerial().then(() => {
          this.serialObj.close()
          this.serialObj = null
          store.set('connectType', {
            type: CONNECT_TYPE_COM,
            obj: this.comSelect
          })
          this.sendMainCommand()
        }).catch(err => {
          this.$notify({
            title: '错误',
            message: '串口连接失败',
            type: 'error'
          })
          console.log(err)
        })
      }
    },
    sendMainCommand () {
      ipcRenderer.send('confirmSendType', true)
      ipcRenderer.send('initConnect')
      ipcRenderer.send('closeConnectChild')
    },
    changeComSelect (type) { // 在展开COM下拉列表时重新获取串口数据, 防止中途拔掉串口的情况
      if (type) {
        this.initData()
      }
    },
    readConfig () {
    }
  }
}
</script>

<style lang="scss">
.connect {
  padding: 20px;
  background: rgb(240, 240, 240)
}
</style>