import Store from 'electron-store'
import { LOCAL_STORE_KEY } from '@/util/global'
export const sceneMixin = {
  data () {
    return {
      sceneList: [],
      store: new Store(),
      sceneStoreKey: LOCAL_STORE_KEY.scene,
      currentRow: {
        id: null,
        name: ''
      }
    }
  },
  created () {
    this._initSceneList()
  },
  methods: {
    _initSceneList () {
      this.sceneList = this.store.get(this.sceneStoreKey) ? JSON.parse(JSON.stringify(this.store.get(this.sceneStoreKey))) : []
    },
    saveStore () {
      this.store.set(this.sceneStoreKey, this.sceneList)
    },
    handleCurrentChange (row) {
      this.currentRow = JSON.parse(JSON.stringify(row))
    },
    async settingScene () {
      this.$writeLog(`恢复场景: ID: ${this.currentRow.id} 名称: ${this.currentRow.name}`, this.$logType.OPERATION_CODE)
      this.setLoadingStatus(true)
      const sendDataList = this.currentRow.sendDataList
      const res = await this.$loopRequest(sendDataList)
      const res2 = await this.getDeviceListAndgetGroupList()
      if (this.isCloseWindow) {
        this.setCurrOpenWindow(null)
      }
      this.$writeLog('恢复场景完成', this.$logType.OPERATION_CODE)
      this.setLoadingStatus(false)
    }
  }
}
