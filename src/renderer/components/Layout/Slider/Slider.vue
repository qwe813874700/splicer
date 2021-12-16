<template>
  <div class="slider-layout">
    <div class="slider-layout-left">
      <div class="slider-header">
        控制器输入
      </div>
      <div class="slider-container">
        <el-tree
          ref="deviceSelect"
          :data="treeList "
          :props="defaultProps"
          node-key="id"
          :default-expand-all="true"
          show-checkbox
          @check="changeNodeClick"
          :expand-on-click-node="false"
          :check-on-click-node="true"
          @node-contextmenu="(event, data) => showMenu(data)"
          check-strictly>
          <span class="custom-tree-node" slot-scope="{ node }">
            <span class="el-icon-eleme"></span>
            <span>{{ node.label }}</span>
          </span> 
        </el-tree>
      </div>
      <!-- <div class="slider-footer">
        <div class="slider-item active">控制器输入</div>
        <div class="slider-item">IPC输入源</div>
      </div> -->
    </div>
    <div class="slider-layout-right">

    </div>
    <pop-window title="改名" v-if="showChangeNameStatus === 1" @closeWindow="setScreenShow(null)">
      <div>请输入新的名称</div>
      <el-input size="mini" class="my-2" v-model="currOpenCartObj.label"></el-input>
      <div class="text-end">
        <el-button size="mini" type="primary" @click="setChangeName">确认</el-button>
      </div>
    </pop-window>
    <pop-window title="设置OSD" v-if="showChangeNameStatus === 2" @closeWindow="setScreenShow(null)">
      <div class="osd-container">
        <div>请输入新的名称</div>
        <el-input size="mini" class="my-2 ps-2" v-model="osdConfig.osdContent" :maxlength="8"></el-input>
        <div class="window-container">
          <div class="container-title">位置</div>
          <div class="container">
            <div class="d-flex">
              <div class="flex-1 mx-1">
                <div>x:</div>
                <el-input size="mini" v-model="osdConfig.x" type="number"></el-input>
              </div>
              <div class="flex-1 mx-1">
                <div>y:</div>
                <el-input size="mini" v-model="osdConfig.y" type="number"></el-input>
              </div>
            </div>
          </div>
        </div>
        <div class="window-container">
          <div class="container-title">字体颜色</div>
          <div class="container">
            <div class="d-flex justify-content-between">
              <el-radio v-model="osdConfig.color" label="255,255,255">白</el-radio>
              <el-radio v-model="osdConfig.color" label="0,0,0">黑</el-radio>
              <el-radio v-model="osdConfig.color" label="255,0,0">红</el-radio>
            </div>
          </div>
        </div>
        <div class="container-footer">
          <el-button type="primary" size="mini" @click="setOsd">确认</el-button>
        </div>
      </div>
    </pop-window>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { remote } from 'electron'
import PopWindow from '@/components/Common/PopWindow/PopWindow'
import fs from 'fs'
import path from 'path'
import Store from 'electron-store'
import { LOCAL_STORE_KEY } from '@/util/global'

const storeSliderKey = LOCAL_STORE_KEY.sliderList
const { Menu, MenuItem } = remote

