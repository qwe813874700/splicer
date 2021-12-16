<template>
  <div class="nav-container">
    <template v-for="item in list">
      <div class="nav-group" v-if="item.children.length > 0" :key="item.label">
        <div class="group-body">
          <div class="group-item" v-for="(child, index) in item.children" :key="index * Math.random() * Math.random()" @click="openMethods(child.methods, child.sendData, $event)" :disabled="setResult(child.disabled)">
            <div class="group-icon">
              <img :src="child.icon" alt="" width="30">     
            </div>
            <div class="group-explain">{{ child.label }}</div>
          </div>
        </div>
        <div class="group-footer">{{ item.label }}</div>
      </div>
    </template>
  </div>
</template>

<script>
import { navMixin } from '@/api/mixins/nav-mixin.js'
import { mapGetters, mapActions } from 'vuex'
import { ipcRenderer } from 'electron'
import { popSpliceWindowMixin } from '@/api/mixins/popwindow-mixin.js'

export default {
  mixins: [navMixin, popSpliceWindowMixin],
  created () {
    this._initGroupList()
  },
  computed: {
    ...mapGetters(['isChangeGroupList', 'groupList'])
  },
  watch: {
    isChangeGroupList: function (newVal) {
      if (newVal) {
        this._initGroupList()
      }
    }
  },
  data () {
    return {
      list: [
        {
          label: '设置',
          children: [
            {
              label: '通讯',
              icon: require('@/assets/img/window.png'),
              methods: 'openConnectWindow'
            },
            {
              label: '拼接',
              icon: require('@/assets/img/window.png'),
              methods: 'createNewWindow',
              sendData: 7
            },
            {
              label: '输出',
              icon: require('@/assets/img/window.png'),
              disabled: 'isSelectGroup',
              methods: 'createNewWindow',
              sendData: 10
            },
            {
              label: '信号源',
              icon: require('@/assets/img/window.png'),
              methods: ''
            },
            {
              label: '用户',
              icon: require('@/assets/img/window.png'),
              methods: ''
            },
            {
              label: '大屏背景',
              icon: require('@/assets/img/window.png'),
              methods: 'createNewWindow',
              sendData: 11
            },
            {
              label: '设备激活',
              icon: require('@/assets/img/window.png'),
              methods: 'createNewWindow',
              sendData: 12
            }
          ]
        },
        {
          label: '测试',
          children: [
            {
              label: '测试',
              icon: require('@/assets/img/window.png'),
              methods: 'openSwitch'
            },
            {
              label: '风扇开关',
              icon: require('@/assets/img/window.png'),
              methods: 'openSwitch'
            }
          ]
        },
        {
          label: '分组',
          children: [
            {
              label: '',
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
        }
      ]
    }
  },
  methods: {
    ...mapActions(['setCurrSelectGroupId', 'getDeviceList', 'setDeviceList', 'getDeviceListAndgetGroupList']),
    _initGroupList () {
      const listChildren = []
      this.groupList.forEach(item => {
        listChildren.push({
          label: item.groupName,
          icon: require('@/assets/img/window.png'),
          methods: 'setCurrGroup',
          sendData: item.groupIdx
        })
      })
      this.$set(this.list[2], 'children', listChildren)
      // this.setCurrSelectGroupId(this.currSelectGroupId ? this.groupList[0].groupIdx : null)
    },
    openSwitch () {
      this.$request(`${'reboot!'}\r`).then(res => {
        setTimeout(item => {
          this.getDeviceListAndgetGroupList()
        }, 6000)
      })
    },
    setCurrGroup (groupIdx) {
      if (this.currSelectGroupId === groupIdx) {
        return false
      }
      this.setCurrSelectGroupId(groupIdx)
      // this.setDeviceList({
      //   type: 'set',
      //   value: []
      // })
      this.getDeviceList(groupIdx)
      this.setDataByKey({
        mutationsKeys: 'SET_IS_CHANGE_GROUP_LIST',
        val: true
      })
    },
    openConnectWindow () {
      ipcRenderer.send('openConnectChild')
    },
    isSelectGroup () {
      return !this.currSelectGroupObj
    }
  }
}
</script>

<style></style>
