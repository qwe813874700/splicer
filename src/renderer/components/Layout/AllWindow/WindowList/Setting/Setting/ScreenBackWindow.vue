<template>
  <div class="screen-back-window">
    <div class="flex-box between">
      <div class="flex-label">
        大屏背景颜色
      </div>
      <el-color-picker v-model="color" color-format="rgb"></el-color-picker>
    </div>
    <div class="container-footer">
      <el-button type="primary" size="mini" @click="setBackcolor">确认</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      color: 'rgb(0, 0, 0)'
    }
  },
  methods: {
    setBackcolor () {
      const colorArr = this.color.match(/\(([^)]*)\)/)[1].split(',')
      const sendData = {
        guihead: 'setBackColor',
        r: Number(colorArr[0]),
        g: Number(colorArr[1]),
        b: Number(colorArr[2])
      }
      this.$request(sendData).then(res => {
        if (res.result === this.$ERR_CODE) {
          this.$myMessage('该机器不支持该颜色 请重新选择!', 'error')
        } else {
          this.setCurrOpenWindow(null)
        }
      })
    }
  }
}
</script>

<style lang="scss">
.screen-back-window {
  padding: 10px;
}
</style>
