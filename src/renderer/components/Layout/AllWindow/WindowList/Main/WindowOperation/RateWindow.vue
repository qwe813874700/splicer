<template>
  <div class="rate-window">
    <el-form ref="form" :model="form" label-width="100px">
      <el-form-item label="网口号">
        <el-select v-model="form.region" size="mini" class="w_150">
          <el-option label="区域一" value="shanghai"></el-option>
          <el-option label="区域二" value="beijing"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="读取帧率">
        <el-input  size="mini" disabled class="w_150"></el-input>
        <el-button class="w_100 mg_left" size="mini" type="primary">读取帧率</el-button>
      </el-form-item>
      <el-form-item label="设置帧率">
        <el-input  size="mini" class="w_150" placeholder="最大值为100"></el-input>
        <el-button class="w_100 mg_left" size="mini" type="primary">设置帧率</el-button>
      </el-form-item>
      <el-form-item label="读取设备ID">
        <el-input  size="mini" disabled class="w_150"></el-input>
        <el-button class="w_100 mg_left" size="mini" type="primary">读取设备ID</el-button>
      </el-form-item>
      <el-form-item label="设置设备ID">
        <el-input  size="mini" class="w_150"></el-input>
        <el-button class="w_100 mg_left" size="mini" type="primary">设置设备ID</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { popMixin } from '@/api/mixins/popwindow-mixin'

export default {
  mixins: [popMixin],
  data () {
    return {
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      }
    }
  },
  methods: {
    handleChange () {}
  }
}
</script>

<style lang="scss">
.rate-window {
  width: 38 0px;
  .w_150 {
    width: 150px;
  }
  .w_100 {
    width: 100px;
  }
  .mg_left {
    margin-left: 10px;
  }
}
</style>