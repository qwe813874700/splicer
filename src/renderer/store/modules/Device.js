import * as types from '../modules-types'
import Vue from 'vue'
import { resolutionList } from '../../util/list'
import { WINDOW_OPERATION, LOCAL_STORE_KEY } from '../../util/global'
import Store from 'electron-store'

const storeKey = LOCAL_STORE_KEY.resListData
const storeSliderKey = LOCAL_STORE_KEY.sliderList

const initResList = () => {
  const store = new Store()
  // store.delete(storeKey)
  const localResList = store.get(storeKey) || []
  const newList = resolutionList.slice(0)
  localResList.forEach(item => {
    const resIndex = newList.findIndex(list => list.id === item.id)
    if (resIndex > -1) {
      newList[resIndex].freshList = newList[resIndex].freshList.concat(item.freshList)
    } else {
      newList.push(item)
    }
  })
  return newList
}

const Device = {
  state: {
    currDevice: null,
    deviceList: [],
    physicalColumn: 3,
    physicalRow: 3,
    logicalColumn: 2,
    logicalRow: 2,
    width: 150,
    presetGroupList: [],
    groupList: [],
    splicingModule: 0,
    showX: 0,
    showY: 0,
    selectRes: 9,
    resolutionList: initResList(),
    selectRush: 0,
    confirmObj: null,
    isChangeGroupList: null,
    currSelectGroupId: null,
    oldData: [],
    everyPxByVal: 0,
    confirmSettingCommanLis: [],
    screenList: [],
    cardList: [],
    inputCardList: [],
    loadingStatus: false
  },
  getters: {
    currDevice: state => state.currDevice, // 当前选择需要生成窗口的设备
    deviceList: state => state.deviceList, // 生成窗口的列表
    physicalColumn: state => state.physicalColumn, // 物理屏列数
    physicalRow: state => state.physicalRow, // 物理屏行数
    logicalColumn: state => state.logicalColumn, // 逻辑平列数
    logicalRow: state => state.logicalRow, // 逻辑屏行数
    windowItemList: (state) => {
      const list = []
      const selectOptionArr = []
      const width = state.width // 以1920来作为1 对比 state.width的值
      const height = 1080 / 1920 * state.width
      for (let i = 0; i < Math.max(state.physicalRow, 1); i++) {
        for (let j = 0; j < Math.max(state.physicalColumn, 1); j++) {
          const currIndex = i * state.physicalColumn + j // 计算当前索引
          const currGroup = state.groupList.filter(item => item.screenList.indexOf(state.screenList[currIndex]) > -1)
          list.push({
            id: state.screenList[currIndex],
            width: `${width}px`,
            height: `${height}px`,
            left: `${j * width}px`,
            top: `${i * height}px`,
            resWidth: currGroup[0] ? currGroup[0].screenSetting.hActive : 1920,
            resHeight: currGroup[0] ? currGroup[0].screenSetting.vActive : 1080,
            refresh: currGroup[0] ? currGroup[0].screenSetting.refresh : 60,
            numberLeft: j * width,
            numberTop: i * height,
            numberWidth: width,
            numberHeight: height
          })
          selectOptionArr.push({
            id: currIndex + 1,
            label: `屏幕${currIndex + 1}`
          })
        }
      }
      return {
        list,
        selectOptionArr
      }
    }, // 根据预先设置的 Col 和 Row来生成每个分组信息
    presetGroupList: state => state.presetGroupList, // 打开添加和修改的窗口时, 所选择的分组信息
    groupList: state => state.groupList, // 当前所有的分组列表及信息
    oldData: state => state.oldData, // 用来存储打开窗口时的所有数据
    groupTableList: (state) => {
      const tableList = []
      state.groupList.forEach(item => {
        tableList.push({
          id: item.groupIdx,
          groupName: item.groupName,
          groupInfo: `${item.screenList.length}: ${item.screenList.join(',')}`,
          groupIdList: item.screenList,
          splicingModule: item.splicingModule,
          screenH_Edge: item.screenH_Edge,
          screenV_Edge: item.screenV_Edge,
          rezIdx: item.rezIdx,
          rateIdx: item.rateIdx
        })
      })
      return tableList
    }, // 根据当前分组来生成的, 显示在左侧table
    showX: state => state.showX, // 边沿的X
    showY: state => state.showY, // 边沿的Y
    selectRes: state => state.selectRes, // 当前选择的分辨率
    resObj: state => state.resolutionList.filter(item => item.id === state.selectRes)[0], // 当前选择的分辨率的对象
    splicingModule: state => state.splicingModule, // 当前选择的拼接方式
    resolutionList: state => state.resolutionList, // 分辨率的集合
    rushList: state => state.resolutionList.filter(item => item.id === state.selectRes)[0].freshList, // 当前选择的分辨率下有的分辨率的集合
    selectRush: state => state.selectRush, // 当前大屏选择的刷新率的Id
    isChangeGroupList: state => state.isChangeGroupList, // 是否有改变分组, 用来触发SpliceWindow的init
    currSelectGroupId: state => state.currSelectGroupId, // 当前选择的分组的ID
    currSelectGroupObj: state => state.groupList.filter(item => item.groupIdx === state.currSelectGroupId)[0], // 当前选择的分组的对象
    currGroupDeviceList: state => state.deviceList.filter(item => item.groupIdx === state.currSelectGroupId), // 当前分组的设备
    everyPxByVal: state => state.everyPxByVal, // 记录每像素代表多少实际像素 算法: 实际分辨率宽度 / 盒子实际宽度像素,
    currSelectWindowId: state => {
      const newDeviceList = JSON.parse(JSON.stringify(state.deviceList.filter(item => item.groupIdx === state.currSelectGroupId)))
      return newDeviceList.length > 0 ? newDeviceList.sort((a, b) => b.zIndex - a.zIndex)[0].id : null
    },
    confirmSettingCommanLis: state => state.confirmSettingCommanLis, // 存储打开时需要所做操作添加的指令列表
    screenList: state => state.screenList,
    windowSizeInfo: (state, getters) => { // 根据当前分组来计算一些
      const { currSelectGroupObj } = getters
      const [width, height, row, col] = [currSelectGroupObj.screenSetting.hActive, currSelectGroupObj.screenSetting.vActive, currSelectGroupObj.screenRow, currSelectGroupObj.screenColumn]
      return {
        width,
        height,
        row,
        col,
        minRow: state.logicalRow,
        minCol: state.logicalColumn,
        maxWidth: width * col,
        maxHeight: height * row,
        oneRealMinWindowWidth: width / state.logicalColumn,
        oneRealMinWindowHeight: height / state.logicalRow
      }
    },
    cardList: state => state.cardList,
    inputCardList: state => state.inputCardList,
    treeList: state => {
      const newData = []
      state.cardList.forEach((item, i) => {
        const currInputCardList = state.inputCardList.filter(list => list.slotIdx === item.slotIdx)
        newData.push({
          id: item.slotIdx * Math.random(),
          label: item.cardName,
          disabled: true,
          slotIdx: item.slotIdx,
          children: currInputCardList
        })
      })
      return newData
    },
    treeChildList: (state, getters) => getters.treeList.map(item => item.children).reduce((a, b) => a.concat(b)),
    loadingStatus: (state) => state.loadingStatus
  },
  mutations: {
    [types.SET_CURR_DEVICE]: (state, data) => {
      state.currDevice = data
    },
    [types.SET_SPLICE_SETTING]: (state, data) => {
      for (const key in data) {
        if (Object.hasOwnProperty.call(state, key)) {
          state[key] = data[key]
        }
      }
    },
    [types.SET_DEVICE_LIST]: (state, data) => {
      if (data.type === 'set') {
        state.deviceList = data.value
      } else if (data.type === 'add') {
        state.deviceList.push(data.value)
      } else if (data.type === 'update') {
        if (!data.changeKey) {
          Vue.set(state.deviceList, data.index, data.value)
        } else {
          Vue.set(state.deviceList[data.index], data.changeKey, data.value)
        }
      } else if (data.type === 'delete') {
        state.deviceList = state.deviceList.reduce((total, current) => {
          current.id !== data.id && total.push(current)
          return total
        }, [])
      }
    },
    [types.SET_PRESET_COL]: (state, data) => {
      state.physicalColumn = data
    },
    [types.SET_PRESET_ROW]: (state, data) => {
      state.physicalRow = data
    },
    [types.SET_PRESET_MIN_COL]: (state, data) => {
      state.logicalColumn = data
    },
    [types.SET_PRESET_MIN_ROW]: (state, data) => {
      state.logicalRow = data
    },
    [types.SET_PRESET_GROUP_LIST]: (state, data) => {
      state.presetGroupList = data
    },
    [types.SET_GROUP_LIST]: (state, data) => {
      if (data.type === 'set') {
        state.groupList = data.value
      } else if (data.type === 'add') {
        state.groupList.push(data.value)
      } else if (data.type === 'update') {
        if (!data.changeKey) {
          Vue.set(state.groupList, data.index, data.value)
        } else {
          Vue.set(state.groupList[data.index], data.changeKey, data.value)
        }
      } else if (data.type === 'delete') {
        state.groupList.filter(item => item.groupIdx > state.groupList[data.index].groupIdx).forEach(item => {
          // if (item.groupName === `第${item.id}组`) {
          //   state.groupList[item.id].groupName = `第${item.id - 1}组`
          // }
          state.groupList[state.groupList.indexOf(item)].groupIdx = item.groupIdx - 1
        })
        state.groupList.splice(data.index, 1)
      }
    },
    [types.SET_SHOWX]: (state, data) => {
      state.showX = data
    },
    [types.SET_SHOWY]: (state, data) => {
      state.showY = data
    },
    [types.SET_SELECT_RES]: (state, data) => {
      state.selectRes = data
    },
    [types.SET_SELECT_RUSH]: (state, data) => {
      state.selectRush = data
    },
    [types.SET_SELECT_TYPE]: (state, data) => {
      state.splicingModule = data
    },
    [types.SET_RESOLUTION_LIST]: (state, data) => {
      if (data.type === 'add') {
        if (data.resIndex > -1) {
          state.resolutionList[data.resIndex].freshList.push(data.value)
        } else {
          state.resolutionList.push(data.value)
        }
      } else if (data.type === 'update') {
        Vue.set(state.resolutionList[data.resIndex].freshList, data.freshIndex, data.value)
      } else if (data.type === 'delete') {
        state.resolutionList[data.resIndex].freshList.splice(data.freshIndex, 1)
      }
    },
    [types.SET_DATA]: (state, data) => {
      Object.keys(data).forEach(item => {
        if (state.hasOwnProperty(item)) {
          if (typeof data[item] === 'object') {
            if (Array.isArray(data[item])) {
              state[item] = data[item].slice(0)
            } else {
              state[item] = JSON.stringify(JSON.parse(data[item]))
            }
          } else {
            state[item] = data[item]
          }
        }
      })
    },
    [types.SET_OLD_DATA]: (state, data) => {
      state.oldData = data
    },
    [types.SET_IS_CHANGE_GROUP_LIST]: (state, data) => {
      state.isChangeGroupList = data
      setTimeout(() => {
        state.isChangeGroupList = null
      }, 10)
    },
    [types.SET_CURR_SELECT_GROUPID]: (state, data) => {
      state.currSelectGroupId = data
    },
    [types.SET_EVERY_BY_VAL]: (state, data) => {
      state.everyPxByVal = data
    },
    [types.SET_CONFIRM_SETTING_COMMAND_LIST]: (state, data) => {
      if (data.type === 'set') {
        state.confirmSettingCommanLis = JSON.parse(JSON.stringify(data.value))
      } else if (data.type === 'add') {
        state.confirmSettingCommanLis.push(JSON.parse(JSON.stringify(data.value)))
      }
    },
    [types.SET_CART_LIST]: (state, data) => {
      if (data.type === 'set') {
        state.cardList = data.value
      } else if (data.type === 'update') {
        Vue.set(state.cardList, data.index, data.value)
      }
    },
    [types.SET_INPUT_CART_LIST]: (state, data) => {
      if (data.type === 'set') {
        state.inputCardList = data.value
      } else if (data.type === 'update') {
        Vue.set(state.inputCardList, data.index, data.value)
      }
    },
    [types.SET_LOADING_STATUS]: (state, data) => {
      state.loadingStatus = data
    }
  },
  actions: {
    setCurrDevice ({ commit }, data) {
      commit(types.SET_CURR_DEVICE, data)
    },
    setDeviceList ({ commit }, data) {
      commit(types.SET_DEVICE_LIST, data)
    },
    setDataByKey ({ commit }, data) {
      commit(data.mutationsKeys, data.val)
    },
    setPresetGroupList ({ commit }, data) {
      commit(types.SET_PRESET_GROUP_LIST, data)
    },
    setGroupList ({ commit }, data) {
      commit(types.SET_GROUP_LIST, data)
    },
    setCurrSelectGroupId ({ commit }, data) {
      commit(types.SET_CURR_SELECT_GROUPID, data)
    },
    setEveryPxByVal ({ commit }, data) {
      commit(types.SET_EVERY_BY_VAL, data)
    },
    setConfirmSettingCommanLis ({ commit }, data) {
      commit(types.SET_CONFIRM_SETTING_COMMAND_LIST, data)
    },
    setLoadingStatus ({ commit }, data) {
      commit(types.SET_LOADING_STATUS, data)
    },
    getCartList ({ commit }) {
      const sendData = {
        guihead: 'getCardSlotConnection'
      }
      return Vue.prototype.$request(sendData).then(res => {
        commit(types.SET_CART_LIST, {
          type: 'set',
          value: res.slotList
        })
      })
    },
    getInputCartList ({ commit, state, getters }) {
      const sendDataList = []
      state.cardList.forEach(item => {
        sendDataList.push({
          guihead: 'getCardInfomation',
          slotIdx: item.slotIdx
        })
      })
      return Vue.prototype.$loopRequest(sendDataList).then(res => {
        const store = new Store()
        const localSliderData = store.get(storeSliderKey)
        commit(types.SET_INPUT_CART_LIST, {
          type: 'set',
          value: res.map(item => item.channel.map((list, index) => {
            const cardListIndex = state.cardList.findIndex(li => li.slotIdx === item.slotIdx)
            const id = cardListIndex * item.channel.length + index + 1
            const localIndex = localSliderData ? localSliderData.findIndex(li => li.id === id && li.slotIdx === item.slotIdx) : -1
            return {
              ...list,
              slotIdx: item.slotIdx,
              label: localIndex > -1 ? localSliderData[localIndex].label : `INPUT-${id}`,
              disabled: list.signalEnable === 0,
              id
            }
          })).reduce((a, b) => a.concat(b))
        })
      })
    },
    getSpliceSetting ({ commit }) {
      return new Promise((resolve, reject) => {
        const sendData = {
          guihead: 'getSplicingSetting'
        }
        Vue.prototype.$request(sendData).then(res => {
          resolve()
          commit(types.SET_DATA, res)
        })
      })
    },
    getGroupList ({ commit, state }) { // 获取分组列表
      return new Promise((resolve, reject) => {
        const getData = (startArr = [], pageIdx = 1, pageSize = 1) => {
          const sendData = {
            guihead: 'getSplicingGroup',
            pageIdx,
            pageSize
          }
          Vue.prototype.$request(sendData).then(res => {
            if (res.splicingGroupList.length >= pageSize) {
              return getData(startArr.concat(res.splicingGroupList), ++pageIdx)
            } else {
              return resolve(startArr.concat(res.splicingGroupList))
            }
          }).catch(err => {
            reject(err)
          })
        }
        getData()
      }).then(res => {
        commit(types.SET_GROUP_LIST, {
          type: 'set',
          value: res
        })
        commit(types.SET_IS_CHANGE_GROUP_LIST, true)
        commit(types.SET_DEVICE_LIST, {
          type: 'set',
          value: []
        })
        if (res.length > 0 && (!state.currSelectGroupId || res.findIndex(item => item.groupIdx === state.currSelectGroupId) === -1)) {
          commit(types.SET_CURR_SELECT_GROUPID, res[0].groupIdx)
        }
      })
    },
    getDeviceList ({ commit, state }, groupIdx = 0) { // 获取窗口列表
      return new Promise((resolve, reject) => {
        const getData = (startArr = [], groupIndex = 0, pageIdx = 1, pageSize = 5) => {
          const sendData = {
            guihead: 'getWindowInfo',
            groupIdx: groupIdx > 0 ? groupIdx : state.groupList[groupIndex].groupIdx,
            pageIdx,
            pageSize
          }
          Vue.prototype.$request(sendData).then(res => {
            if (res.result === Vue.prototype.$ERR_CODE) {
              Vue.prototype.$myMessage('获取窗口错误', 'error')
              reject(res)
            } else {
              res.windowList.forEach(item => {
                startArr.push({
                  id: item.windowIdx,
                  zIndex: item.layerIdx,
                  width: `${item.width / state.everyPxByVal}px`,
                  height: `${item.height / state.everyPxByVal}px`,
                  left: `${item.topLeft_X / state.everyPxByVal}px`,
                  top: `${item.topLeft_Y / state.everyPxByVal}px`,
                  title: item.titleName,
                  groupIdx: res.groupIdx,
                  realX: item.topLeft_X,
                  realY: item.topLeft_Y,
                  realWidth: item.width,
                  realHeight: item.height,
                  audioSrcCh: item.audioSrcCh,
                  signalEnable: item.signalEnable,
                  videoSrcCh: item.videoSrcCh
                })
              })
              if (res.windowList.length < pageSize) {
                if (groupIdx === 0 && groupIndex < state.groupList.length - 1) { // 若groupIdx  > 0 则说明当前是搜索某个分组的所有窗口, 若不是则是搜索所有窗口
                  getData(startArr, ++groupIndex, 1)
                } else {
                  resolve(startArr)
                }
              } else {
                getData(startArr, groupIndex, ++pageIdx)
              }
            }
          })
        }
        if (state.groupList.length > 0) {
          getData()
        } else {
          resolve([])
        }
      }).then(res => {
        res.forEach(item => {
          const currIndex = state.deviceList.findIndex(list => list.id === item.id)
          if (currIndex > -1) {
            commit(types.SET_DEVICE_LIST, {
              type: 'update',
              index: currIndex,
              value: item
            })
          } else {
            commit(types.SET_DEVICE_LIST, {
              type: 'add',
              value: item
            })
          }
        })
        return res
      })
    },
    async getDeviceListAndgetGroupList ({ dispatch, commit }) { // 组合Action 获取分组信息和窗口信息
      commit(types.SET_LOADING_STATUS, true)
      await dispatch('getCartList')
      await dispatch('getInputCartList')
      await dispatch('getSpliceSetting')
      await dispatch('getGroupList')
      await dispatch('getDeviceList')
      commit(types.SET_LOADING_STATUS, false)
    },
    opeartionWindowDevice ({ state, getters, commit }, data) {
      const copyDeviceList = JSON.parse(JSON.stringify(state.deviceList)) // 先深拷贝一份deviceList数据
      return new Promise((resolve, reject) => {
        const { id, groupIdx, zIndex, realX, realY, realWidth, realHeight } = data.list
        const currIndex = copyDeviceList.findIndex(item => item.id === id)
        const currGroupDeviceList = JSON.parse(JSON.stringify(getters.currGroupDeviceList))
        const sortGroupDeviceList = currGroupDeviceList.sort((a, b) => a.zIndex - b.zIndex)
        const sortIndex = sortGroupDeviceList.findIndex(item => item.id === id)
        const { width, height, maxWidth, maxHeight, oneRealMinWindowWidth, oneRealMinWindowHeight } = getters.windowSizeInfo // 获取当前分组窗口的所有信息
        const getWindowXy = Vue.prototype.$util.getWindowXy
        switch (data.type) {
          case WINDOW_OPERATION.setBottom: { // 置底, 思路: 为当前分组的DeviceList比当前选择置底的窗口zIndex小的全部+1 当前窗口设置为1
            const sendDataList = [
              {
                guihead: 'spaceMoveWindow',
                groupIdx: groupIdx,
                windowIdx: id,
                layerIdx: 1
              }
            ]
            copyDeviceList.forEach((item, index) => {
              if (item.id !== id && item.zIndex < copyDeviceList[currIndex].zIndex && item.groupIdx === copyDeviceList[currIndex].groupIdx) { // 查找比置底窗口zindex小的窗口并 + 1
                copyDeviceList[index].zIndex = item.zIndex + 1
                sendDataList.push({
                  guihead: 'spaceMoveWindow',
                  groupIdx: getters.currSelectGroupId,
                  windowIdx: item.id,
                  layerIdx: copyDeviceList[index].zIndex
                })
              }
            })
            copyDeviceList[currIndex].zIndex = 1 // 将置底窗口设置为1
            Vue.prototype.$loopRequest(sendDataList).then(res => {
              resolve(res)
            })
            break
          }
          case WINDOW_OPERATION.addOneTop: { // 上移: 思路: 先找到当前分组 按zIndex排序好, 找到比当前高的 - 1 当前 + 1
            if (id !== getters.currSelectWindowId) {
              const replaceDevice = sortGroupDeviceList[sortIndex + 1]
              const sendDataList = [
                {
                  guihead: 'spaceMoveWindow',
                  groupIdx: groupIdx,
                  windowIdx: id,
                  layerIdx: zIndex + 1
                },
                {
                  guihead: 'spaceMoveWindow',
                  groupIdx: replaceDevice.groupIdx,
                  windowIdx: replaceDevice.id,
                  layerIdx: zIndex
                }
              ]
              Vue.prototype.$loopRequest(sendDataList).then(res => {
                copyDeviceList[currIndex].zIndex = zIndex + 1
                copyDeviceList[copyDeviceList.findIndex(item => item.id === replaceDevice.id)].zIndex = zIndex
                resolve(res)
              })
            }
            break
          }
          case WINDOW_OPERATION.subOneBottom: { // 下移 思路: 先找到当前分组 按zIndex排序好, 找到比当前低的 + 1 当前 - 1
            if (id !== sortGroupDeviceList[0].id) {
              const replaceDevice = sortGroupDeviceList[sortIndex - 1]
              const sendDataList = [
                {
                  guihead: 'spaceMoveWindow',
                  groupIdx: groupIdx,
                  windowIdx: id,
                  layerIdx: zIndex - 1
                },
                {
                  guihead: 'spaceMoveWindow',
                  groupIdx: replaceDevice.groupIdx,
                  windowIdx: replaceDevice.id,
                  layerIdx: zIndex
                }
              ]
              Vue.prototype.$loopRequest(sendDataList).then(res => {
                copyDeviceList[currIndex].zIndex = zIndex - 1
                copyDeviceList[copyDeviceList.findIndex(item => item.id === replaceDevice.id)].zIndex = zIndex
                resolve(res)
              })
            }
            break
          }
          case WINDOW_OPERATION.resizeInputWindow: { // 缩放到单个屏, 思路: 找到左上角坐标然后找到距离最近的坐标设置 计算每个屏的宽度高度就OK
            const startCoord = {
              x: getWindowXy(realX, oneRealMinWindowWidth, maxWidth),
              y: getWindowXy(realY, oneRealMinWindowHeight, maxHeight)
            }
            const sendData = {
              guihead: 'resizeWindow',
              groupIdx: groupIdx,
              windowIdx: id,
              layerIdx: zIndex,
              width: oneRealMinWindowWidth,
              height: oneRealMinWindowHeight,
              topLeft_X: startCoord.x,
              topLeft_Y: startCoord.y
            }
            Vue.prototype.$request(sendData).then(res => {
              Object.assign(copyDeviceList[currIndex], {
                realX: startCoord.x,
                realY: startCoord.y,
                realWidth: oneRealMinWindowWidth,
                realHeight: oneRealMinWindowHeight,
                width: `${oneRealMinWindowWidth / state.everyPxByVal}px`,
                height: `${oneRealMinWindowHeight / state.everyPxByVal}px`,
                left: `${startCoord.x / state.everyPxByVal}px`,
                top: `${startCoord.y / state.everyPxByVal}px`
              })
              resolve(res)
            })
            break
          }
          case WINDOW_OPERATION.maxCurrInputwindow: { //  全屏到所占窗口 思路 获取窗口左上角 右上角 左下角 坐标, 计算其宽度
            const startCoord = {
              x: getWindowXy(realX, width, maxWidth),
              y: getWindowXy(realY, height, maxHeight)
            }
            const leftCoordX = getWindowXy(realX + realWidth, width, maxWidth, true)
            const bottomCoord = getWindowXy(realY + realHeight, height, maxHeight, true)
            const sendData = {
              guihead: 'resizeWindow',
              groupIdx: groupIdx,
              windowIdx: id,
              layerIdx: zIndex,
              width: leftCoordX - startCoord.x,
              height: bottomCoord - startCoord.y,
              topLeft_X: startCoord.x,
              topLeft_Y: startCoord.y
            }
            Vue.prototype.$request(sendData).then(res => {
              Object.assign(copyDeviceList[currIndex], {
                realX: startCoord.x,
                realY: startCoord.y,
                realWidth: leftCoordX - startCoord.x,
                realHeight: bottomCoord - startCoord.y,
                width: `${(leftCoordX - startCoord.x) / state.everyPxByVal}px`,
                height: `${(bottomCoord - startCoord.y) / state.everyPxByVal}px`,
                left: `${startCoord.x / state.everyPxByVal}px`,
                top: `${startCoord.y / state.everyPxByVal}px`
              })
              resolve(res)
            })
            break
          }
          case WINDOW_OPERATION.resizeAllInputWindow: {
            const sendDataList = []
            currGroupDeviceList.forEach((item, i) => {
              const deviceListIndex = copyDeviceList.findIndex(list => list.id === item.id)
              const startCoord = {
                x: getWindowXy(item.realX, oneRealMinWindowWidth, maxWidth),
                y: getWindowXy(item.realY, oneRealMinWindowHeight, maxHeight)
              }
              sendDataList.push({
                guihead: 'resizeWindow',
                groupIdx: item.groupIdx,
                windowIdx: item.id,
                layerIdx: item.zIndex,
                width: oneRealMinWindowWidth,
                height: oneRealMinWindowHeight,
                topLeft_X: startCoord.x,
                topLeft_Y: startCoord.y
              })
              Object.assign(copyDeviceList[deviceListIndex], {
                realX: startCoord.x,
                realY: startCoord.y,
                realWidth: oneRealMinWindowWidth,
                realHeight: oneRealMinWindowHeight,
                width: `${oneRealMinWindowWidth / state.everyPxByVal}px`,
                height: `${oneRealMinWindowHeight / state.everyPxByVal}px`,
                left: `${startCoord.x / state.everyPxByVal}px`,
                top: `${startCoord.y / state.everyPxByVal}px`
              })
            })
            Vue.prototype.$loopRequest(sendDataList).then(res => {
              resolve(res)
            })
            break
          }
          case WINDOW_OPERATION.closeSignal: { // 关闭信号源
            const sendData = {
              guihead: 'windowSourceSwitch',
              groupIdx,
              windowIdx: id,
              signalEnable: 0,
              videoSrcCh: 0,
              audioSrcCh: 0
            }
            Vue.prototype.$request(sendData).then(res => {
              copyDeviceList[currIndex]['signalEnable'] = 0
              copyDeviceList[currIndex]['videoSrcCh'] = 0
              copyDeviceList[currIndex]['audioSrcCh'] = 0
              resolve(res)
            })
            break
          }
          case WINDOW_OPERATION.closeAllSignal: { // 关闭所有信号源
            const sendDataList = []
            currGroupDeviceList.forEach(item => {
              const deviceListIndex = copyDeviceList.findIndex(list => list.id === item.id)
              const signalSetting = {
                signalEnable: 0,
                videoSrcCh: 0,
                audioSrcCh: 0
              }
              sendDataList.push(Object.assign({
                guihead: 'windowSourceSwitch',
                groupIdx,
                windowIdx: item.id
              }, signalSetting))
              Object.assign(copyDeviceList[deviceListIndex], signalSetting)
            })
            Vue.prototype.$loopRequest(sendDataList).then(res => {
              resolve(res)
            })
            break
          }
          default: {
            break
          }
        }
      }).then(() => {
        commit(types.SET_DEVICE_LIST, {
          type: 'set',
          value: copyDeviceList
        })
      })
    }
  }
}

export default Device
