<template>
  <div class="pop-splice-window flex-box">
    <div class="pop-left mg-r">
      <div class="window-container mg-t-0">
        <div class="container-title">分组设置</div>
        <div class="table-container">
          <el-table
            :data="groupTableList"
            style="min-height: 100%;"
            max-height="393px"
            border
            size="mini"
            highlight-current-row
            @current-change="selectGroupTableList">
            <el-table-column  prop="id" label="分组序号" width="80"></el-table-column>
            <el-table-column  prop="groupName" label="分组名"  width="80"></el-table-column>
            <el-table-column  prop="groupInfo" label="拼接类信息"></el-table-column>
          </el-table>
        </div>
        <div class="container mg-t">
          <div class="flex-box between">
            <el-button size="mini" type="primary" @click="addGroup()">添加分组</el-button>
            <el-button size="mini" type="primary" @click="setScreenShow(2)" :disabled="!currTableList">修改分组</el-button>
            <el-button size="mini" type="primary" :disabled="!currTableList" @click="deleteGroupTable">删除分组</el-button>
          </div>
        </div>
      </div>
      <div class="window-container">
        <div class="container-title">拼接设置</div>
        <div class="container">
          <div class="flex-box mg-t">
            <div class="screen-box mg-r">
              <div class="title">物理屏幕: (行-列)</div>
              <div class="screen mg-t flex-box">
                <el-input size="mini" v-model.number="row" :maxlength="2" @blur="saveTrueNumber($event, 'row', 16)" @change="changeRowAndCol('row')"></el-input>
                <div class="label mg-l mg-r">*</div>
                <el-input size="mini" v-model.number="col" :maxlength="2" @blur="saveTrueNumber($event, 'col', 16)" @change="changeRowAndCol('col')"></el-input>
              </div>
            </div>
            <div class="screen-box">
              <div class="title">逻辑屏幕: (行-列)</div>
              <div class="screen mg-t flex-box">
                <el-input size="mini" v-model.number="minRow" :maxlength="1" @blur="saveTrueNumber($event, 'minRow', 4)"></el-input>
                <div class="label mg-l mg-r">*</div>
                <el-input size="mini" v-model.number="minCol" :maxlength="1" @blur="saveTrueNumber($event, 'minCol', 4)"></el-input>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="container-footer">
        <el-button size="mini" type="primary" class="w-80" @click="confirmGroupList">确认</el-button>
      </div>
    </div>
    <div class="pop-right flex-1">
      <div class="pop-window-back">
        <div class="pop-window-item"
          v-for="(item, index) in windowItemList.list"
          :key="item.id"
          :style="item"
          :class="`back-group-${getAddGroupId(item.id)}`">
          <div>
            <div class="window-item-title">{{ item.id }} 屏幕分辨率</div>
            <div class="window-item-container">
              {{ item.resWidth }} × {{ item.resHeight }} {{ item.refresh }}Hz
            </div>
            <el-select v-model="selectArr[index]" size="mini" class="w-100" :disabled="getAddGroupId(item.id) > 0" @change="changeWindowPosition(index)">
              <el-option v-for="list in windowItemList.selectOptionArr" :key="list.id" :label="list.label" :value="list.id" :disabled="getAddGroupId(list.id) > 0"></el-option>
            </el-select>
          </div>
        </div>
        <pop-window title="添加分组" v-if="showScreen === 1" @closeWindow="setScreenShow(null)">
          <add-group-window @closeWindow="setScreenShow(null)"></add-group-window>
        </pop-window>  
        <pop-window title="修改分组" v-if="showScreen === 2" @closeWindow="setScreenShow(null)">
          <update-group-window :currTableList="currTableList" @closeWindow="setScreenShow(null)"></update-group-window>
        </pop-window>  
      </div>
    </div>
  </div>
</template>

<script>
import { popSpliceWindowMixin } from '@/api/mixins/popwindow-mixin'
import AddGroupWindow from './AddGroupWindow.vue'
import UpdateGroupWindow from './UpdateGroupWindow.vue'
import PopWindow from '@/components/Common/PopWindow/PopWindow'

