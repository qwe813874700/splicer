<template>
  <div class="device-window" :style="options" @mousedown.left.stop="setTop" @contextmenu="popContextmenu">
    <div class="window-header" @mousedown.left="startMove($event)" @dblclick.stop="doubleClickWindow">
      <div class="window-title">{{ title }}</div>
      <div class="control-box">
        <div class="window-control" @click.stop.left="sendCommand(windowOperation.adaptionWindow)">适</div>
        <div class="window-control" @click.stop.left="sendCommand(windowOperation.maxWindow)">全</div>
        <div class="window-control" @click.stop.left="sendCommand(windowOperation.reserveWindow)">原</div>
        <div class="window-control" @click.stop.left="sendCommand(windowOperation.closeWindow)">关</div>
      </div>
    </div>
    <div class="window-body">
      <br>
      <div>窗口标识: {{ options.id }}</div>
      <div>叠放序号: {{ options.zIndex }}</div>
      <br>
      <div>窗口位置: ({{ options.realX }}, {{ options.realY }})</div>
      <div>大小: ({{ options.realWidth }} × {{ options.realHeight }})</div>
      <div>该组分辨率: (1920 × 1080)</div>
    </div>
    <div class="window-resize-top" @mousedown.stop.left="resize($event, 'top')"></div>
    <div class="window-resize-top-right" @mousedown.stop.left="resize($event, 'topRight')"></div>
    <div class="window-resize-right" @mousedown.stop.left="resize($event, 'right')"></div>
    <div class="window-resize-right-bottom" @mousedown.stop.left="resize($event, 'rightBottom')"></div>
    <div class="window-resize-bottom" @mousedown.stop.left="resize($event, 'bottom')"></div>
    <div class="window-resize-bottom-left" @mousedown.stop.left="resize($event, 'bottomLeft')"></div>
    <div class="window-resize-left" @mousedown.stop.left="resize($event, 'left')"></div>
    <div class="window-resize-left-top" @mousedown.stop.left="resize($event, 'leftTop')"></div>
    <slot></slot>
  </div>
</template>

<script>
import { remote } from 'electron'
import { WINDOW_OPERATION } from '@/util/global'
const { Menu, MenuItem } = remote

