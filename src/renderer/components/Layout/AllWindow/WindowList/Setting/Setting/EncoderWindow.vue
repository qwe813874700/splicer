<template>
  <div class="encoder-window">
    <div class="flex-box">
      <div class="flex-label">解码卡</div>
      <el-select size="mini" :value="selectCard"></el-select>
    </div>
    <div class="window-container">
      <div class="container-title">
        IP设置
      </div>
      <div class="container">
        <div class="flex-box between">
          <span class="flex-label">IP地址</span>
          <div class="flex-container">
            <ip-input v-model="ip"></ip-input>
          </div>
        </div>
        <div class="flex-box between mg-t">
          <span class="flex-label">子网掩码</span>
          <div class="flex-container">
            <ip-input v-model="ip"></ip-input>
          </div>
        </div>
        <div class="flex-box between mg-t">
          <span class="flex-label">网关</span>
          <div class="flex-container">
            <ip-input v-model="ip"></ip-input>
          </div>
        </div>
        <div class="container-footer mg-t">
          <el-button type="primary" size="mini">应用IP设置</el-button>
        </div>
      </div>
    </div>
    <div class="window-container">
      <div class="container-title">
        OSD设置
      </div>
      <div class="container">
        <div class="flex-box between">
          <div class="flex-box">
            <div class="flex-label">通道:</div>
            <el-select size="mini" class="item-width" :value="selectCard"></el-select>
          </div>
          <div class="flex-box">
            <div class="flex-label">子通道:</div>
            <el-select size="mini" class="item-width" :value="selectCard"></el-select>
          </div>
        </div>
        <div class="flex-box between mg-t">
          <div class="flex-box">
            <div class="flex-label">文字大小</div>
            <el-select size="mini" class="item-width" :value="selectCard"></el-select>
          </div>
          <div class="flex-box">
            <div class="flex-label">颜色</div>
            <el-color-picker v-model="color" class="item-width"></el-color-picker>
          </div>
        </div>
        <div class="flex-box mg-t">
          <div class="flex-box">
            <div class="flex-label">开关</div>
            <el-select size="mini" class="item-width" :value="selectCard"></el-select>
          </div>
        </div>
        <div class="flex-box mg-t between">
          <div class="flex-label">文字位置</div>
          <div class="flex-box">
            <div class="flex-box mg-r">
              <div class="flex-label mini">x:</div>
              <el-input size="mini" class="item-width" v-model="selectCard"></el-input>
            </div>
            <div class="flex-box">
              <div class="flex-label mini">y:</div>
              <el-input size="mini" class="item-width" v-model="selectCard"></el-input>
            </div>
          </div>
        </div>
        <div class="flex-box mg-t">
          <div class="flex-label">显示文字</div>
          <el-input size="mini" class="flex-1" v-model="selectCard"></el-input>
        </div>
        <div class="container-footer">
          <el-button type="primary" size="mini">设置OSD文字</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IpInput from '@/components/Common/IpInput/IpInput'
export default {
  components: {
    IpInput
  },
  data () {
    return {
      selectCard: 0,
      form: {
        num: 0
      },
      ip: '',
      color: '#000'
    }
  }
}
</script>

<style lang="scss">
.encoder-window {
  width: 320px;
  font-size: 12px;
  .flex-label {
    width: 50px;
    &.mini {
      width: 10px;
    }
  }
  .item-width {
    width: 80px;
  }
}
</style>
