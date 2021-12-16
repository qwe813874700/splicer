import store from '../../store'
import { Socket } from 'net'
import { isJSON, message } from '@/util/util'
import { StringDecoder } from 'string_decoder'
import { ipcRenderer, remote } from 'electron'
import { CONNECT_TYPE_IP, CONNECT_TYPE_COM, LOG_TYPE_LIST } from '../../util/global'
import { appendLogContent } from '@/util/log'
const { ipcMain } = remote
const listeningKey = 'sendData'
const decoder = new StringDecoder('utf8')

function createTcpConnect (host, port = 8000, sendData, isSendReply = true) {
  return new Promise((resolve, reject) => {
    const socket = new Socket()
    socket.connect({
      host,
      port
    })
    socket.write(sendData)
    const timeout = setTimeout(() => {
      socket.destroy()
    }, 5000)
    if (sendData.includes('reboot!') || !isSendReply) {
      socket.destroy()
      clearTimeout(timeout)
      resolve()
    }
    socket.on('data', (resData) => {
      const decoderRes = decoder.write(resData)
      if (isJSON(decoderRes)) {
        clearTimeout(timeout)
        socket.destroy()
        resolve(JSON.parse(decoderRes))
      }
    })
    socket.on('error', (err) => {
      reject(err)
    })
  })
}
function createSerialConnect (sendData, isSendReply = true) {
  return new Promise((resolve, reject) => {
    const serialPort = store.getters.typeObj.obj
    serialPort.write(sendData)
    if (sendData.includes('reboot') || !isSendReply) {
      return resolve()
    } else {
      const guihead = JSON.parse(sendData).guihead
      const timeout = setTimeout(() => {
        ipcRenderer.removeAllListeners(guihead)
      }, 5000)
      ipcRenderer.on(guihead, (e, resData) => {
        if (resData.guihead === guihead) {
          clearTimeout(timeout)
          ipcRenderer.removeAllListeners(guihead)
          resolve(resData)
        }
      })
    }
  })
}
function writeLog (data, type) {
  appendLogContent(JSON.stringify(data), type)
}
function createIpcMainListening (data, isSendReply = true) {
  return new Promise((resolve, reject) => {
    ipcMain.on(listeningKey, (e, resData) => {
      console.log('sendData', resData)
      if (store.getters.typeObj.type === CONNECT_TYPE_IP) {
        createTcpConnect(store.getters.typeObj.obj.address, 8000, resData, isSendReply).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      } else if (store.getters.typeObj.type === CONNECT_TYPE_COM) {
        createSerialConnect(resData, isSendReply).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      }
    })
    const sendData = typeof data === 'string' ? data : `${JSON.stringify(data)}\r`
    ipcRenderer.send(listeningKey, sendData)
  })
}
function removeListening () {
  ipcMain.removeAllListeners(listeningKey)
}

export function loopReuqest (sendList, timeout = 0) {
  return new Promise((resolve, reject) => {
    const sendData = (list, start = 0, result = []) => {
      request(list[start]).then(res => {
        const concatResult = result.concat([res])
        if (start < list.length - 1) {
          setTimeout(() => {
            sendData(list, ++start, concatResult)
          }, timeout)
        } else {
          resolve(concatResult)
        }
      }).catch(err => {
        reject(err)
      })
    }
    sendData(sendList)
  })
}

export default function request (data, isSendReply = true) {
  return new Promise((resolve, reject) => {
    writeLog(data, LOG_TYPE_LIST.SEND_CODE)
    createIpcMainListening(data, isSendReply).then((res) => {
      console.log('resData', res)
      writeLog(res, LOG_TYPE_LIST.RECEIVE_CODE)
      removeListening()
      resolve(res)
    }).catch(err => {
      reject(err)
      removeListening()
    })
  })
}
