<template>
  <div class="pop-motal">
    <div class="pop-window" :style="styleObj" ref="pop-window">
      <div class="pop-header" @mousedown.left="startMove">
        <div class="pop-title">
          {{ title }}
        </div>
        <i class="pop-close el-icon-close" @click="closeWindow" v-if="!cancelClose"></i>
      </div>
      <div class="pop-container">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { popMixin } from '@/api/mixins/popwindow-mixin'

export default {
  name: 'pop-window',
  mixins: [popMixin],
  props: {
    title: {
      type: String,
      default: ''
    },
    cancelClose: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      styleObj: null
    }
  },
  created () {
    ipcRenderer.send('setMinWindow', true)
  },
  mounted () {
    const popInfo = this.$refs['pop-window']
    this.styleObj = {
      left: `${popInfo.offsetLeft}px`,
      top: `${popInfo.offsetTop}px`
    }
  },
  methods: {
    startMove (e) {
      const popInfo = this.$refs['pop-window']
      const start = {
        x: e.x,
        y: e.y
      }
      const old = {
        x: popInfo.offsetLeft,
        y: popInfo.offsetTop
      }
      document.onmousemove = (event) => {
        this.styleObj = {
          left: `${Math.max(popInfo.offsetWidth / 2, old.x + event.x - start.x)}px`,
          top: `${Math.max(popInfo.offsetHeight / 2, old.y + event.y - start.y)}px`
        }
      }
      document.onmouseup = (event) => {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  },
  destroyed () {
    ipcRenderer.send('setMinWindow', false)
  }
}
</script>

<style lang="scss">
.pop-motal {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}
$header_height: 25px;
.pop-window {
  font-size: 12px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 200px;
  .pop-header {
    height: $header_height;
    background: rgb(0, 120, 215);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    padding: 0 5px;
    border: 1px solid rgb(0, 120, 215);
    cursor: move;
  }
  .pop-close {
    cursor: pointer;
  }
  .pop-container {
    background: rgb(240, 240, 240);
    border: 1px solid #7d6c6c;
    border-top: none;
    padding: 10px;
    box-shadow: #7d6c6c 0 0 10px;
  }
}
</style>
