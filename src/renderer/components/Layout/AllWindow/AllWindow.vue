<template>
  <div>
    <template v-for="item in popWindowList">
      <pop-window 
        :title="item.title"
        v-if="currOpenWindow === item.id"
        :cancelClose="item.cancelClose"
        @closeWindow="closeWindow"
        :key="item.id">
        <component :is="item.name"></component>
      </pop-window>
    </template>
  </div>
</template>

<script>
import PopWindow from '@/components/Common/PopWindow/PopWindow'
import { mapGetters } from 'vuex'
import { popWindowList } from '@/util/list'

const list = require.context('./WindowList', true, /\.vue$/)
const windowList = {}
list.keys().forEach(item => { // 利用webpack的context获取所有弹窗的上下文, 从而可以动态加载弹窗  不用每个弹窗写一遍 大大减少代码量
  windowList[item.substring(item.lastIndexOf('/') + 1, item.lastIndexOf('.'))] = list(item).default
})

export default {
  data () {
    return {
      popWindowList
    }
  },
  created () {
  },
  computed: {
    // 通过currOpenWindow来设置当前显示的窗口
    ...mapGetters(['currOpenWindow'])
  },
  components: {
    PopWindow,
    ...windowList
  },
  methods: {
    closeWindow () {
      this.$store.dispatch('setCurrOpenWindow', null)
    }
  }
}
</script>

<style lang="scss">

</style>