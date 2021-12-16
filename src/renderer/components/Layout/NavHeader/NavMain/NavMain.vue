<template>
  <div class="nav-container">
    <div class="nav-group" v-for="item in list" :key="item.label">
      <div class="group-body">
        <div class="group-item" v-for="child in item.children" :key="child.label" @click="openMethods(child.methods, child.sendData, $event)" :disabled="setResult(child.disabled)">
          <div class="group-icon">
            <img :src="child.icon" alt="" width="30">     
          </div>
          <div class="group-explain">{{ child.label }}</div>
        </div>
      </div>
      <div class="group-footer">{{ item.label }}</div>
    </div>
  </div>
</template>

<script>
import { navMixin } from '@/api/mixins/nav-mixin.js'
import { popSpliceWindowMixin } from '@/api/mixins/popwindow-mixin.js'

export default {
  mixins: [navMixin, popSpliceWindowMixin],
  data () {
    return {
      list: [
        {
          label: '窗口管理',
          children: [
            {
              label: '新建窗口',
              icon: require('@/assets/img/window.png'),
              methods: 'createPopWindow',
              sendData: 0
            },
            {
              label: '关闭窗口',
              icon: require('@/assets/img/window.png'),
              methods: 'closeTopWindow',
              sendData: 'one',
              disabled: 'showClose'
            },
            {
              label: '清空窗口',
              icon: require('@/assets/img/window.png'),
              methods: 'closeTopWindow',
              sendData: 'all',
              disabled: 'showClose'
            },
            {
              label: '锁定窗口',
              icon: require('@/assets/img/window.png'),
              methods: ''
            }
          ]
        },
        // {
        //   label: '窗口操作',
        //   children: [
        //     {
        //       label: '置顶',
        //       icon: require('@/assets/img/window.png'),
        //       methods: ''
        //     },
        //     {
        //       label: '置底',
        //       icon: require('@/assets/img/window.png'),
        //       methods: ''
        //     },
        //     {
        //       label: '属性',
        //       icon: require('@/assets/img/window.png'),
        //       methods: 'createNewWindow',
        //       sendData: 1
        //     },
        //     {
        //       label: 'Video 输入',
        //       icon: require('@/assets/img/window.png'),
        //       methods: ''
        //     },
        //     {
        //       label: '帧率',
        //       icon: require('@/assets/img/window.png'),
        //       methods: 'createNewWindow',
        //       sendData: 2
        //     }
        //   ]
        // },
        {
          label: '屏幕控制',
          children: [
            {
              label: '屏幕控制',
              icon: require('@/assets/img/window.png'),
              methods: 'createNewWindow',
              sendData: 3

            },
            {
              label: '打开屏幕',
              icon: require('@/assets/img/window.png'),
              methods: ''
            },
            {
              label: '关闭屏幕',
              icon: require('@/assets/img/window.png'),
              methods: ''
            }
          ]
        },
        {
          label: '场景',
          children: [
            {
              label: '读取',
              icon: require('@/assets/img/window.png'),
              methods: 'createNewWindow',
              sendData: 4
            },
            {
              label: '保存',
              icon: require('@/assets/img/window.png'),
              methods: 'createNewWindow',
              sendData: 5
            },
            {
              label: '管理',
              icon: require('@/assets/img/window.png'),
              methods: 'createNewWindow',
              sendData: 6
            }
          ]
        },
        {
          label: '其他',
          children: [
            {
              label: '服务',
              icon: require('@/assets/img/window.png'),
              methods: ''
            },
            {
              label: '后台',
              icon: require('@/assets/img/window.png'),
              methods: 'sendCommand',
              sendData: 'min'
            },
            {
              label: '切换用户',
              icon: require('@/assets/img/window.png'),
              methods: ''
            },
            {
              label: '退出',
              icon: require('@/assets/img/window.png'),
              methods: 'sendCommand',
              sendData: 'quit'
            }
          ]
        }
      ],
      showCreateWindow: true
    }
  },
  methods: {
    createPopWindow (popwindowId) {
      if (this.groupList.length === 0) {
        this.$myMessage('请先创建分组', 'error')
        return
      }
      if (!this.currDevice) {
        this.$myMessage('请先选择要开窗的设备', 'error')
        return
      }
      this.createNewWindow(popwindowId)
    },
    closeTopWindow  (type) {
      const oneOrAll = type === 'one'
      const sendData = {
        guihead: 'deleteWindow',
        groupIdx: this.currSelectGroupId,
        windowList: oneOrAll ? [this.currSelectWindowId] : this.deviceList.map(item => item.id)
      }
      this.$request(sendData).then(res => {
        if (res.result === this.$ERR_CODE) {
          this.$myMessage('删除窗口失败', 'error')
        } else {
          this.$myMessage(`${oneOrAll ? '删除窗口成功' : '清空窗口成功'}`)
          this.setDeviceList({
            type: oneOrAll ? 'delete' : 'set',
            value: [],
            id: this.currSelectWindowId
          })
        }
      })
    },
    showClose () {
      return !this.currSelectWindowId
    }
  }
}
</script>

