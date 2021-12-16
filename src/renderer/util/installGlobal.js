import request, { loopReuqest } from '../api/request/request'
import * as allUtil from './util'
import { appendLogContent } from './log'
import { LOG_TYPE_LIST } from './global'
// 新增一些全局方法和变量 方便维护!
const globalObject = {
  install (Vue, options) {
    Vue.prototype.$request = request // 全局请求方法
    Vue.prototype.$loopRequest = loopReuqest // 给一个请求列表 返回一个promise.resolove
    Vue.prototype.$myMessage = allUtil.message // message方法
    Vue.prototype.$ERR_CODE = 1 // 错误状态码
    Vue.prototype.$SUCC_CODE = 0 // 成功状态码
    Vue.prototype.$util = allUtil
    Vue.prototype.$writeLog = appendLogContent
    Vue.prototype.$logType = LOG_TYPE_LIST
  }
}
export default globalObject
