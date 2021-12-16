<template>
  <div class="decoder-window">
    <div class="flex-box">
      <div class="flex-label">编码卡槽位</div>
      <el-select v-model="cardId" size="mini" class="mg-r flex-1"></el-select>
      <el-button size="mini" type="primary">重启编码卡</el-button>
    </div>
    <div class="window-container">
      <div class="container-title">
        设备网络设置
      </div>
      <div class="container">
        <div class="flex-box between">
          <div>
            <div class="mg-b">IP</div>
            <ip-input v-model="ip"></ip-input>
          </div>
          <div>
            <div class="mg-b">子网掩码</div>
            <ip-input v-model="ip"></ip-input>
          </div>
          <div>
            <div class="mg-b">默认网关</div>
            <ip-input v-model="ip"></ip-input>
          </div>
        </div>
        <div class="flex-box center mg-t">
          <el-button type="primary" size="mini">设置网络</el-button>
        </div>
      </div>
    </div>
    <div class="window-container">
      <div class="container-title">码流配置</div>
      <div class="container">
        <div class="flex-box between">
          <div class="flex-box">
            <div class="flex-label">码流ID</div>
            <el-select v-model="ip" size="mini"></el-select>
          </div>
          <div class="flex-box">
            <div class="flex-label">码流类型</div>
            <el-select v-model="ip" size="mini"></el-select>
          </div>
        </div>
        <div class="flex-box between mg-t">
          <div class="flex-box">
            <div class="flex-label">码流分辨率</div>
            <el-select v-model="ip" size="mini"></el-select>
          </div>
          <div class="flex-box">
            <div class="flex-label">码流控制类型</div>
            <el-select v-model="ip" size="mini"></el-select>
          </div>
        </div>
        <div class="flex-box between mg-t">
          <div class="flex-box">
            <div class="flex-label">恒定码值率</div>
            <el-select v-model="ip" size="mini"></el-select>
          </div>
          <div class="flex-box">
            <div class="flex-label">编码Profile类型</div>
            <el-select v-model="ip" size="mini"></el-select>
          </div>
        </div>
      </div>
    </div>
    <div class="container-footer">
      <el-button type="primary">确认</el-button>
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
      cardId: 0,
      ip: ''
    }
  }
}
</script>

<style lang="scss">
.decoder-window {
  font-size: 12px;
  width: 630px;
  padding: 10px;
  .flex-label {
    width: 90px;
    text-align: right;
  }
}
</style>
