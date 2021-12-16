<template>
  <div class="splice-windows" ref="windows-container"
    @mousewheel="scaleWindow"
    @mousedown.left="setMoveState(true, $event)"
    @mouseup.left="setMoveState(false)" 
    @mousemove="moveBack"
    @mouseleave="setMoveState(false)">
    <div class="windows-container" :style="styleObj">
      <div class="window" v-for="item in windowList" :key="item.id" :style="item">
        <div class="window-index" v-text="item.id"></div>
        <div class="window-item"
          v-for="list in item.children"
          :key="list.id"
          :style="list"
          @mousedown.left="beginCreateWindow($event, item, list)">
        </div>
      </div>
      <Window 
        v-for="list in currGroupDeviceList"
        :options="list"
        :key="-list.id * 100"
        :class="{active: list.id === currSelectWindowId}"
        @setTop="setTop(list)"
        @moveWindow="(coord) => moveWindow(list, coord)"
        @moveEnd="(coord) => moveEnd(list, coord)"
        @resizeWindow="(coord) => resizeWindow(list, coord)"
        @resizeEnd="(coord) => resizeEnd(list, coord)"
        @closeWindow="closeWindow(list.id)"
        @reserveWindow="reserveWindow(list, true)"
        @maxWindow="$event => maxWindow(list, $event)"
        @adaptionWindow="adaptionWindow(list)"
        @setBottom="operationWindow(list, windowOperation.setBottom)"
        @addOneTop="operationWindow(list, windowOperation.addOneTop)"
        @subOneBottom="operationWindow(list, windowOperation.subOneBottom)"
        @resizeInputWindow="operationWindow(list, windowOperation.resizeInputWindow)"
        @maxCurrInputwindow="operationWindow(list, windowOperation.maxCurrInputwindow)"
        @resizeAllInputWindow="operationWindow(list, windowOperation.resizeAllInputWindow)"
        @setWindowPro="setWindowPro(list)"
        @closeSignal="operationWindow(list, windowOperation.closeSignal)"
        @closeAllSignal="operationWindow(list, windowOperation.closeAllSignal)">
      </Window>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Window from '../../Common/Window/Window.vue'
import { getMinNumber, getWindowXy } from '@/util/util'
import { WINDOW_OPERATION } from '../../../util/global'

