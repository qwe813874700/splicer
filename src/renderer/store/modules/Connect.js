import * as types from '../modules-types'

const Connect = {
  state: {
    typeObj: null,
    logName: ''
  },
  getters: {
    typeObj: state => state.typeObj,
    logName: state => state.logName
  },
  mutations: {
    [types.SET_TYPE_OBJ]: (state, data) => {
      state.typeObj = data
    },
    [types.SET_LOG_NAME]: (state, data) => {
      state.logName = data
    }
  },
  actions: {
    setTypeObj ({ commit }, data) {
      commit(types.SET_TYPE_OBJ, data)
    },
    setLogName ({ commit }, data) {
      commit(types.SET_LOG_NAME, data)
    }
  }
}

export default Connect
