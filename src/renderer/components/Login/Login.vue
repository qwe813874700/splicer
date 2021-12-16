<template>
  <div class="login">
    <div class="header">
      <div class="header-left">
        登录
      </div>
      <div class="header-right">
        <span class="icon-box" @click="sendOperate('shrinkLoginWindow')">
          <i class="el-icon-minus icon"></i>
        </span>
        <span class="icon-box" @click="sendOperate('closeLoginWindow')">
          <i class="el-icon-close icon"></i>
        </span>
      </div>
    </div>
    <div class="login-body">
      <el-card>
        <el-form :model="loginInfo">
          <el-form-item>
            <el-input
              placeholder="Please enter a user name"
              v-model="loginInfo.username">
              <i slot="prefix" class="el-icon-user-solid"></i>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input
              placeholder="Please enter a password"
              v-model="loginInfo.password">
              <i slot="prefix" class="el-icon-lock"></i>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="w_100" @click="checkLogin">Login In</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { resizeMixin } from '@/api/mixins/resize-mixin.js'

export default {
  mixins: [resizeMixin],
  data () {
    return {
      loginInfo: {
        username: 'admin',
        password: ''
      }
    }
  },
  methods: {
    sendOperate (type) {
      ipcRenderer.send(type)
    },
    checkLogin () {
      this.sendOperate('openMainWindow')
      this.sendOperate('closeLoginWindow')
    }
  }
}
</script>

<style lang="scss">
body {
  background: rgb(245, 245, 245);
  background-image: url('../../assets/img/back.jpg');
}
.login {
  z-index: 1;
  width: 370px;
  height: 540px;
  .w_100 {
    width: 100%
  }
  padding-top: 10px;
  .header {
    -webkit-app-region: drag; // 可拖动
    position: relative;
    .header-left {
      text-align: center;
      color: #fff;
    }
    .header-right {
      -webkit-app-region: no-drag; 
      position: absolute;
      right: 0;
      top: 0;
      .icon-box {
        padding: 10px;
        &:hover {
          background: rgb(229, 229, 229);
        }
        .icon {
          font-size: 16px;
        }
      }
    }
  }
  .login-body {
    width: 95%;
    margin: 0 auto;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>