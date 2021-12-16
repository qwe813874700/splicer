export const saveMixins = {
  methods: {
    allDataSave () {
      return new Promise((resolve) => {
        const sendDataList = [
          {
            guihead: 'delSplicingGroup',
            groupIdx: 0
          },
          {
            guihead: 'setSplicingSetting',
            physicalRow: this.physicalRow,
            physicalColumn: this.physicalRow,
            logicalRow: this.logicalRow,
            logicalColumn: this.logicalColumn,
            screenList: this.screenList
          },
          ...this.groupList.map(item => {
            return {
              guihead: 'addSplicingGroup',
              ...item
            }
          })
        ] // 初始化添加物理屏 逻辑屏设置和分组
        this.getDeviceList().then(res => {
          res.forEach(item => {
            sendDataList.push({
              guihead: 'createWindow',
              groupIdx: item.groupIdx,
              windowInfo: {
                windowIdx: item.id,
                layerIdx: item.zIndex,
                titleName: item.title,
                topLeft_X: item.realX,
                topLeft_Y: item.realY,
                width: item.realWidth,
                height: item.realHeight,
                signalEnable: item.signalEnable,
                videoSrcCh: item.videoSrcCh,
                audioSrcCh: item.audioSrcCh
              }
            })
          })
          resolve(sendDataList)
        })
      })
    }
  }
}