export default {
  components: {
    Window
  },
  data () {
    return {
      windowList: [],
      styleObj: {}, // 可以设置该对象从而改变核心的样式
      scale: 1, // 记录当前背景缩放情况
      lockTime: false, // 用于鼠标进行缩放时,而导致多次触发函数
      isMoveBack: false, // 用于记录当前是否在拖拽背景状态,
      isCreateWindow: false,
      startInfo: {
        x: 0,
        y: 0
      },
      translate: { // 记录背景的偏移量
        x: 0,
        y: 0
      },
      needOptimizeListLeft: [], // 移动, 拖拽, 缩放等操作时, 需要优化的坐标
      needOptimizeListTop: [],
      windowOperation: WINDOW_OPERATION
    }
  },
  created () {
    // this._initWindowsListData()
  },
  computed: {
    ...mapGetters([
      'currDevice',
      'currSelectGroupObj',
      'deviceList',
      'logicalRow',
      'logicalColumn',
      'resObj',
      'isChangeGroupList',
      'currSelectGroupId',
      'currGroupDeviceList',
      'currSelectWindowId',
      'windowSizeInfo'
    ]),
    row: function () {
      return this.currSelectGroupObj ? this.currSelectGroupObj.screenRow : 0
    },
    col: function () {
      return this.currSelectGroupObj ? this.currSelectGroupObj.screenColumn : 0
    },
    minRow: function () {
      return this.logicalRow
    },
    minCol: function () {
      return this.logicalColumn
    },
    width: function () {
      return this.resObj.width
    },
    height: function () {
      return this.resObj.height
    },
    everyPxByVal: {
      get () {
        return this.$store.getters.everyPxByVal
      },
      set (val) {
        return this.$store.dispatch('setEveryPxByVal', val)
      }
    }
  },
  watch: {
    isChangeGroupList: function (newVal) {
      if (newVal) {
        this._initWindowsListData()
      }
    }
  },
  mounted () {
    this._initWindowsListData()
  },
  methods: {
    ...mapActions(['setDeviceList', 'opeartionWindowDevice', 'setCurrOpenWindow', 'setProDevice']),
    _initWindowsListData () { // 根据物理屏和逻辑屏创建对应的背景
      const { oneWidthX, oneHeightY, oneWidth, oneHeight } = this.getCurrWidthAndHeightByColAndRow()
      this.everyPxByVal = this.width / oneWidth
      const minWidth = oneWidth / this.minCol
      const minHeight = oneHeight / this.minRow
      this.scale = 1
      this.initNeedOptimzeList(minWidth, minHeight)
      this.windowList = []
      this.styleObj = {
        width: `${this.col * oneWidth}px`,
        height: `${this.row * oneHeight}`,
        marginTop: `${(Number(getComputedStyle(this.$refs['windows-container']).height.replace('px', '')) - oneHeight * this.row) / 2}px`
      }
      for (let i = 0; i < this.row; i++) {
        for (let j = 0; j < this.col; j++) {
          const currIndex = i * this.col + j // 计算当前索引
          this.windowList[currIndex] = {
            id: this.currSelectGroupObj.screenList[currIndex],
            name: currIndex,
            x: j * oneWidthX,
            y: i * oneHeightY,
            width: `${oneWidth}px`,
            height: `${oneHeight}px`,
            left: `${j * oneWidth}px`,
            top: `${i * oneHeight}px`,
            children: []
          }
          for (let mini = 0; mini < this.minRow; mini++) {
            for (let minj = 0; minj < this.minCol; minj++) {
              const minCurrIndex = mini * this.minCol + minj // 计算当前索引
              this.windowList[currIndex]['children'].push({
                id: minCurrIndex,
                name: minCurrIndex,
                x: j * oneWidthX + oneWidthX / this.minCol * minj,
                y: i * oneHeightY + oneHeightY / this.minRow * mini,
                width: `${minWidth}px`,
                height: `${minHeight}px`,
                left: `${minj * minWidth}px`,
                top: `${mini * minHeight}px`
              })
            }
          }
        }
      }
    },
    initNeedOptimzeList (minWidth, minHeight) { // 创建需要吸附的数组
      this.needOptimizeListLeft = []
      this.needOptimizeListTop = []
      for (let i = 0; i < this.row * this.minRow; i++) {
        this.needOptimizeListTop.push(minHeight * i)
      }
      for (let i = 0; i < this.col * this.minCol; i++) {
        this.needOptimizeListLeft.push(minWidth * i)
      }
    },
    getCurrWidthAndHeightByColAndRow () { // 计算每个盒子的实际宽高以及虚拟宽高
      const containerStyle = getComputedStyle(this.$refs['windows-container'])
      const width = Number(containerStyle.width.replace('px', '')) // 获取最外层盒子的宽度
      const height = Number(containerStyle.height.replace('px', ''))
      let oneWidth, oneHeight

      if (this.row >= this.col) {
        oneHeight = height / this.row
        oneWidth = oneHeight * this.width / this.height
      } else {
        oneWidth = width / this.col
        oneHeight = oneWidth * this.height / this.width
      }
      return {
        oneWidthX: this.width,
        oneHeightY: this.height,
        oneWidth: oneWidth * 0.9,
        oneHeight: oneHeight * 0.9
      }
    },
    scaleWindow (e) { // 缩放背景
      if (this.lockTime) {
        return
      }
      this.scale += -e.deltaY / 1000
      this.scale = e.deltaY > 0 ? Math.max(this.scale, 0.3) : Math.min(this.scale, 3)
      this.setWindowScaleAndTranlate()
    },
    setMoveState (state, e) { // 设置开始移动坐标
      this.isMoveBack = state
      if (e) {
        this.startInfo = {
          x: e.x,
          y: e.y
        }
      } else {
        this.startInfo = {
          x: 0,
          y: 0
        }
      }
    },
    moveBack (e) { // 移动背景, 根据初始x和y鼠标移动后的x和y计算出偏移量, 设置背景的left和top
      if (!this.isMoveBack || this.currDevice) {
        return false
      } else {
        const { x, y } = this.translate
        this.translate = {
          x: x + e.x - this.startInfo.x,
          y: y + e.y - this.startInfo.y
        }
        this.setWindowScaleAndTranlate()
        this.startInfo = {
          x: e.x,
          y: e.y
        }
      }
    },
    setWindowScaleAndTranlate () { // 设置背景的transform属性
      this.$set(this.styleObj, 'transform', `translate(${this.translate.x}px, ${this.translate.y}px) scale(${this.scale})`)
    },
    beginCreateWindow (e, windowListObj, childrenObj) { // 创建窗口,通过改变deviceList中的数据从而来生成窗口, 每次生成窗口时deviceList中push一个新的窗口对象
      if (!this.currDevice || !windowListObj || !childrenObj) {
        return false
      }
      const deviceList = this.deviceList
      const currIndex = deviceList.length
      const { id, zIndex } = this.getMinWindowIdAndZIndex()
      const { left, top } = this.coordToPx(windowListObj, childrenObj)
      this.isCreateWindow = true

      document.onmousemove = (event) => {
        const obj = {
          id,
          zIndex,
          width: `${Math.abs(event.x - e.x) / this.scale}px`,
          height: `${Math.abs(event.y - e.y) / this.scale}px`,
          left: `${left + e.offsetX + (event.x - e.x > 0 ? 0 : event.x - e.x) / this.scale}px`,
          top: `${top + e.offsetY + (event.y - e.y > 0 ? 0 : event.y - e.y) / this.scale}px`,
          title: this.currDevice.label,
          groupIdx: this.currSelectGroupId,
          signalEnable: this.currDevice.id,
          videoSrcCh: this.currDevice.id,
          audioSrcCh: this.currDevice.id
        }
        this.setDeviceList({
          type: 'update',
          index: currIndex,
          value: obj
        })
        this.changeDeviceListRealData(currIndex)
      }

      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
        const newDevice = deviceList[currIndex]
        if (!newDevice) {
          return false
        }
        if ((newDevice.width.replace('px', '') < 5 || newDevice.height.replace('px', '') < 5)) {
          // this.deviceList.splice(deviceList.length - 1, 1)
          this.setDeviceList({
            type: 'delete',
            id: newDevice.id
          })
        } else {
          const senData = {
            guihead: 'createWindow',
            groupIdx: this.currSelectGroupId,
            windowInfo: {
              windowIdx: newDevice.id,
              layerIdx: newDevice.zIndex,
              titleName: newDevice.title,
              topLeft_X: newDevice.realX,
              topLeft_Y: newDevice.realY,
              width: newDevice.realWidth,
              height: newDevice.realHeight,
              signalEnable: this.currDevice.id,
              videoSrcCh: this.currDevice.id,
              audioSrcCh: this.currDevice.id
            }
          }
          this.$request(senData).then(res => {
            if (res.result === this.$ERR_CODE) {
              this.$myMessage('创建窗口失败', 'error')
              this.setDeviceList({
                type: 'delete',
                id: newDevice.id
              })
            } else {
              this.$myMessage('创建窗口成功')
            }
          })
        }
      }
    },
    coordToPx (windowListObj, childrenObj) { // 将px数据转换位普通的Number类型数据
      return {
        left: (Number(windowListObj.width.replace('px', '')) / this.width * childrenObj.x) || 0,
        top: (Number(windowListObj.height.replace('px', '')) / this.height * childrenObj.y) || 0
      }
    },
    getMinWindowIdAndZIndex () { // 获取最小的窗口id和最大的z-index
      return {
        id: getMinNumber(this.deviceList, 'id', 1),
        zIndex: getMinNumber(this.currGroupDeviceList, 'zIndex', 1)
      }
    },
    getDeviceIndexById (id) {
      return this.deviceList.findIndex(item => item.id === id)
    },
    setTop (list) { // 置顶窗口
      const oldZindex = list.zIndex
      const maxZindex = this.sortByKey(this.currGroupDeviceList, 'zIndex')[0].zIndex + 1
      if (oldZindex === maxZindex - 1) {
        return false
      }
      const index = this.getDeviceIndexById(list.id)
      const sendData = {
        guihead: 'spaceMoveWindow',
        groupIdx: this.currSelectGroupId,
        windowIdx: list.id,
        layerIdx: maxZindex - 1
      }
      this.$request(sendData).then(res => {
        if (res.result === this.$ERR_CODE) {
          this.$myMessage('设置层级失败', 'error')
        } else {
          this.setDeviceList({
            type: 'update',
            index,
            value: maxZindex,
            changeKey: 'zIndex'
          })
          this.deviceList.forEach((item, i) => {
            if (item.zIndex > oldZindex) {
              this.setDeviceList({
                type: 'update',
                index: i,
                value: item.zIndex - 1,
                changeKey: 'zIndex'
              })
            }
          })
        }
      })
    },
    moveWindow (list, coord) { // 移动窗口
      // if (!this.currDevice) {
      //   return false
      // }
      this.moveWindowByInfo({
        index: this.getDeviceIndexById(list.id),
        left: this.pxToNumber(list.left) + coord.x / this.scale,
        top: this.pxToNumber(list.top) + coord.y / this.scale,
        oldOptions: coord.oldOptions
      })
    },
    moveWindowByInfo (info) {
      this.setDeviceListVal(info.index, 'left', `${info.left}px`)
      this.setDeviceListVal(info.index, 'top', `${info.top}px`)
      this.setDeviceListVal(info.index, 'oldOptions', info.oldOptions)
      this.setDeviceListVal(info.index, 'isAdaption', false)
      this.changeDeviceListRealData(info.index)
      return Promise.resolve()
    },
    moveEnd (list, coord) { // 移动结束后松开鼠标后计算是否窗口需要偏移
      // if (!this.currDevice) {
      //   return false
      // }
      let moveLeftPx = this.pxToNumber(list.left) + coord.x
      const moveLeftMin = this.needOptimizeListLeft.filter(item => item <= this.pxToNumber(list.left)).pop() // 获取距离当前窗口最近的back的left
      const moveLeftMax = this.needOptimizeListLeft.filter(item => item >= this.pxToNumber(list.left))[0] // 获取距离当前窗口最近的back的right
      const moveRightMax = this.needOptimizeListLeft.filter(item => item >= this.pxToNumber(list.left) + this.pxToNumber(list.width))[0] // 获取当前窗口距离右边的边距
      if (Math.abs(moveRightMax - moveLeftPx - this.pxToNumber(list.width)) < 10) { // 若
        moveLeftPx = moveRightMax - this.pxToNumber(list.width)
      }
      if (Math.abs(moveLeftMin - this.pxToNumber(list.left) + coord.x) < 10) {
        moveLeftPx = moveLeftMin
      }
      if (Math.abs(moveLeftMax - this.pxToNumber(list.left) + coord.x) < 10) {
        moveLeftPx = moveLeftMax
      }
      let moveTopPx = this.pxToNumber(list.top) + coord.y
      const moveTopMin = this.needOptimizeListTop.filter(item => item <= this.pxToNumber(list.top)).pop()
      const moveTopMax = this.needOptimizeListTop.filter(item => item >= this.pxToNumber(list.top))[0]
      if (Math.abs(moveTopMin - moveTopPx) < 10) {
        moveTopPx = moveTopMin
      }
      if (Math.abs(moveTopMax - moveTopPx) < 10) {
        moveTopPx = moveTopMax
      }
      this.moveWindowByInfo({
        index: this.getDeviceIndexById(list.id),
        left: moveLeftPx,
        top: moveTopPx,
        oldOptions: coord.oldOptions
      }).then(() => {
        const sendData = {
          guihead: 'planeMoveWindow',
          groupIdx: this.currSelectGroupId,
          windowIdx: list.id,
          layerIdx: list.zIndex,
          topLeft_X: list.realX,
          topLeft_Y: list.realY
        }
        if (!this.getWindowIsChangeByKey(list, ['realX', 'realY'])) {
          return false
        }
        this.$request(sendData).then(res => {
          if (res.result === this.$ERR_CODE) {
            this.reserveWindow(list)
          }
        })
      })
    },
    // 根据传入的key值判断list数据是否改变, 若改变则返回true, 没改变则返回false
    getWindowIsChangeByKey (list, keyArr) {
      let result = false
      for (let i = 0; i < keyArr.length; i++) {
        const element = keyArr[i]
        if (!Object.hasOwnProperty.call(list, element) || !Object.hasOwnProperty.call(list.oldOptions, element)) {
          continue
        } else {
          if (list[element] !== list.oldOptions[element]) {
            result = true
            break
          }
        }
      }
      return result
    },
    resizeWindow (list, coord) { // 自由缩放窗口
      const minWidth = 15
      const minHeight = 15

      this.setDeviceListVal(this.getDeviceIndexById(list.id), 'width', `${Math.max(this.pxToNumber(list.width) + coord.x, minWidth)}px`)
      this.setDeviceListVal(this.getDeviceIndexById(list.id), 'height', `${Math.max(this.pxToNumber(list.height) + coord.y, minHeight)}px`)
      this.setDeviceListVal(this.getDeviceIndexById(list.id), 'isAdaption', false)
      if (coord.isChangeLeft) {
        this.setDeviceListVal(this.getDeviceIndexById(list.id), 'left', `${Math.min(this.pxToNumber(list.left) - coord.x, this.pxToNumber(coord.oldLeft) + this.pxToNumber(coord.oldWidth))}px`)
      }
      if (coord.isChangeTop) {
        this.setDeviceListVal(this.getDeviceIndexById(list.id), 'top', `${Math.min(this.pxToNumber(list.top) - coord.y, this.pxToNumber(coord.oldTop) + this.pxToNumber(coord.oldHeight))}px`)
      }
      this.changeDeviceListRealData(this.getDeviceIndexById(list.id))
      this.setDeviceListVal(this.getDeviceIndexById(list.id), 'oldOptions', coord.oldOptions)
    },
    resizeEnd (list) {
      const sendData = {
        guihead: 'resizeWindow',
        groupIdx: list.groupIdx,
        windowIdx: list.id,
        layerIdx: list.zIndex - 1,
        width: list.realWidth,
        height: list.realHeight,
        topLeft_X: list.realX,
        topLeft_Y: list.realY
      }
      if (!this.getWindowIsChangeByKey(list, ['realWidth', 'realHeight', 'realX', 'realY'])) {
        return false
      }
      this.$request(sendData).then(res => {
        if (res.result === this.$ERR_CODE) {
          this.reserveWindow(list)
        }
      })
    },
    reserveWindow (list, isSend) { // 回到上一次的状态
      if (!list.oldOptions) {
        return false
      }
      const index = this.getDeviceIndexById(list.id)
      const currOptions = JSON.parse(JSON.stringify(list.oldOptions))
      const oldOptions = JSON.parse(JSON.stringify(list))
      delete oldOptions.oldOptions
      this.$set(this.deviceList, this.getDeviceIndexById(list.id), currOptions)
      this.setDeviceList({
        type: 'update',
        index,
        value: currOptions
      })
      this.setDeviceListVal(this.getDeviceIndexById(list.id), 'oldOptions', oldOptions)
      if (isSend) {
        this.resizeEnd(this.deviceList[index])
      }
    },
    adaptionWindow (list) { // 自适应窗口
      const currWindow = list
      const index = this.getDeviceIndexById(list.id)
      if (currWindow.isAdaption || this.isMaxWindow) {
        return false
      }
      const oldOptions = JSON.parse(JSON.stringify(currWindow))
      delete oldOptions.oldOptions

      const { maxWidth, maxHeight, oneRealMinWindowWidth, oneRealMinWindowHeight } = this.windowSizeInfo

      const xy0 = {
        x: getWindowXy(currWindow.realX, oneRealMinWindowWidth, maxWidth),
        y: getWindowXy(currWindow.realY, oneRealMinWindowHeight, maxHeight)
      }
      const xy1 = {
        x: getWindowXy(currWindow.realX + currWindow.realWidth, oneRealMinWindowWidth, maxWidth, true),
        y: xy0.y
      }
      const xy2 = {
        x: xy0.x,
        y: getWindowXy(currWindow.realY + currWindow.realHeight, oneRealMinWindowHeight, maxHeight, true)
      }

      const realWidth = xy1.x - xy0.x
      const realHeight = xy2.y - xy0.y
      const realX = xy0.x
      const realY = xy0.y
      const newWindowOptions = {
        id: currWindow.id,
        groupIdx: this.currSelectGroupId,
        zIndex: currWindow.zIndex,
        width: `${realWidth / this.everyPxByVal}px`,
        height: `${realHeight / this.everyPxByVal}px`,
        left: `${realX / this.everyPxByVal}px`,
        top: `${realY / this.everyPxByVal}px`,
        title: currWindow.title,
        isAdaption: true,
        oldOptions,
        realX,
        realY,
        realWidth,
        realHeight,
        audioSrcCh: currWindow.audioSrcCh,
        videoSrcCh: currWindow.videoSrcCh,
        signalEnable: currWindow.signalEnable
      }
      this.setDeviceList({
        type: 'update',
        index,
        value: newWindowOptions
      })
      console.log()
      this.resizeEnd(this.deviceList[index])
    },
    maxWindow (list, e) { // 最大化窗口
      const currWindow = list
      const index = this.getDeviceIndexById(list.id)

      if (e.isMaxWindow) {
        return false
      }
      const oldOptions = JSON.parse(JSON.stringify(currWindow))
      delete oldOptions.oldOptions
      const { maxWidth, maxHeight } = this.windowSizeInfo
      console.log(list)
      const currOptions = {
        id: currWindow.id,
        groupIdx: this.currSelectGroupId,
        zIndex: currWindow.zIndex,
        width: `${maxWidth / this.everyPxByVal}px`,
        height: `${maxHeight / this.everyPxByVal}px`,
        left: '0px',
        top: '0px',
        title: currWindow.title,
        oldOptions,
        isMaxWindow: true,
        realX: 0,
        realY: 0,
        realWidth: maxWidth,
        realHeight: maxHeight,
        audioSrcCh: currWindow.audioSrcCh,
        videoSrcCh: currWindow.videoSrcCh,
        signalEnable: currWindow.signalEnable
      }
      this.setDeviceList({
        type: 'update',
        index,
        value: currOptions
      })
      this.resizeEnd(this.deviceList[index])
    },
    setDeviceListVal (index, changeKey, value) {
      this.setDeviceList({
        type: 'update',
        index,
        value,
        changeKey
      })
    },
    changeDeviceListRealData (index) { // 计算真实数据
      const getReal = (data) => {
        return data * this.everyPxByVal
      }
      const currDevice = this.deviceList[index]
      this.setDeviceList({
        type: 'update',
        index,
        value: parseInt(getReal(this.pxToNumber(currDevice.left))),
        changeKey: 'realX'
      })
      this.setDeviceList({
        type: 'update',
        index,
        value: parseInt(getReal(this.pxToNumber(currDevice.top))),
        changeKey: 'realY'
      })
      this.setDeviceList({
        type: 'update',
        index,
        value: parseInt(getReal(this.pxToNumber(currDevice.width))),
        changeKey: 'realWidth'
      })
      this.setDeviceList({
        type: 'update',
        index,
        value: parseInt(getReal(this.pxToNumber(currDevice.height))),
        changeKey: 'realHeight'
      })
    },
    closeWindow (id) { // 删除窗口
      const sendData = {
        guihead: 'deleteWindow',
        groupIdx: this.currSelectGroupId,
        windowList: [id]
      }
      this.$request(sendData).then(res => {
        if (res.result === this.$ERR_CODE) {
          this.$myMessage('删除窗口失败', 'error')
        } else {
          this.$myMessage('删除窗口成功')
          this.setDeviceList({
            type: 'delete',
            id
          })
        }
      })
    },
    pxToNumber (px) {
      return Number(px.replace('px', ''))
    },
    sortByKey (arr, key) {
      const newArr = JSON.parse(JSON.stringify(arr))
      return newArr.sort((a, b) => {
        return b[key] - a[key]
      })
    },
    operationWindow (list, type) {
      this.opeartionWindowDevice({
        type,
        list
      })
    },
    setWindowPro (list) {
      this.setCurrOpenWindow(1)
      this.setProDevice(list)
    }
  }
}
</script>

<style lang="scss">

</style>
