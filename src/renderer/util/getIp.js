// 验证IP的正则
const ipReg = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

// 验证子网掩码的正则
// let mask_reg = /^(254|252|248|240|224|192|128|0)\.0\.0\.0|255\.(254|252|248|240|224|192|128|0)\.0\.0|255\.255\.(254|252|248|240|224|192|128|0)\.0|255\.255\.255\.(254|252|248|240|224|192|128|0)$/

/**
 *  把IP地址转换成二进制格式
 *  @param string   ip    待转换的IP的地址
 */
function ipToBinary (ip) {
  if (ipReg.test(ip)) {
    let ipStr = ''
    let ipArr = ip.split('.')

    for (let i = 0; i < 4; i++) {
      let currNum = ipArr[i]
      let numberBin = parseInt(currNum)
      numberBin = numberBin.toString(2)
      let count = 8 - numberBin.length
      for (let j = 0; j < count; j++) {
        numberBin = '0' + numberBin
      }
      ipStr += numberBin
    }
    return ipStr
  }

  return ''
}

/**
 *  把二进制格式转换成IP地址
 *  @param {string} binary 待转换的二进制
 */
function binaryToIp (binary) {
  if (binary.length === 32) {
    let a = parseInt(binary.substr(0, 8), 2)
    let b = parseInt(binary.substr(8, 8), 2)
    let c = parseInt(binary.substr(16, 8), 2)
    let d = parseInt(binary.slice(-8), 2)

    return a + '.' + b + '.' + c + '.' + d
  }

  return ''
}

/**
 *  根据子网掩码和网关计算网络地址和广播地址
 *  @param  string    mask    子网掩码
 *  @param  string    gateway 网关
 *  @param  string    ip ip地址
 */
export function getNetworkBroadcastAddr (mask, ip) {
  let networkBroadcast = {}
  let networkAddr = ''

  let maskArr = mask.split('.')
  let ipArr = ip.split('.')
  // 计算IP的网络地址 与(&)运算
  for (let i = 0; i < 4; i++) {
    let number1 = parseInt(maskArr[i])
    let number2 = parseInt(ipArr[i])
    networkAddr += number1 & number2

    if (i < 3) {
      networkAddr += '.'
    }
  }
  networkBroadcast.networkAddr = networkAddr
  // 计算广播地址
  // 子掩码后面有几个0，就去掉IP地址后几位再补1
  let maskBinary = ipToBinary(mask)
  let gatewayBinary = ipToBinary(ip)

  let maskZero = maskBinary.split(0).length - 1
  let oneNumber = new Array(maskZero + 1).join('1') // IP地址后位补1
  let gatewayHouWeiBuYi = gatewayBinary.slice(0, -maskZero) + oneNumber

  networkBroadcast.broadcast = binaryToIp(gatewayHouWeiBuYi)
  return networkBroadcast
}

// 全排列组合算法（两两递归组合）
function doExchange (doubleArrays) {
  let len = doubleArrays.length
  if (len >= 2) {
    let len1 = doubleArrays[0].length
    let len2 = doubleArrays[1].length
    let newlen = len1 * len2
    let temp = new Array(newlen)
    let index = 0
    for (let i = 0; i < len1; i++) {
      for (let j = 0; j < len2; j++) {
        temp[index] = doubleArrays[0][i] + '.' + doubleArrays[1][j]
        index++
      }
    }

    let newArray = new Array(len - 1)
    for (let i = 2; i < len; i++) {
      newArray[i - 1] = doubleArrays[i]
    }
    newArray[0] = temp

    return doExchange(newArray)
  }
  return doubleArrays[0]
}

/**
 *  获取由网络地址和广播址组成的所有IP组合
 *  @param string networkAddr 网络地址
 *  @param string broadcastAddr 广播地址
 *  @param string gateway 网关
 */
export function returnIp (networkAddr, broadcastAddr, gateway) {
  let range = []
  let start = networkAddr.split('.')
  let end = broadcastAddr.split('.')

  // range格式为[[192], [168], [0,1,2...254], [0,1,2...254]]
  for (let i = 0; i < 4; i++) {
    if (start[i] === end[i]) {
      range[i] = [start[i]]
    } else {
      let min = Math.min(start[i], end[i])
      let max = Math.max(start[i], end[i])
      let temp = []
      if (i === 3) min = 0 // 从200起计
      for (let j = min; j <= max; j++) {
        temp.push(j)
      }
      range[i] = temp
    }
  }

  let ipList = doExchange(range)
  ipList.shift() // 去掉网络地址
  ipList.pop() // 去掉广播地址
  let gatewayIndex = -1

  // 去掉网关
  for (let k = 0; k < ipList.length; k++) {
    if (ipList[k] === gateway) {
      gatewayIndex = k
      break
    }
  }
  if (gatewayIndex > -1) {
    ipList.splice(gatewayIndex, 1)
  }

  return ipList
}
