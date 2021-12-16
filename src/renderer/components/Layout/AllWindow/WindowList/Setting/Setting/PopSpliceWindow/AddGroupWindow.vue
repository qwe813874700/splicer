<template>
  <div class="add-group flex-box">
    <div class="group-left flex-1 mg-r" @mousewheel.prevent="scaleBack" @click="clearPresetSelect">
      <div class="pop-window-back" :style="backTransformObj">
        <div class="pop-window-item"
          v-for="item in windowItemList.list"
          :key="item.id" :style="item" 
          @mousedown.left.stop="startSelectGroupItem($event, item)"
          :class="{select: isSelect(item), [`back-group-${getAddGroupId(item.id)}`]: true}"
          @click.stop="setSelectItem(item, getAddGroupId(item.id))">
          <div>
            <div class="window-item-title">{{ item.id }} 屏幕分辨率</div>
            <div class="window-item-container">
              {{ getCurrUseObj(item.id).hActive }} × {{ getCurrUseObj(item.id).vActive }} {{ getCurrUseObj(item.id).refresh }}Hz
            </div>
          </div>
        </div>
        <div class="select-item" :style="selectStyle"></div>
      </div>
    </div>
    <div class="group-right">
      <div class="window-container mg-t-0">
        <div class="container-title">拼接设置</div>
        <div class="container">
          <div class="flex-box">
            <div class="flex-label">默认拼接方式</div>
            <el-select v-model="allInfo.splicingModule" size="mini" class="flex-1">
              <el-option v-for="item in spliceTypeList" :label="item.name" :value="item.id" :key="item.id"></el-option>
            </el-select>
          </div>
        </div>
      </div>
      <div class="window-container">
        <div class="container-title">分组名称</div>
        <div class="container">
          <div>
            <el-input size="mini" v-model="allInfo.groupName"></el-input>
          </div>
        </div>
      </div>
      <div class="window-container">
        <div class="container-title">显示设置</div>
        <div class="container">
          <div class="flex-box">
            <div class="flex-label">边沿:</div>
            <el-input size="mini" class="flex-1 mg-r" v-model="allInfo.screenH_Edge"></el-input>
            <el-input size="mini" class="flex-1" v-model="allInfo.screenV_Edge"></el-input>
          </div>
        </div>
      </div>
      <div class="window-container">
        <div class="container-title">显示器默认设置</div>
        <div class="container">
          <div class="flex-box">
            <div class="flex-label">分辨率</div>
            <el-select size="mini" v-model="allInfo.rezIdx" class="flex-1">
              <el-option
                v-for="item in resolutionList"
                :key="item.id"
                :label="`${item.width} × ${item.height}`"
                :value="item.id">
              </el-option>
            </el-select>
          </div>
          <div class="flex-box mg-t">
            <div class="flex-label">刷新率</div>
            <el-select size="mini" v-model="allInfo.rateIdx" class="flex-1">
              <el-option
                v-for="item in resObj.freshList"
                :key="item.id"
                :label="`${item.refresh}Hz`"
                :value="item.id">
              </el-option>
            </el-select>
          </div>
          <div class="flex-box between mg-t">
            <el-button size="mini" type="primary" @click="showResWindow('add')">添加</el-button>
            <el-button size="mini" type="primary" @click="showResWindow('update')" :disabled="!currResRushObj.isUserAdd">修改</el-button>
            <el-button size="mini" type="primary" :disabled="!currResRushObj.isUserAdd" @click="deleteResList">删除</el-button>
          </div>
        </div>
      </div>
      <div class="container-footer">
        <el-button size="mini" type="primary" @click="addGroupList">确认</el-button>
      </div>
    </div>
    <setting-resolution 
      @closeWindow="showAddRes=false"
      :type="resType"
      v-if="showAddRes"
      :freshObj="currResRushObj"
    ></setting-resolution>
  </div>
</template>

<script>

import { popSpliceWindowMixin, popMixin, popResSettingMixin } from '@/api/mixins/popwindow-mixin'
import { spliceTypeList } from '@/util/list'
import { mapGetters } from 'vuex'
import SettingResolution from '@/components/Common/SettingResolution/SettingResolution'

