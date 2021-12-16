<template>
  <div class="nav-header">
    <div class="nav-top">
      <div class="nav-item" :class="{active: actvied === 'main'}" @click="changeFucntion('main')">主功能</div>
      <div class="nav-item" :class="{active: actvied === 'setting'}" @click="changeFucntion('setting')">设置</div>
      <div class="nav-item" :class="{active: actvied === 'tool'}" @click="changeFucntion('tool')">工具</div>
    </div>
    <nav-main v-if="actvied === 'main'">
    </nav-main>
    <nav-setting v-if="actvied === 'setting'">
    </nav-setting>
    <nav-tool v-if="actvied === 'tool'">
    </nav-tool>
  </div>
</template>

<script>
import NavMain from './NavMain/NavMain.vue'
import NavSetting from './NavSetting/NavSetting.vue'
import NavTool from './NavTool/NavTool.vue'

export default {
  components: {
    NavMain,
    NavSetting,
    NavTool
  },
  data () {
    return {
      actvied: 'main'
    }
  },
  methods: {
    changeFucntion (type) {
      this.actvied = type
    }
  }
}
</script>

<style lang="scss">
$back_color: linear-gradient(#dfe9f3, #b8d7ff);
$item_back_color: linear-gradient(rgb(251, 225, 161), rgb(253, 239, 207));
.nav-header {
  height: 100%;
  display: flex;
  flex-direction: column;
  .nav-top {
    display: flex;
    background: $back_color;
    padding-left: 30px;
    .nav-item {
      height: 25px;
      font-size: 12px;
      padding: 0 15px;
      line-height: 25px;
      border-radius: 3px;
      &.active {
        background: linear-gradient(rgb(246, 250, 255), rgb(220, 231, 246));
        border: 1px solid rgb(141, 178, 227);
        border-bottom: none;
        box-shadow: 0 0 3px 1px rgba(141, 178, 227, .5);
        height: 24px;
        line-height: 24px;
      }
      &:hover {
        background: $item_back_color;
      }
    }
  }
  .nav-container {
    flex: 1;
    display: flex;
    background: linear-gradient(rgb(220, 231, 246), rgb(205, 220, 238), rgb(226, 243, 254));
    padding: 3px;
    .nav-group {
      border: 1px solid rgb(166, 190, 211);
      margin-right: 3px;
      border-radius: 3px;
      display: flex;
      flex-direction: column;
      font-size: 12px;
      color: rgb(62, 106, 194);
      &:hover {
        background: linear-gradient(rgb(229, 240, 255), rgb(221, 233, 249));
        .group-footer {
          background: rgb(200, 224, 255);
        }
      }
      .group-body {
        flex: 1;
        display: flex;
        .group-item {
          &[disabled] {
            color:#ACA899;
            border-color: #a0cfff;
            &:hover {
              background: none;
              cursor: not-allowed;
            }
          }
          width: 60px;
          &:hover {
            background: $item_back_color;
          }
          .group-icon {
            img {
              margin: 5px 15px;
            }
          }
          .group-explain {
            text-align: center;
          }
        }
      }
      
      .group-footer {
        height: 15px;
        line-height: 15px;
        text-align: center;
        background: rgb(193, 216, 240);
      }
    }
  }
}
</style>