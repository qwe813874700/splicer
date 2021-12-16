import * as types from '../modules-types'

const PopWindow = {
  state: {
    currOpenWindow: null,
    currSettingObj: null
  },
  getters: {
    currOpenWindow: state => state.currOpenWindow,
    currSettingObj: state => state.currSettingObj
  },
  mutations: {
    [types.SET_CURR_WINDOW]: (state, data) => {
      state.currOpenWindow = data
    },
    [types.SET_CURR_DEVICE_PRO]: (state, data) => {
      state.currSettingObj = data
    }
  },
  actions: {
    setCurrOpenWindow ({ commit }, data) {
      commit(types.SET_CURR_WINDOW, data)
    },
    setProDevice ({ commit }, data) {
      commit(types.SET_CURR_DEVICE_PRO, data)
    }
  }
}

export default PopWindow