export default {
  mixins: [popSpliceWindowMixin, popMixin, popResSettingMixin],
  components: {
    SettingResolution
  },
  data () {
    return {
      selectStyle: {}, // 控制幕布的样式
      scale: 1, // 控制背景的缩放比例
      backTransformObj: {},
      createSelect: false, // 当前是否在选择窗口
      spliceTypeList,
      allInfo: {
        splicingModule: 0,
        groupName: '',
        screenH_Edge: 0,
        screenV_Edge: 0,
        rezIdx: 9,
        rateIdx: 0
      },
      socket: null
    }
  },
  created () {
    this._initWindowData()
  },
  methods: {
    _initWindowData () {
      this.$set(this.allInfo, 'groupName', `第${this.groupList.length + 1}组`)
    },
    /**
     * @param Event e 鼠标事件对象
     * @param Object item 当前点击窗口的信息
     */
    startSelectGroupItem (e, item) { // 通过拖动选择范围内的屏幕
      this.createSelect = true // 设置当前是否正在选择窗口
      const startPoint = { // 记录开始选择的坐标
        startX: e.offsetX + e.currentTarget.offsetLeft, // x坐标 = 当前离左侧的距离 + 元素距离窗口左侧的距离
        startY: e.offsetY + e.currentTarget.offsetTop, // y坐标 = 当前离上侧的距离 + 元素距离窗口上侧的距离
        x: e.x,
        y: e.y
      }
      document.onmousemove = (event) => { // 开始拖动鼠标,并生成幕布来展示当前选择的范围
        this.selectStyle = {
          width: `${Math.max(Math.abs(event.x - startPoint.x) / this.scale, 0)}px`, // 幕布宽度 = (当前鼠标横坐标 - 起始点的横坐标)的绝对值 / 当前缩放的大小
          height: `${Math.max(Math.abs(event.y - startPoint.y) / this.scale, 0)}px`, // 幕布高度 = (当前鼠标纵坐标 - 起始点的纵坐标)的绝对值 / 当前缩放的大小
          left: `${startPoint.startX + (event.x - e.x > 0 ? 0 : event.x - e.x) / this.scale}px`,
          top: `${startPoint.startY + (event.y - e.y > 0 ? 0 : event.y - e.y) / this.scale}px`,
          numberWidth: Math.max(Math.abs(event.x - startPoint.x) / this.scale, 0),
          numberHeight: Math.max(Math.abs(event.y - startPoint.y) / this.scale, 0)
        }
      }
      document.onmouseup = (event) => { // 鼠标松开, 幕布消失,计算在当前选择范围内的窗口
        const rangeObj = {}
        if (event.x - e.x > 0) { // 计算结束点的x, 若在起始点的右侧, 则直接使用当前点击窗口的起始点, 否则 当前窗口的起始点 - 幕布宽度 做起始点
          rangeObj.startX = item.numberLeft
          rangeObj.endX = item.numberLeft + this.selectStyle.numberWidth
        } else {
          rangeObj.startX = item.numberLeft - this.selectStyle.numberWidth
          rangeObj.endX = item.numberLeft + item.numberWidth
        }
        if (event.y - e.y > 0) { // 计算结束点的y, 若在起始点的下侧, 则直接使用当前点击窗口的起始点
          rangeObj.startY = item.numberTop
          rangeObj.endY = item.numberTop + this.selectStyle.numberHeight
        } else {
          rangeObj.startY = item.numberTop - this.selectStyle.numberHeight
          rangeObj.endY = item.numberTop + item.numberHeight
        }
        const selectItem = this.windowItemList.list.filter(list => { // 从windowList中筛选出范围内的窗口
          return (list.numberLeft >= rangeObj.startX && list.numberLeft < rangeObj.endX) && (list.numberTop >= rangeObj.startY && list.numberTop < rangeObj.endY)
        })
        let isAddGroup = false
        for (let i = 0; i < selectItem.length; i++) { // 判断当前范围内是否有已选中的窗口, 若有则不选中
          const element = selectItem[i]
          if (this.isAddGroup(element.id)) {
            isAddGroup = true
            break
          }
        }
        if (!isAddGroup) {
          this.setPresetGroupList(selectItem)
        }
        document.onmousemove = null
        this.selectStyle = {} // 清空幕布
        document.onmouseup = null
      }
    },
    scaleBack (e) { // 缩放背景
      this.scale += -e.deltaY / 1000
      this.scale = e.deltaY > 0 ? Math.max(this.scale, 0.3) : Math.min(this.scale, 3)
      this.setWindowScaleAndTranlate()
    },
    setWindowScaleAndTranlate () { // 设置背景的transform属性
      this.$set(this.backTransformObj, 'transform', `scale(${this.scale})`)
    },
    clearPresetSelect () { // 清除预选的屏幕
      if (this.createSelect) {
        this.createSelect = false
        return false
      }
      this.setPresetGroupList([])
    },
    addGroupList () {
      if (!this.presetGroupList.length) {
        this.$myMessage('分组未添加任何屏幕', 'error')
        return
      }
      const data = Object.assign(this.allInfo, {
        guihead: 'addSplicingGroup',
        groupIdx: this.groupList.length + 1,
        screenRow: this.presetGroupList.filter(item => item.numberLeft === this.presetGroupList[0].numberLeft).length,
        screenColumn: this.presetGroupList.filter(item => item.numberTop === this.presetGroupList[0].numberTop).length,
        screenList: this.presetGroupList.map(item => item.id),
        screenSetting: this.currResRushObj
      })
      this.setConfirmSettingCommanLis({
        type: 'add',
        value: data
      })
      data['resObj'] = this.resObj
      data['currResRushObj'] = this.currResRushObj
      data['list'] = this.presetGroupList
      this.setGroupList({
        type: 'add',
        value: data
      })
      this.clearPresetSelect()
      this.closeWindow()
    },
    setSelectItem (item, groupId) { // 选择单个屏幕
      if (typeof groupId !== 'number') {
        this.setPresetGroupList([item])
      }
    },
    getCurrUseObj (id) {
      return this.isAddGroup(id) ? this.getTableListObj(id).screenSetting : this.currResRushObj
    }
  },
  destroyed () {
    this.clearPresetSelect()
  }
}
</script>

<style lang="scss">
.add-group {
  width: 800px;
  padding: 10px;
  .group-left, .group-right {
    height: 390px;
  }
  .group-left {
    border: 1px solid #000;
    overflow: auto;
    background: rgb(245, 245, 245);
    .select-item {
      background: rgba(0, 0, 0, .3);
      position: absolute;
    }
  }
  .group-right {
    width: 300px;
  }
}
</style>