export default {
  mixins: [popSpliceWindowMixin],
  watch: {
    rushList: function (newVal, oldVal) { // 重新选择分辨率时, 自动选择第一项刷新率
      this.setDataByKey({
        mutationsKeys: 'SET_SELECT_RUSH',
        val: newVal[0].id
      })
    }
  },
  created () {
    this.saveOldData()
    this.getSpliceSetting()
    this._initScreenSelectOption()
  },
  components: {
    AddGroupWindow,
    UpdateGroupWindow,
    PopWindow
  },
  data () {
    return {
      showScreen: null,
      currTableList: null,
      type: 0,
      closeType: 0, // 判断当前是点确认还是点X关闭当前页面 0: 关闭 1:确认
      selectOption: [], // 生成选项值
      selectArr: [] // 一开始绑定的值,screenList的值
    }
  },
  methods: {
    getSpliceSetting () {
      this.$store.dispatch('getSpliceSetting')
    },
    _initScreenSelectOption () {
      this.selectArr = this.screenList.slice(0)
    },
    saveOldData () {
      this.setDataByKey({ // 将原来的数据存下来
        mutationsKeys: 'SET_OLD_DATA',
        val: {
          groupList: this.groupList.slice(0),
          physicalColumn: this.physicalColumn,
          physicalRow: this.physicalRow,
          logicalColumn: this.logicalColumn,
          logicalRow: this.logicalRow,
          splicingModule: this.splicingModule,
          screenH_Edge: this.screenH_Edge,
          screenV_Edge: this.screenV_Edge,
          selectRes: this.selectRes,
          selectRush: this.selectRush,
          screenList: this.screenList
        }
      })
      // this.oldDeviceList = JSON.parse(JSON.stringify(this.deviceList))
    },
    setScreenShow (id) {
      this.showScreen = id
    },
    selectGroupTableList (val) {
      this.currTableList = val
    },
    addGroup () {
      if (this.groupTableList.length >= 5) {
        this.$myMessage('最多只能创建5个分组', 'error')
      } else {
        this.setScreenShow(1)
      }
    },
    deleteGroupTable () {
      const sendData = {
        guihead: 'delSplicingGroup',
        groupIdx: this.currTableList.id
      }
      this.setConfirmSettingCommanLis({
        type: 'add',
        value: sendData
      })
      this.setGroupList({
        type: 'delete',
        index: this.groupTableList.indexOf(this.currTableList)
      })
      this.currTableList = null
      // request(sendData).then(res => {
      //   if (res.result === this.$ERR_CODE) {
      //     message('删除分组失败', 'error')
      //   } else {
      //     message('删除分组成功')
      //     this.setGroupList({
      //       type: 'delete',
      //       index: this.groupTableList.indexOf(this.currTableList)
      //     })
      //     this.currTableList = null
      //   }
      // })
    },
    confirmGroupList () {
      this.setLoadingStatus(true)
      const sendData = [{
        guihead: 'setSplicingSetting',
        splicingModule: this.selectType,
        physicalRow: this.row,
        physicalColumn: this.col,
        logicalRow: this.minRow,
        logicalColumn: this.minCol,
        screenList: this.screenList
      }].concat(this.confirmSettingCommanLis)
      const sendCommanList = (start = 0, sendDataList) => {
        return new Promise((resolve, reject) => {
          const sendCommand = (index) => {
            this.$request(sendDataList[index]).then(res => {
              if (index < sendDataList.length - 1) {
                return sendCommand(++index, sendDataList)
              } else {
                return resolve()
              }
            }).catch(err => {
              console.log(err)
            })
          }
          sendCommand(start)
        })
      }
      sendCommanList(0, sendData).then(res => {
        this.closeType = 1
        this.setCurrOpenWindow(null)
        this.setDataByKey({
          mutationsKeys: 'SET_IS_CHANGE_GROUP_LIST',
          val: true
        })
        this.getDeviceListAndgetGroupList()
        this.setDeviceList({
          type: 'set',
          value: []
        })
        this.setConfirmSettingCommanLis({
          type: 'set',
          value: []
        })
        this.setLoadingStatus(false)
      })
    },
    changeWindowPosition (index) { // 改变窗口位置 对调
      const newData = this.selectArr[index]
      const oldData = this.screenList[index]
      this.selectArr[this.screenList.indexOf(newData)] = oldData
      this.setDataByKey({
        mutationsKeys: 'SET_DATA',
        val: {
          screenList: this.selectArr
        }
      })
    },
    changeRowAndCol (key) {
      this.setDataByKey({
        mutationsKeys: key === 'row' ? 'SET_PRESET_ROW' : 'SET_PRESET_COL',
        val: this[key]
      })
      this.setScreenList()
      this._initScreenSelectOption()
    }
  },
  destroyed () {
    if (!this.closeType) { // 当前不是点确认按钮时, 将会关闭当前窗口
      this.setDataByKey({
        mutationsKeys: 'SET_DATA',
        val: this.oldData
      })
    }
  }
}
</script>

<style lang="scss">
$height: 615px;
.pop-splice-window {
  width: 950px;
  padding: 10px;
  .w-80 {
    width: 80px;
  }
  .pop-left {
    width: 350px;
    height: $height;
  }
  .pop-right {
    border: 1px solid #000;
    height: $height;
    background: #fff;
    overflow: auto;
    background: rgb(245, 245, 245);
  }
  .table-container {
    height: 393px;
  }
  .pop-window-back {
    min-width: 100%;
    min-height: 100%;
    position: relative;
    background: rgb(245, 245, 245);
    transform-origin:0 0;
    .pop-window-item {
      background: rgb(211, 211, 211);
      border: 1px solid #000;
      position: absolute;
      margin: -1px;
      font-size: 10px;
      &.back-group-0 {
        background: rgb(189, 251, 212)
      }
      &.back-group-1 {
        background: rgb(189, 176, 239)
      }
      &.back-group-2 {
        background: rgb(185, 214, 226)
      }
      &.back-group-3 {
        background: rgb(222, 224, 190)
      }
      &.back-group-4 {
        background: rgb(235, 239, 251)
      }
      &.select {
        background: rgb(0, 0, 255);
      }
      .window-item-title, .window-item-container {
        margin: 5px;
      }
    }
  }
  .el-table .hidden-columns {
    display: none;
  }
}
</style>