export default {
  data () {
    return {
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      menu: null,
      showChangeNameStatus: null,
      changeName: '',
      currOpenCartObj: {
        label: '',
        id: null
      },
      osdConfig: {
        x: 0,
        y: 0,
        osdContent: '',
        color: '255,255,255'
      }
    }
  },
  computed: {
    ...mapGetters(['currDevice', 'cardList', 'treeList', 'treeChildList'])
  },
  components: {
    PopWindow
  },
  created () {
    this._initMenu()
  },
  methods: {
    ...mapActions(['setCurrDevice', 'setDataByKey', 'setLoadingStatus']),
    changeNodeClick (node, data, child) {
      const newNode = JSON.parse(JSON.stringify(node))
      const deviceSelect = this.$refs['deviceSelect']
      deviceSelect.setCheckedNodes([])
      if (!this.currDevice) {
        deviceSelect.setCheckedNodes([newNode])
      } else {
        if (this.currDevice.id !== newNode.id) {
          deviceSelect.setCheckedNodes([newNode])
        }
      }
      const currSelectNode = deviceSelect.getCheckedNodes(true)
      if (currSelectNode.length > 0) {
        this.setCurrDevice(newNode)
      } else {
        this.setCurrDevice(null)
      }
    },
    showMenu (data) { // 右键显示菜单
      if (data.children) {
        return false
      }
      this.currOpenCartObj = JSON.parse(JSON.stringify(data))
      this.menu.popup(remote.getCurrentWindow())
    },
    setScreenShow (id) {
      this.showChangeNameStatus = id
    },
    setChangeName () {
      const currIndex = this.treeChildList.findIndex(item => item.id === this.currOpenCartObj.id)
      const store = new Store()
      if (this.treeChildList[currIndex].label === this.currOpenCartObj.label) {
        return false
      }
      const localSliderStore = store.get(storeSliderKey)
      let currStoreIndex = -1 // 查找在本地存储中的数据
      if (localSliderStore) {
        currStoreIndex = localSliderStore.findIndex(item => item.id === this.currOpenCartObj.id && item.slotIdx === this.currOpenCartObj.slotIdx)
        if (currStoreIndex > -1) {
          localSliderStore[currStoreIndex] = this.currOpenCartObj
        } else {
          localSliderStore.push(this.currOpenCartObj)
        }
        store.set(storeSliderKey, localSliderStore)
      } else {
        store.set(storeSliderKey, [this.currOpenCartObj])
      }
      this.setDataByKey({
        mutationsKeys: 'SET_INPUT_CART_LIST',
        val: {
          type: 'update',
          index: currIndex,
          value: this.currOpenCartObj
        }
      })
      this.setScreenShow(null)
    },
    setOsd () {
      const changeCharCodeArr = this.$util.strArrUnicodeToAnsiDecArr(this.osdConfig.osdContent)
      const unicodeArr = this.$util.strToAsciiArr(this.osdConfig.osdContent)
      this.setLoadingStatus(true)
      fs.readFile(path.join(process.cwd(), '/resources/static/font/SongTi_25_3232_gb3212.DAT'), (err, fileData) => {
        if (err) {
          this.$myMessage('读取字库文件失败', 'error')
          this.setLoadingStatus(false)
        } else {
          const fontScale = 4
          const sendDataList = []
          const color = this.osdConfig.color.split(',')

          changeCharCodeArr.forEach((item, index) => {
            const banCode = item[0] ? item[0] - 160 : 3
            const rowCode = item[0] ? item[1] - 160 : item[1] + 128 - 160
            const offset = ((banCode - 1) * 94 + (rowCode - 1)) * 32 * fontScale
            sendDataList.push({
              guihead: 'setInputOsd',
              unicodeDat: [unicodeArr[index]],
              inputIdx: this.currOpenCartObj.id,
              osdIdx: 1,
              slotIdx: this.currOpenCartObj.slotIdx,
              frontColor: {
                R: Number(color[0]),
                G: Number(color[1]),
                B: Number(color[2])
              },
              dotMatrixDat: {
                startIdx: index,
                dataList: Array.from(fileData.slice(offset, offset + 128))
              },
              osdArea: {
                frontNum: changeCharCodeArr.length,
                upperLeft_X: this.osdConfig.x,
                upperLeft_Y: this.osdConfig.y
              }
            })
          })
          this.$writeLog(`设置OSD`, this.$logType.OPERATION_CODE)
          this.$loopRequest(sendDataList).then(res => {
            this.setScreenShow(null)
            this.$writeLog(`设置OSD完成`, this.$logType.OPERATION_CODE)
            this.setLoadingStatus(false)
          })
        }
      })
    },
    _initMenu () {
      this.menu = new Menu()
      const menuItem = [
        {
          label: '改名',
          click: () => {
            this.setScreenShow(1)
          }
        },
        {
          label: 'OSD配置',
          click: () => {
            this.setScreenShow(2)
          }
        }
      ]
      menuItem.forEach(item => {
        this.menu.append(new MenuItem(item))
      })
    }
  }
}
</script>

<style lang="scss">
$right_width: 5px;
$header_height: 25px;
$back_color: linear-gradient(#dfe9f3, #b8d7ff);
.slider-layout {
  width: 100%;
  height: 100%;
  .slider-layout-left {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: $right_width;
    .slider-header {
      height: $header_height;
      line-height: $header_height;
      font-size: 14px;
      padding-left: 5px;
      font-weight: 600;
      background: $back_color;
    }
    .slider-container {
      background: #fff;
      position: absolute;
      top: $header_height;
      bottom: 0;
      left: 0;
      right: 0;
    }
    .slider-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      .slider-item {
        height: 30px;
        line-height: 30px;
        background: $back_color;
        padding-left: 5px;
        font-size: 14px;
        color: rgb(32, 77, 137);
        &.active {
          color: #333;
          font-weight: 600;
          background: linear-gradient(#fdf5b5, #f9cf09, #f1e6a9);
        }
        &:hover {
          background: linear-gradient(#f7eda6, #f3d440, #f7eda6);
        }
      }
    }
  }
  .slider-layout-right {
    width: $right_width;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    background: rgb(191, 219, 255);
  }
  .osd-container {
    width: 300px;
  }
}
</style>
