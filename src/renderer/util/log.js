import fs from 'fs'
import { LOG_TYPE_LIST } from '@/util/global'
import store from '../store'
export const createLog = (name) => {
  return new Promise((resolve, reject) => {
    const data = formatLogString('创建Log文件')
    fs.writeFile(name, data, 'utf8', (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
export const appendLogContent = (content, type) => {
  fs.appendFileSync(store.getters.logName, formatLogString(content, type))
}

const formatLogString = (str, type = LOG_TYPE_LIST.CREATEA_CODE) => {
  const typeObj = {
    type_0: '创建',
    type_1: '发送',
    type_2: '接收',
    type_3: '操作'
  }
  return `[${new Date().toLocaleString()}]  ${[typeObj[`type_${type}`]]} -> ${str}\r`
}
