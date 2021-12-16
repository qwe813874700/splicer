import { mapGetters, mapActions } from 'vuex'
import { LOCAL_STORE_KEY } from '@/util/global'
import Store from 'electron-store'

const storeKey = LOCAL_STORE_KEY.resListData

export const popMixin = {
  methods: {
    closeWindow () {
      this.$emit('closeWindow')
    }
  }
}

export const popSpliceWindowMixin = {
  data () {
    return {
      row: 0,
      col: 0
    }
  },
  created () {
    this._initRowAndCol()
  },
  methods: {
    _initRowAndCol () {
      this.row = this.physicalColumn
      this.col = this.physicalRow
    },
    ...mapActions([
      'setDataByKey',
      'setCurrOpenWindow',
      'setPresetGroupList',
      'setGroupList',
      'setDeviceList',
      'setConfirmSettingCommanLis',
      'getDeviceListAndgetGroupList',
      'setCurrOpenWindow',
      'getDeviceList',
      'setLoadingStatus'
    ]),
    saveTrueNumber (e, key, maxVal) {
      if (!Number(this[key])) {
        this[key] = 1
      }
      this[key] = Math.min(maxVal, e.target.value)
    },
    isSelect (item) {
      return this.presetGroupList.filter(list => list.id === item.id).length > 0
    },
    getAddGroupId (id) { // 获取当前分组ID
      for (let i = 0; i < this.groupTableList.length; i++) {
        const element = this.groupTableList[i]
        if (element.groupIdList.indexOf(id) > -1) {
          return element.id
        }
      }
      return false
    },
    getTableListObj (id) { // 获取当前所在的分组, 获取其对象
      return this.groupList.filter(item => item.screenList.indexOf(id) > -1)[0]
    },
    isAddGroup (id) {
      return typeof this.getAddGroupId(id) === 'number'
    },
    setScreenList () {
      if (this.row === this.oldData.physicalRow && this.col === this.oldData.physicalColumn) {
        this.setDataByKey({
          mutationsKeys: 'SET_DATA',
          val: {
            groupList: this.oldData.groupList,
            screenList: this.oldData.screenList
          }
        })
      } else {
        this.setDataByKey({
          mutationsKeys: 'SET_DATA',
          val: {
            groupList: [],
            screenList: Array.from(new Array(this.row * this.col)).map((item, index) => index + 1)
          }
        })
      }
    }
  },
  computed: {
    ...mapGetters([
      'physicalColumn',
      'physicalRow',
      'logicalColumn',
      'logicalRow',
      'windowItemList',
      'presetGroupList',
      'groupList',
      'groupTableList',
      'screenH_Edge',
      'screenV_Edge',
      'selectRes',
      'splicingModule',
      'resolutionList',
      'selectRush',
      'rushList',
      'resObj',
      'rushObj',
      'oldData',
      'typeObj',
      'currDevice',
      'everyPxByVal',
      'deviceList',
      'currSelectGroupId',
      'currGroupDeviceList',
      'currSelectWindowId',
      'currSelectGroupObj',
      'confirmSettingCommanLis',
      'screenList',
      'logName'
    ]),
    minCol: {
      get () {
        return this.$store.getters['logicalColumn']
      },
      set (val) {
        this.setDataByKey({
          mutationsKeys: 'SET_PRESET_MIN_COL',
          val
        })
      }
    },
    minRow: {
      get () {
        return this.$store.getters['logicalRow']
      },
      set (val) {
        this.setDataByKey({
          mutationsKeys: 'SET_PRESET_MIN_ROW',
          val
        })
      }
    },
    screenH_Edge: {
      get () {
        return this.$store.getters['screenH_Edge']
      },
      set (val) {
        this.setDataByKey({
          mutationsKeys: 'SET_SHOWX',
          val
        })
      }
    },
    screenV_Edge: {
      get () {
        return this.$store.getters['screenV_Edge']
      },
      set (val) {
        this.setDataByKey({
          mutationsKeys: 'SET_SHOWY',
          val
        })
      }
    },
    selectRes: {
      get () {
        return this.$store.getters['selectRes']
      },
      set (val) {
        this.setDataByKey({
          mutationsKeys: 'SET_SELECT_RES',
          val
        })
      }
    },
    splicingModule: {
      get () {
        return this.$store.getters['splicingModule']
      },
      set (val) {
        this.setDataByKey({
          mutationsKeys: 'SET_SELECT_TYPE',
          val
        })
      }
    },
    selectRush: {
      get () {
        return this.$store.getters['selectRush']
      },
      set (val) {
        this.setDataByKey({
          mutationsKeys: 'SET_SELECT_RUSH',
          val
        })
      }
    },
    rushObj () {
      return this.rushList.filter(item => item.id === this.selectRush)[0]
    }
  }
}

export const popResSettingMixin = {
  data () {
    return {
      showAddRes: false,
      resType: 'add'
    }
  },
  methods: {
    showResWindow (type) {
      this.resType = type
      this.showAddRes = true
    },
    deleteResList () {
      console.log(this.groupList.findIndex(item => item.rezIdx === this.allInfo.rezIdx && item.rateIdx === this.allInfo.rateIdx))
      if (this.groupList.findIndex(item => item.rezIdx === this.allInfo.rezIdx && item.rateIdx === this.allInfo.rateIdx) > -1) {
        this.$myMessage('当前分辨率有分组正在使用,请先删除分组', 'error')
        return false
      }
      const store = new Store()
      const localResList = store.get(storeKey)
      const localResIndex = localResList.findIndex(item => item.id === this.allInfo.rezIdx)
      const localFreshIndex = localResList[localResIndex].freshList.findIndex(item => item.id === this.allInfo.rateIdx)
      localResList[localResIndex].freshList.splice(localFreshIndex, 1)
      this.setDataByKey({
        mutationsKeys: 'SET_RESOLUTION_LIST',
        val: {
          type: 'delete',
          resIndex: this.resIndex,
          freshIndex: this.freshIndex
        }
      })
      store.set(storeKey, localResList)
      this.$set(this.allInfo, 'rateIdx', this.resObj.freshList[0].id)
    }
  },
  computed: {
    ...mapGetters(['typeObj']),
    resObj () {
      return this.resolutionList.filter(item => item.id === this.allInfo.rezIdx)[0]
    },
    currResRushObj () {
      return this.resObj.freshList.filter(item => item.id === this.allInfo.rateIdx)[0]
    },
    resIndex () {
      return this.resolutionList.indexOf(this.resObj)
    },
    freshIndex () {
      return this.resObj.freshList.indexOf(this.currResRushObj)
    }
  },
  watch: {
    'allInfo.rezIdx': function (newVal) {
      if (this.type === 'update' && this.isFirst) {
        this.isFirst = false
        return false
      }
      this.$set(this.allInfo, 'rateIdx', this.resObj.freshList[0].id)
    }
  }
}
