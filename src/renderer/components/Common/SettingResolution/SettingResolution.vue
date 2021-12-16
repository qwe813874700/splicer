<template>
  <pop-window title="分辨率设置" @closeWindow="$emit('closeWindow')">
    <div class="setting-res">
      <div class="window-container">
        <div class="container-title">后端参数</div>
        <div class="container">
          <div class="d-flex mb-2">
            <div class="item-box flex-1 me-3">
              <div class="item-title mb-1">活动水平像素:</div>
              <el-input type="primary" size="mini" v-model.number="currFreshObj.hActive" :disabled="type === 'update'" oninput="value=value.replace(/[^\d]/g,'')" :maxlength="4"></el-input>
            </div>
            <div class="item-box flex-1">
              <div class="item-title mb-1">活动垂直像素:</div>
              <el-input type="primary" size="mini" v-model.number="currFreshObj.vActive" :disabled="type === 'update'" oninput="value=value.replace(/[^\d]/g,'')" :maxlength="4"></el-input>
            </div>
          </div>
          <div class="d-flex mb-2">
            <div class="item-box flex-1 me-3">
              <div class="item-title mb-1">水平前沿:</div>
              <el-input type="primary" size="mini"  v-model.number="currFreshObj.hFrontPorch" oninput="value=value.replace(/[^\d]/g,'')" :maxlength="4"></el-input>
            </div>
            <div class="item-box flex-1">
              <div class="item-title mb-1">垂直前沿:</div>
              <el-input type="primary" size="mini"  v-model.number="currFreshObj.vFrontPorch" oninput="value=value.replace(/[^\d]/g,'')" :maxlength="4"></el-input>
            </div>
          </div>
          <div class="d-flex mb-2">
            <div class="item-box flex-1 me-3">
              <div class="item-title mb-1">水平同步宽度:</div>
              <el-input type="primary" size="mini" v-model.number="currFreshObj.hSyncWidth" oninput="value=value.replace(/[^\d]/g,'')" :maxlength="4"></el-input>
            </div>
            <div class="item-box flex-1">
              <div class="item-title mb-1">垂直同步宽度:</div>
              <el-input type="primary" size="mini" v-model.number="currFreshObj.vSyncWidth" oninput="value=value.replace(/[^\d]/g,'')" :maxlength="4"></el-input>
            </div>
          </div>
          <div class="d-flex mb-2">
            <div class="item-box flex-1 me-3">
              <div class="item-title mb-1">水平总数:</div>
              <el-input type="primary" size="mini" v-model.number="currFreshObj.hTotal" oninput="value=value.replace(/[^\d]/g,'')" :maxlength="4"></el-input>
            </div>
            <div class="item-box flex-1">
              <div class="item-title mb-1">垂直总数:</div>
              <el-input type="primary" size="mini" v-model.number="currFreshObj.vTotal" oninput="value=value.replace(/[^\d]/g,'')" :maxlength="4"></el-input>
            </div>
          </div>
          <div class="d-flex mb-2">
            <div class="item-box flex-1 me-3">
              <div class="item-title mb-1">水平同步极性:</div>
              <el-select type="primary" size="mini" class="w-100" v-model="currFreshObj.hSyncPolar">
                <el-option v-for="item in syncPolarList" :label="item.label" :key="item.id" :value="item.id"></el-option>
              </el-select>
            </div>
            <div class="item-box flex-1">
              <div class="item-title mb-1">垂直同步极性:</div>
              <el-select type="primary" size="mini" class="w-100" v-model="currFreshObj.vSyncPolar">
                <el-option v-for="item in syncPolarList" :label="item.label" :key="item.id" :value="item.id"></el-option>
              </el-select>
            </div>
          </div>
          <div class="d-flex">
            <div class="item-box flex-1 me-3">
              <div class="item-title mb-1">水平扫描率:</div>
              <div>{{ calculateObj.hScanRate / 1000 }}K</div>
            </div>
            <div class="item-box flex-1">
              <div class="item-title mb-1">像素时钟:</div>
              <div>{{ calculateObj.pixelClk / 1000 / 1000 }}MHz</div>
            </div>
          </div>
        </div>
      </div>
      <div class="window-container">
        <div class="container-title">高级刷新参数</div>
        <div class="container">
          <div class="d-flex">
            <div class="item-box flex-1 me-3">
              <div class="item-title mb-1">刷新频率:</div>
              <el-select v-model="currFreshObj.refresh" size="mini" :disabled="type === 'update'">
                <el-option v-for="item in freshList" :key="item.id" :label="item.label" :value="item.id"></el-option>
              </el-select>
              <!-- <el-input type="primary" size="mini" v-model.number="currFreshObj.refresh" :disabled="type === 'update'" oninput="value=value.replace(/[^\d]/g,'')" :maxlength="4"></el-input> -->
            </div>
            <div class="item-box flex-1"></div>
          </div>
        </div>
      </div>
      <div class="container-footer">
        <el-button type="primary" size="mini" @click="addOrUpdateResList">确认</el-button>
      </div>
    </div>
  </pop-window>
