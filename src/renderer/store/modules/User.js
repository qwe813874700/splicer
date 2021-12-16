import * as types from '../modules-types'

const User = {
  state: {
    username: ''
  },
  getters: {
    username: state => state.username
  },
  mutations: {
    [types.SET_USERNAME]: (state, data) => {
      state.username = data
    }
  },
  actions: {
    setUsername ({ commit }, data) {
      commit(types.SET_USERNAME, data)
    }
  }
}

export default User
