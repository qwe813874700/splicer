<template>
  <div class="screen-control">
    <div class="screen-header">
      <div class="flex_box">
        <span>波特率:</span>
        <el-select size="mini" class="mg-l mg-r" v-model="baudRate">
          <el-option v-for="item in baudrateList" :key="item.id" :label="item.label" :value="item.id"></el-option>
        </el-select>
        <el-button size="mini" type="primary" @click="setBrudRate(baudRate)">设置波特率</el-button>
      </div>
    </div>
    <div class="screen-body">
      <div class="screen-slider">
        <div class="inline-input">
          <div class="label-left">添加厂商名称:</div>
          <el-input size="mini" v-model="manufacturerName" @blur="manufacturerName=$event.target.value.trim()" clearable></el-input>
        </div>
        <div class="inline-input mt-2">
          <div class="label-left">厂商波特率:</div>
          <el-select size="mini" class="w-100" v-model="manufacturerBaudRate">
            <el-option v-for="item in baudrateList" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </div>
        <div class="center-button mg-t">
          <el-button type="primary" class="w-170" @click="addManufacturer">添加</el-button>
        </div>
        <div class="mg-t">
          * 单击列表显示厂商命令,右键删除厂商以及命令
        </div>
        <div class="table-container mg-t">
          <el-table
            :data="manufacturerList"
            style="min-height: 100%;"
            max-height="459"
            highlight-current-row
            ref="manufacturerTable"
            border
            size="mini"
            @row-click="handleCurrentChange"
            @row-contextmenu="(row) => showMenu(row, 0)">
            <el-table-column  prop="id" label="厂商ID" width="100"></el-table-column>
            <el-table-column  prop="name" label="厂商名称"></el-table-column>
          </el-table>
        </div>
      </div>
      <div class="screen-container">
        <div class="inline-input">
          <div class="inline-label">当前选择的厂商</div>
          <el-input size="mini" class="w-170 mg-r" readonly v-model="currentRow.id"></el-input>
          <el-input size="mini" class="w-170 max" readonly v-model="currentRow.name"></el-input>
        </div>
        <div class="inline-input mg-t">
          <div class="inline-label">开机命令</div>
          <el-input size="mini" class="input" v-model="currentRow.startCmd" @blur="currentRow.startCmd=$event.target.value.trim()" clearable></el-input>
          <el-button size="mini" type="primary" class="ms-2" :disabled="!currentRow.id" @click="setStartAndCloseCmd(0)">设置</el-button>
          <el-button size="mini" type="primary" :disabled="!currentRow.id" @click="sendStartAndCloseCommand(0)">发送</el-button>
        </div>
        <div class="inline-input mg-t">
          <div class="inline-label">关机命令</div>
          <el-input size="mini" class="input" v-model="currentRow.closeCmd" @blur="currentRow.closeCmd=$event.target.value.trim()" clearable></el-input>
          <el-button size="mini" type="primary" class="ms-2" :disabled="!currentRow.id" @click="setStartAndCloseCmd(1)">设置</el-button>
          <el-button size="mini" type="primary" :disabled="!currentRow.id" @click="sendStartAndCloseCommand(1)">发送</el-button>
        </div>
        <div class="inline-input mg-t flex-end">
          <el-checkbox v-model="currentRow.startAndCloseIsHex" true-label="HEX" false-label="ASCII" @change="isChangeStartAndClose">命令数据为十六进制</el-checkbox>
        </div>
        <div class="mg-t tips">
          添加此厂商的命令
        </div>
        <div class="inline-input mg-t">
          <div class="inline-label">命令名称</div>
          <el-input size="mini" class="w-170 mg-r" v-model="commandInfo.commandName" @blur="commandInfo.commandName=$event.target.value.trim()" clearable></el-input>
          <div class="inline-label">命令数据</div>
          <el-input size="mini" class="input" v-model="commandInfo.commandData" @blur="commandInfo.commandData=$event.target.value.trim()" clearable></el-input>
        </div>
        <div class="inline-input mg-t flex-end">
          <el-checkbox v-model="commandIsHex" true-label="HEX" false-label="ASCII">命令数据为十六进制</el-checkbox>
          <el-button type="primary" class="mg-l w-170" size="mini" :disabled="!currentRow.id" @click="addCommandList">添加</el-button>
        </div>
        <div class="inline-input mg-t between">
          <div class="tips">
            * 双击列表发送自定义命令,右键删除自定义命令
          </div>
          <el-button type="primary" class="mg-l w-170" size="mini" :disabled="!currentRow.id || !this.currentSelectCommand" @click="sendCommand(currentSelectCommand)">发送命令</el-button>
        </div>
        <div class="table-container mg-t">
          <el-table :data="commandList"
            style="min-height: 100%"
            max-height="290"
            size="mini"
            border
            highlight-current-row
            ref="commandTable"
            @row-click="setCurrSendCommand"
            @row-dblclick="sendCommand"
            @row-contextmenu="(row) => showMenu(row, 1)">
            <el-table-column  prop="id" label="命令ID" width="100"></el-table-column>
            <el-table-column  prop="manId" label="厂商ID" width="100"></el-table-column>
            <el-table-column  prop="type" label="命令类型" width="100"></el-table-column> 
            <el-table-column  prop="commandName" label="命令名称" width="100"></el-table-column> 
            <el-table-column  prop="commandData" label="命令数据"></el-table-column> 
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Stroe from 'electron-store'
import { getMinNumber, strToAsciiArr, strToHexArr, isHex } from '@/util/util'
import { remote } from 'electron'
import { LOCAL_STORE_KEY, CONNECT_TYPE_IP, CONNECT_TYPE_COM } from '@/util/global'
import { baudrateList } from '@/util/list'
const { Menu, MenuItem } = remote
const store = new Stroe()
const STORE_KEY = LOCAL_STORE_KEY.screenControlList

