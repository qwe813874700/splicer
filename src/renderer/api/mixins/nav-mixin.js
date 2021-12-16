import { mapActions } from 'vuex'
import { ipcRenderer } from 'electron'

export const navMixin = {
  methods: {
    ...mapActions(['setCurrOpenWindow']),
    openMethods (methods, id, e) {
      if (e && e.currentTarget.getAttribute('disabled')) {
        return false
      }
      methods && this[methods](id)
    },
    createNewWindow (id) {
      this.setCurrOpenWindow(id)
    },
    sendCommand (com) {
      ipcRenderer.send('controlApp', com)
    },
    setResult (methods) {
      return methods ? this[methods]() : false
    }
  }
}