// emits: ['adaptionWindow', 'maxWindow', 'reserveWindow', 'closeWindow', 'setTop', 'setWindowPro', 'resizeWindow', 'movewindow']
export default {
  props: {
    options: {
      type: Object,
      default: () => ({})
    }
  },
  created () {
    this.initMenu()
  },
  computed: {
    currGroupInfo () {
      return this.$store.getters.groupList.filter(item => item.groupIdx === this.options.groupIdx)[0]
    },
    isMaxWindow: function () {
      return this.options.realWidth >= this.currGroupInfo.screenColumn * this.currGroupInfo.screenSetting.hActive && this.options.realHeight >= this.currGroupInfo.screenRow * this.currGroupInfo.screenSetting.vActive
    },
    title () {
      return this.$store.getters.treeChildList.filter(item => item.id === this.options.videoSrcCh)[0].label
    }
  },
  data () {
    return {
      isMove: false,
      isResize: false,
      resizeList: {
        x: ['topRight', 'right', 'rightBottom', 'bottomLeft', 'leftTop', 'left'], // 记录可以改变x轴的方向
        y: ['top', 'topRight', 'rightBottom', 'bottom', 'bottomLeft', 'leftTop'], // 记录可以改变y轴的方向
        isChangeLeft: ['left', 'leftTop', 'bottomLeft'], // 记录是否改变left
        isChangeTop: ['leftTop', 'top', 'topRight'] // 记录是否改变y
      },
      menu: null,
      windowOperation: WINDOW_OPERATION
    }
  },
  methods: {
    setTop () {
      this.$emit('setTop')
    },
    startMove (e) {
      this.isMove = true
      // this.setTop()
      let startInfo = {
        x: e.x,
        y: e.y
      }
      const oldOptions = JSON.parse(JSON.stringify(this.options))
      let moveObj = {}
      let move = false
      document.onmousemove = (event) => {
        move = true
        moveObj = {
          x: event.x - startInfo.x,
          y: event.y - startInfo.y,
          oldOptions: oldOptions
        }
        this.$emit(WINDOW_OPERATION.moveWindow, moveObj)
        startInfo = {
          x: event.x,
          y: event.y
        }
      }
      document.onmouseup = () => {
        this.isMove = false
        document.onmouseup = null
        document.onmousemove = null
        if (move) {
          this.$emit(WINDOW_OPERATION.moveEnd, moveObj)
        }
      }
    },
    /**
     * @param e 鼠标事件对象
     * @param type 当前缩放当前窗口移动的方向
     */
    resize (e, type) { // 缩放窗口 计算坐标 导出resizeWindow事件
      // this.setTop()
      this.isResize = true
      let startInfo = { // 记录起始位置
        x: e.x,
        y: e.y
      }
      const oldLeft = this.options.left
      const oldTop = this.options.top
      const oldWidth = this.options.width
      const oldHeight = this.options.height
      const oldOptions = JSON.parse(JSON.stringify(this.options)) // 记录原来状态
      const isChangeX = this.resizeList.x.indexOf(type) > -1
      const isChangeY = this.resizeList.y.indexOf(type) > -1
      const isChangeLeft = this.resizeList.isChangeLeft.indexOf(type) > -1
      const isChangeTop = this.resizeList.isChangeTop.indexOf(type) > -1

      let isResize = false
      let resizeObj = {}
      document.onmousemove = (event) => {
        isResize = true
        let x = 0
        if (isChangeX) { // 判断 是否需要改变x轴坐标
          if (isChangeLeft) { // 判断当前是否需要改变left
            x = -(event.x - startInfo.x)
          } else {
            x = event.x - startInfo.x
          }
        }
        let y = 0
        if (isChangeY) { // 判断 是否需要改变y轴坐标
          if (isChangeTop) { // 判断 是否需要改变Top
            y = -(event.y - startInfo.y)
          } else {
            y = (event.y - startInfo.y)
          }
        }
        resizeObj = {
          x,
          y,
          isChangeLeft,
          isChangeTop,
          oldLeft,
          oldTop,
          oldWidth,
          oldHeight,
          oldOptions
        }
        this.$emit(WINDOW_OPERATION.resizeWindow, resizeObj)
        startInfo = {
          x: event.x,
          y: event.y
        }
      }
      document.onmouseup = () => {
        this.isResize = false
        document.onmouseup = null
        document.onmousemove = null
        if (isResize) {
          this.$emit(WINDOW_OPERATION.resizeEnd, resizeObj)
        }
      }
    },
    doubleClickWindow () {
      this.sendCommand(this.isMaxWindow ? WINDOW_OPERATION.reserveWindow : WINDOW_OPERATION.maxWindow)
    },
    sendCommand (cmd) {
      this.$emit(cmd, this)
    },
    initMenu () {
      this.menu = new Menu()
      const menuItem = [
        {
          label: '置顶',
          click: () => {
            this.sendCommand(WINDOW_OPERATION.setTop)
          }
        },
        {
          label: '置底',
          click: () => {
            this.sendCommand(WINDOW_OPERATION.setBottom)
          }
        },
        {
          label: '上移',
          click: () => {
            this.sendCommand(WINDOW_OPERATION.addOneTop)
          }
        },
        {
          label: '下移',
          click: () => {
            this.sendCommand(WINDOW_OPERATION.subOneBottom)
          }
        },
        {
          label: '缩放到单个屏',
          click: () => {
            this.sendCommand(WINDOW_OPERATION.resizeInputWindow)
          }
        },
        {
          label: '缩放到所占屏',
          click: () => {
            this.sendCommand(WINDOW_OPERATION.adaptionWindow)
          }
        },
        {
          label: '全屏',
          click: () => {
            this.sendCommand(WINDOW_OPERATION.maxWindow)
          }
        },
        {
          label: '全屏到输出所占屏',
          click: () => {
            this.sendCommand(WINDOW_OPERATION.maxCurrInputwindow)
          }
        },
        {
          label: '所有窗口缩放到单个屏',
          click: () => {
            this.sendCommand(WINDOW_OPERATION.resizeAllInputWindow)
          }
        },
        {
          label: '关闭',
          click: () => {
            this.sendCommand(WINDOW_OPERATION.closeWindow)
          }
        },
        {
          label: '属性',
          click: () => {
            this.sendCommand(WINDOW_OPERATION.setWindowPro)
          }
        },
        {
          label: '关闭信号',
          click: () => {
            this.sendCommand(WINDOW_OPERATION.closeSignal)
          }
        },
        {
          label: '关闭所有信号',
          click: () => {
            this.sendCommand(WINDOW_OPERATION.closeAllSignal)
          }
        }
      ]
      menuItem.forEach(item => {
        this.menu.append(new MenuItem(item))
      })
    },
    popContextmenu () {
      this.menu.popup(remote.getCurrentWindow())
    }
  }
}
</script>

<style lang="scss">
$header_height: 25px;
$border-size: 5px;
.device-window {
  position: absolute;
  border: 1px solid #000;
  overflow: hidden;
  &.active {
    .window-header {
      background: rgb(0, 0, 255)
    }
  }
  .window-header {
    position: absolute;
    height: $header_height;
    background: forestgreen;
    left: 0;
    right: 0;
    top: 0;
    cursor: move;
    font-size: 14px;
    display: flex;
    align-items: center;
    .window-title {
      position: absolute;
      left: 5px;
      width: 120px;
      overflow: hidden;
    }
    .control-box {
      display: flex;
      align-items: center;
      position: absolute;
      right: 0;
      .window-control {
        width: 14px;
        height: 14px;
        font-size: 12px;
        line-height: 14px;
        text-align: center;
        background: rgb(225, 226, 227);
        padding: 1px;
        border-radius: 2px;
        margin: 0 5px;
        cursor: pointer;
      }
    }
  }
  .window-body {
    position: absolute;
    top: $header_height;
    bottom: 0;
    left: 0;
    right: 0;
    background: fuchsia;
  }
  [class^="window-resize"] {
    position: absolute;
  }
  & > [class*="left"] {
    left: 0
  }
  & > [class*="top"] {
    top: 0
  }
  & > [class*="bottom"] {
    bottom: 0
  }
  & > [class*="right"] {
    right: 0
  }
  .window-resize-top, .window-resize-bottom  {
    width: 100%;
    height: $border-size;
    cursor: n-resize;
  }
  .window-resize-left, .window-resize-right  {
    width: $border-size;
    height: 100%;
    cursor: w-resize;
  }
  .window-resize-top-right, .window-resize-right-bottom, .window-resize-bottom-left, .window-resize-left-top {
      width: 8px;
      height: 8px;
      z-index: 2;
  }
  .window-resize-top-right, .window-resize-bottom-left {
    cursor: ne-resize;
  }
  .window-resize-right-bottom, .window-resize-left-top {
    cursor: nw-resize;
  } 
}
</style>