</template>

<script>
import PopWindow from '../PopWindow/PopWindow.vue'
import Store from 'electron-store'
import { LOCAL_STORE_KEY } from '@/util/global'
import { mapGetters, mapActions } from 'vuex'

const storeKey = LOCAL_STORE_KEY.resListData
// new Store().delete(storeKey)

export default {
  components: {
    PopWindow
  },
  props: {
    type: {
      type: String,
      default: 'add'
    },
    freshObj: {
      type: Object,
      default: () => {
        return {
          hActive: 1920, // 活动水平像素
          hBlank: 280, // hBlank= hTotal-hActive
          hFrontPorch: 88, // 水平前沿
          hBackPorch: 148, // hBackPorch= hBlank-hFrontPorch-hSyncWidth
          hSyncWidth: 44, // 水平同步宽度
          hTotal: 2200, // 水平总数
          hSyncPolar: 0, // 水平同步极性
          vActive: 1080, // 垂直活动像素
          vBlank: 45, // vBlank= vTotal-vActive
          vFrontPorch: 4, // 垂直前沿
          vBackPorch: 36, // vBackPorch= vBlank-vFrontPorch-vSyncWidth
          vSyncWidth: 5, // 垂直同步宽度
          vTotal: 1125, // 垂直总数
          vSyncPolar: 1, // 垂直同步极性
          refresh: 60, // 刷新率
          pixelClk: 148500000, // 像素时钟 pixelClk = hTotal*vTotal*refresh
          hScanRate: 67500, // 水平扫描率 hScanRate= vTotal * refresh
          videoFormat: 0 // 不知道是啥 默认是0就完事
        }
      }
    }
  },
  data () {
    return {
      currFreshObj: null,
      syncPolarList: [
        {
          id: 0,
          label: '-'
        },
        {
          id: 1,
          label: '+'
        }
      ],
      store: new Store(),
      freshList: [
        {
          id: 23,
          value: '23Hz'
        },
        {
          id: 24,
          value: '24Hz'
        },
        {
          id: 25,
          value: '25Hz'
        },
        {
          id: 29,
          value: '29Hz'
        },
        {
          id: 30,
          value: '30Hz'
        },
        {
          id: 50,
          value: '50Hz'
        },
        {
          id: 60,
          value: '60Hz'
        }
      ]
    }
  },
  created () {
    this._initFreshObj()
  },
  computed: {
    ...mapGetters(['resolutionList']),
    currResIndex () { // 根据当前 hActive 和 vActive查找当前resolutionList的Index
      return this.resolutionList.findIndex(item => item.width === this.currFreshObj.hActive && item.height === this.currFreshObj.vActive)
    },
    currFreshIndex () {
      const { hFrontPorch, vFrontPorch, hTotal, vTotal, hSyncWidth, vSyncWidth, refresh } = this.currFreshObj
      if (this.currResIndex === -1) {
        return -1
      } else {
        return this.resolutionList[this.currResIndex].freshList.findIndex(item => {
          return item.refresh === refresh
          // return item.hFrontPorch === hFrontPorch && item.vFrontPorch === vFrontPorch && item.hTotal === hTotal && item.vTotal === vTotal && item.hSyncWidth === hSyncWidth && item.vSyncWidth === vSyncWidth && refresh
        })
      }
    },
    calculateObj () {
      return { // 一些需要根据输入的值来计算
        pixelClk: this.currFreshObj.hTotal * this.currFreshObj.vTotal * this.currFreshObj.refresh,
        hScanRate: this.currFreshObj.vTotal * this.currFreshObj.refresh,
        hBlank: this.currFreshObj.hTotal - this.currFreshObj.hActive,
        vBlank: this.currFreshObj.vTotal - this.currFreshObj.vActive,
        hBackPorch: this.currFreshObj.hTotal - this.currFreshObj.hActive - this.currFreshObj.hFrontPorch - this.currFreshObj.hSyncWidth,
        vBackPorch: this.currFreshObj.vTotal - this.currFreshObj.vActive - this.currFreshObj.vFrontPorch - this.currFreshObj.vSyncWidth
      }
    }
  },
  methods: {
    ...mapActions(['setDataByKey']),
    _initFreshObj () {
      this.currFreshObj = Object.assign(JSON.parse(JSON.stringify(this.freshObj))) // 初始化并加上
    },
    addOrUpdateResList () {
      const { hActive, vActive, hFrontPorch, vFrontPorch, hTotal, vTotal, hSyncWidth, vSyncWidth } = this.currFreshObj
      const { result, message } = this.isFormat()
      if (!result) { // 判断为0或为空, 或是否小于等于4096
        this.$myMessage(message, 'error')
        return false
      }
      if (hTotal < hActive + hFrontPorch + hSyncWidth) {
        this.$myMessage('活动水平像素, 水平前沿, 水平同步宽度的和不能大于水平总数', 'error')
        return false
      }
      if (vTotal < vActive + vFrontPorch + vSyncWidth) {
        this.$myMessage('活动垂直像素, 垂直前沿, 垂直同步宽度的和不能大于垂直总数', 'error')
        return false
      }
      const freshObj = Object.assign(this.currFreshObj, this.calculateObj)
      const currLocalData = this.store.get(storeKey) || [] // 读取本地数据
      const currResLocalDataIndex = currLocalData.findIndex(item => item.width === freshObj.hActive && item.height === freshObj.vActive)
      let currFreshLocalDataIndex = -1
      if (currResLocalDataIndex > -1) {
        currFreshLocalDataIndex = currLocalData[currResLocalDataIndex].freshList.findIndex(item => item.refresh === freshObj.refresh)
      }
      if (this.type === 'add') {
        const newData = {
          id: this.$util.getMinNumber(this.resolutionList, 'id', 1),
          width: freshObj.hActive,
          height: freshObj.vActive,
          freshList: [Object.assign(freshObj, { id: 1, isUserAdd: true })]
        }
        if (this.currResIndex === -1) { // 若列表中没有, 则先向本地列表数据中添加
          currLocalData.push(newData)
          this.setResList({ // 设置vuex中数据
            type: 'add',
            value: newData
          })
        } else { // 当前的分辨率已存在, 则判断freshList中是否存在当前刷新率的
          if (this.currFreshIndex !== -1) {
            this.$myMessage('当前项已存在,无法重复添加', 'error')
            return false
          } else {
            const freshId = this.$util.getMinNumber(this.resolutionList[this.currResIndex].freshList, 'id', 0)
            if (currResLocalDataIndex > -1) {
              currLocalData[currResLocalDataIndex].freshList.push(Object.assign(freshObj, { id: freshId, isUserAdd: true }))
            } else {
              currLocalData.push(Object.assign(newData, { id: this.resolutionList[this.currResIndex].id }))
            }
            this.setResList({
              type: 'add',
              resIndex: this.currResIndex,
              value: Object.assign(freshObj, { id: freshId, isUserAdd: true })
            })
          }
        }
      } else {
        if (freshObj.isUserAdd) {
          currLocalData[currResLocalDataIndex].freshList[currFreshLocalDataIndex] = freshObj
        }
        this.setResList({
          type: 'update',
          resIndex: this.currResIndex,
          value: freshObj,
          freshIndex: this.currFreshIndex
        })
      }
      this.store.set(storeKey, currLocalData) // 设置本地列表
      this.$emit('closeWindow')
    },
    isFormat () {
      const arr = {
        hActive: '活动水平像素',
        vActive: '活动垂直像素',
        hFrontPorch: '水平前沿',
        vFrontPorch: '垂直前沿',
        hTotal: '水平总数',
        vTotal: '垂直总数',
        hSyncWidth: '水平同步宽度',
        vSyncWidth: '垂直同步宽度',
        refresh: '刷新频率'
      }
      for (const key in arr) {
        if (Object.hasOwnProperty.call(this.currFreshObj, key)) {
          const element = this.currFreshObj[key]
          if (element === 0 || element === '') {
            return {
              result: false,
              message: `${arr[key]}不能为${element === 0 ? '0' : '空'}`
            }
          }
          if (element > 4096) {
            return {
              result: false,
              message: `${arr[key]}不能大于4096`
            }
          }
        }
        return {
          result: true
        }
      }
    },
    setResList (data) {
      this.setDataByKey({
        mutationsKeys: 'SET_RESOLUTION_LIST',
        val: data
      })
    }
  }
}
</script>

<style>
.setting-res {
  width: 420px;
}
</style>