const manufacturerObj = () => {
  return {
    id: null,
    name: null,
    commandList: [],
    startCmd: '',
    closeCmd: '',
    startAndCloseIsHex: 'ASCII'
  }
}
export default {
  data () {
    return {
      manufacturerList: [],
      baudRate: 0,
      manufacturerName: '',
      manufacturerBaudRate: 1,
      currentRow: manufacturerObj(),
      menu: null,
      deleteInfo: {
        type: 0, // 0 厂商 1命令
        deleteId: 0
      },
      commandInfo: {
        commandName: '',
        commandData: ''
      },
      currentSelectCommand: null,
      commandIsHex: 'ASCII',
      baudrateList
    }
  },
  created () {
    this._initBossListAndCommandList()
    this._initBaudrate()
  },
  computed: {
    commandList: function () {
      const currMan = this.manufacturerList[this.getManufactuerListIndexById(this.currentRow.id)]
      return currMan ? currMan.commandList : []
    }
  },
  watch: {
    manufacturerList: {
      deep: true,
      handler: function (newVal) {
        console.log(newVal)
      }
    }
  },
  methods: {
    _initBossListAndCommandList () {
      this.manufacturerList = store.get(STORE_KEY) ? store.get(STORE_KEY).boosList : []
    },
    _initBaudrate () {
      return this.$request({ guihead: 'getCommConnCfg' }).then(res => {
        this.baudRate = res.serial.baudRate
      })
    },
    addManufacturer () { // 添加厂商
      if (this.manufacturerName.trim() === '') {
        this.$myMessage('厂商名称不能为空', 'error')
        return false
      }
      if (this.manufacturerList.filter(item => item.name === this.manufacturerName).length) {
        this.$myMessage('厂商不能重复添加', 'error')
        return false
      }
      this.manufacturerList.push(Object.assign(manufacturerObj(), {
        id: getMinNumber(this.manufacturerList, 'id', 1),
        name: this.manufacturerName,
        manufacturerBaudRate: this.manufacturerBaudRate
      }))
      this.setStoreData()
      this._initBossListAndCommandList()
      this.manufacturerName = ''
    },
    showMenu (row, type) { // 右键显示菜单
      this.menu = new Menu()
      const menuItem = new MenuItem({
        label: !type ? '删除厂商' : '删除厂商命令',
        click: () => {
          this.deleteList()
        }
      })
      this.menu.append(menuItem)
      this.deleteInfo = {
        type,
        deleteId: row.id
      }
      this.menu.popup(remote.getCurrentWindow())
    },
    deleteList () { // 删除厂商或删除厂商命令
      if (this.deleteInfo.type === 0) { // 删除厂商
        this.manufacturerList.splice(this.getManufactuerListIndexById(this.deleteInfo.deleteId), 1)
        if (this.currentRow.id === this.deleteInfo.deleteId) {
          this.$refs['manufacturerTable'].setCurrentRow()
          this.currentRow = manufacturerObj()
        }
      } else {
        this.manufacturerList[this.getManufactuerListIndexById(this.currentRow.id)].commandList.splice(this.getCommandListIndexById(this.deleteInfo.deleteId), 1)
      }
      this.setStoreData()
      this._initBossListAndCommandList()
    },
    async handleCurrentChange (row, column, event) {
      if (this.currentRow.id === row.id) {
        return false
      }
      await this.setBrudRate(row.manufacturerBaudRate)
      this.currentRow = JSON.parse(JSON.stringify(row))
      this.currentSelectCommand = null
      this.$refs['manufacturerTable'].setCurrentRow(row)
      this.$refs['commandTable'].setCurrentRow()
    },
    setStartAndCloseCmd (type) { // 0 开机命令, 1 关机命令
      const currData = this.manufacturerList[this.getManufactuerListIndexById(this.currentRow.id)]
      const currentRow = this.currentRow
      if (type === 0) {
        if (currentRow.startCmd !== '' && currentRow.startAndCloseIsHex === 'HEX' && !isHex(currentRow.startCmd)) {
          this.$myMessage('开机命令数据格式错误!', 'error')
          return false
        }
        currData['startCmd'] = this.currentRow.startCmd
      } else {
        if (currentRow.closeCmd !== '' && currentRow.startAndCloseIsHex === 'HEX' && !isHex(currentRow.closeCmd)) {
          this.$myMessage('开机命令数据格式错误!', 'error')
          return false
        }
        currData['closeCmd'] = this.currentRow.closeCmd
      }
      // this.manufacturerList[this.getManufactuerListIndexById(this.currentRow.id)] = JSON.parse(JSON.stringify(this.currentRow))
      this.setStoreData()
    },
    addCommandList () {
      const { commandName, commandData } = this.commandInfo
      if (commandName.trim() === '' || commandData.trim() === '') {
        this.$myMessage('命令名称或命令数据不能为空!', 'error')
        return false
      }
      if (this.commandIsHex === 'HEX' && !isHex(commandData)) {
        this.$myMessage('当前输入数据格式错误, 请检查输入的内容!', 'error')
        return false
      }
      const currManf = this.manufacturerList[this.getManufactuerListIndexById(this.currentRow.id)]
      currManf.commandList.push({
        id: getMinNumber(this.commandList, 'id', 1),
        manId: this.currentRow.id,
        type: this.commandIsHex,
        commandName,
        commandData
      })
      this.setStoreData()
      this.commandInfo = {
        commandName: '',
        commandData: ''
      }
      this._initBossListAndCommandList()
    },
    setStoreData () {
      store.set(STORE_KEY, {
        boosList: this.manufacturerList
      })
    },
    getManufactuerListIndexById (id) {
      return this.manufacturerList.findIndex(item => item.id === id)
    },
    getCommandListIndexById (id) {
      return this.commandList.findIndex(item => item.id === id)
    },
    sendCommand (row) {
      this.currentSelectCommand = JSON.parse(JSON.stringify(row))
      const datatype = row.type === 'ASCII' ? 0 : 1
      const sendData = {
        guihead: 'commandForwarding',
        datatype,
        cmdData: datatype === 0 ? strToAsciiArr(row.commandData) : strToHexArr(row.commandData)
      }
      this.$store.dispatch('setLoadingStatus', true)
      this.$request(sendData, false).then(res => {
        setTimeout(() => {
          this.$store.dispatch('setLoadingStatus', false)
        }, 1000)
      })
    },
    isChangeStartAndClose (value) {
      if (value === 'HEX') {
        if ((this.currentRow.startCmd !== '' || this.currentRow.closeCmd !== '') && (!isHex(this.currentRow.startCmd) || !isHex(this.currentRow.closeCmd))) {
          // 当开机命令和关机命令有一个不为空时则校验是否为Hex
          this.$myMessage('开机命令或关机命令数据格式错误', 'error')
          this.currentRow.startAndCloseIsHex = 'ASCII'
          return false
        }
      }
      this.manufacturerList[this.getManufactuerListIndexById(this.currentRow.id)] = JSON.parse(JSON.stringify(this.currentRow))
      this.setStoreData()
    },
    sendStartAndCloseCommand (type) {
      const datatype = this.currentRow.startAndCloseIsHex === 'ASCII' ? 0 : 1
      const command = type === 0 ? this.currentRow.startCmd : this.currentRow.closeCmd
      if (command === '') {
        this.$myMessage(`${type ? '关机命令' : '开机命令'}不能为空`, 'error')
        return false
      }
      if (datatype === 1 && !isHex(command)) {
        this.$myMessage(`${type ? '关机命令' : '开机命令'}指令数据格式错误`, 'error')
        return false
      }
      const data = {
        guihead: 'commandForwarding',
        datatype,
        cmdData: datatype === 0 ? strToAsciiArr(command) : strToHexArr(command)
      }
      this.$request(data)
    },
    setBrudRate (baudRate) {
      const sendData = {
        guihead: 'setCommConnCfg',
        serial: {
          baudRate
        }
      }
      return this.$request(sendData).then(res => {
        const { type, obj } = this.$store.getters.typeObj
        if (type === CONNECT_TYPE_COM) {
          obj.update({
            baudRate: this.baudrateList.filter(item => item.id === this.baudRate)[0].label
          }, (err) => {
            console.log(err)
          })
        }
      })
    },
    setCurrSendCommand (row) {
      this.currentSelectCommand = JSON.parse(JSON.stringify(row))
    }
  },
  destroyed () {
    this.setBrudRate(1)
  }
}
</script>

