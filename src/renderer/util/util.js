/**
 * @description 一些工具函数
 * @date 2021-11-8
 * @author ziming
 */
import { Notification } from 'element-ui'
import { UnicodeChr, AnsicodeChr } from './ANSI_UNICODE.JS'
import { ipcRenderer } from 'electron'

export function isJSON (str) {
  if (typeof str === 'string') {
    try {
      var obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
  return false
}

export function message (message, type = 'success', title = '提示') {
  return Notification({
    message,
    title,
    type
  })
}

export function getMinNumber (arr, type, startNumber) {
  if (arr.filter(item => item[type] === startNumber).length > 0) {
    return getMinNumber(arr, type, ++startNumber)
  } else {
    return startNumber
  }
}

export function strToAsciiArr (str) {
  return str.split('').map(item => item.charCodeAt())
}

export function strToHexArr (str) {
  return str.split(' ').map(item => parseInt(item, 16))
}

export function isHex (str) { // 判断字符串是否为16进制格式, 例: 00 11 FF CC
  for (let i = 0; i < str.split(' ').length; i++) {
    const element = str.split(' ')[i]
    if (!/^[0-9a-fA-F]{2}$/.test(element)) {
      return false
    }
  }
  return true
}

export function UnicodeToAnsiHexArr (chrCode) {
  let chrHex = chrCode.toString(16)
  chrHex = `000${chrHex.toUpperCase()}`
  chrHex = chrHex.substr(chrHex.length - 4)

  const i = UnicodeChr().indexOf(chrHex) // 用javascript实现Base64编码—解决中文问题
  if (i !== -1) {
    chrHex = AnsicodeChr().substr(i, 4)
  }
  const strArr = (str, arr = []) => {
    if (str.length === 0) {
      return arr
    } else {
      arr.push(str.substring(0, 2))
      return strArr(str.substring(2), arr)
    }
  }
  return strArr(chrHex)
}

export function strArrUnicodeToAnsiDecArr (str) {
  return strToAsciiArr(str).map(item => UnicodeToAnsiHexArr(item).map(list => parseInt(list, 16)))
}

/**
 * @description 根据everSize 坐标来寻找最适合当前坐标的值
 * @param { Number } start 起始坐标
 * @param { Number } erverSize 每一段坐标的值
 * @param { Number } maxNumber 最大值
 * @param { Boolean } isAdd 计算时, 是否要再加上一个erverSize的值
 * @returns {Number}
 */
export const getWindowXy = (start, erverSize, maxNumber, isAdd = false) => {
  if (start < erverSize) {
    return 0
  } else {
    return Math.min((parseInt(start / erverSize) * erverSize + (isAdd && start % erverSize !== 0 ? erverSize : 0)), maxNumber)
  }
}

export const openDialog = (methods, fileTypes) => {
  console.log(methods, fileTypes)
  return new Promise((resolve) => {
    ipcRenderer.send('openDialog', {
      methods,
      obj: {
        filters: [
          {
            name: fileTypes,
            extensions: [fileTypes]
          }
        ]
      }
    })
    ipcRenderer.on('getPath', (e, path) => {
      ipcRenderer.removeAllListeners('getPath')
      resolve(path)
    })
  })
}