<style lang="scss">
$solid: 2px solid #000;

.screen-control {
  font-size: 12px;
  width: 1050px;
  height: 650px;
  display: flex;
  flex-direction: column;
  position: relative;
  .text-right {
    text-align: right;
  }
  .inline-input {
    display: flex;
    align-items: center;
    &.flex-end {
      justify-content: flex-end;
    }
    &.between {
      justify-content: space-between;
    }
    .inline-label {
      text-align: center;
      width: 120px;
    }
    .input {
      flex: 1;
    }
  }
  .inline-block {
    display: inline-block;
  }
  .w-170 {
    width: 170px;
    &.max {
      width: 250px;
    }
  }

  .screen-header {
    padding: 10px 10px 20px 10px;
    border-bottom: $solid;
  }
  .screen-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    .screen-slider {
      width: 310px;
      border-right: $solid;
      padding: 10px;
      .label-left {
        width: 120px;
        display: inline-block;
      }
      .center-button {
        text-align: center;
      }
      .table-container {
        width: 288px;
        height: 457px;
        border: 1px solid #333;
      }
    }
    .screen-container {
      flex: 1;
      border: 10px;
      padding: 10px;
      .tips {
        margin-left: 15px;
      }
      .table-container {
        height: 290px;
        border: 1px solid #333;
      }
    }
  }
  .screen-control-menu {
    position: absolute !important;
  }
}
</style>
