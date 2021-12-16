'use strict'

import { app, BrowserWindow, ipcMain, Menu, Tray, dialog } from 'electron'
import '../renderer/store'
import Store from 'electron-store'
Store.initRenderer()
const path = require('path')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  Menu.setApplicationMenu(null)

  mainWindow = new BrowserWindow({
    useContentSize: true,
    minWidth: 1200,
    minHeight: 720,
    title: '拼接上位机',
    show: false,
    enableRemoteModule: true
  })

  mainWindow.maximize()
  mainWindow.show()
  mainWindow.loadURL(`${winURL}`)
  mainWindow.webContents.openDevTools()
  createConectChildCWindow()
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  // 当我们点击关闭时触发close事件，我们按照之前的思路在关闭时，隐藏窗口，隐藏任务栏窗口
  // event.preventDefault() // 禁止关闭行为(非常必要，因为我们并不是想要关闭窗口，所以需要禁止默认行为)
  // const tray = new Tray(path.join(__dirname, 'icon.ico'))

  // mainWindow.on('close', (event) => {
  //   mainWindow.hide()
  //   mainWindow.setSkipTaskbar(true)
  //   event.preventDefault()
  // })
  // mainWindow.on('show', () => {
  //   tray.setHighlightMode('always')
  // })
  // mainWindow.on('hide', () => {
  //   tray.setHighlightMode('never')
  // })
  // // 创建系统通知区菜单
  // const contextMenu = Menu.buildFromTemplate([
  //   {
  //     label: '退出',
  //     click: () => {
  //       mainWindow.destroy()
  //     }
  //   } // 我们需要在这里有一个真正的退出（这里直接强制退出）
  // ])
  // tray.setToolTip('拼接上位机')
  // tray.setContextMenu(contextMenu)
  // tray.on('click', () => { // 我们这里模拟桌面程序点击通知区图标实现打开关闭应用的功能
  //   mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  //   mainWindow.isVisible() ? mainWindow.setSkipTaskbar(false) : mainWindow.setSkipTaskbar(true)
  // })
  // ipcMain.on('controlApp', (e, data) => {
  //   if (data === 'min') {
  //     mainWindow.hide()
  //     mainWindow.setSkipTaskbar(true)
  //   } else if (data === 'quit') {
  //     mainWindow.destroy()
  //     mainWindow.setSkipTaskbar(false)
  //   }
  // })
}

let loginWindow
function createLogin () {
  loginWindow = new BrowserWindow({
    frame: false,
    width: 375,
    height: 550,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    },
    enableRemoteModule: true
  })
  loginWindow.loadURL(`${winURL}#/login`)
}

let conectWindow
function createConectWindow () {
  Menu.setApplicationMenu(null)
  conectWindow = new BrowserWindow({
    width: 812,
    height: 670,
    resizable: false,
    enableRemoteModule: true
  })
  conectWindow.loadURL(`${winURL}#/connect`)
}

let conectChildWindow
function createConectChildCWindow () {
  Menu.setApplicationMenu(null)
  conectChildWindow = new BrowserWindow({
    width: 812,
    height: 670,
    resizable: false,
    enableRemoteModule: true,
    parent: mainWindow,
    modal: true,
    show: false
  })
  conectChildWindow.on('close', (event) => {
    conectChildWindow.hide()
    event.preventDefault()
  })
  conectChildWindow.loadURL(`${winURL}#/connect`)
}
// let popWindow
// function openPopWindow (options) {
//   popWindow = new BrowserWindow({
//     width: options.width,
//     height: options.height,
//     parent: mainWindow, // win是主窗口
//     shadow: true,
//     minimizable: false,
//     maximizable: false,
//     resizable: false,
//     modal: true,
//     title: options.title,
//     // frame:false,
//     webPreferences: {
//       nodeIntegration: true
//     }
//   })
//   popWindow.loadURL(winURL + '#/popwindow')
//   popWindow.on('closed', () => {
//     popWindow = null
//   })
// }

// ipcMain.on('openPopWindow', (e, data) => {
//   openPopWindow(data)
// })
ipcMain.on('openDialog', (e, data) => {
  dialog[data.methods](mainWindow, data.obj, (path) => {
    e.sender.send('getPath', path)
  })
})
ipcMain.on('openConnectChild', (e) => {
  conectChildWindow && conectChildWindow.show(true)
})
ipcMain.on('closeConnectChild', (e) => {
  conectChildWindow && conectChildWindow.hide()
})
ipcMain.on('setMinWindow', (e, data) => {
  mainWindow.setResizable(!data)
})

ipcMain.on('closeLoginWindow', e =>
  loginWindow.close()
)

ipcMain.on('shrinkLoginWindow', e =>
  loginWindow.minimize()
)

ipcMain.on('openMainWindow', e =>
  createConectWindow()
)

ipcMain.on('confirmSendType', (e, data) => {
  if (!mainWindow) {
    createWindow()
  }
  conectWindow && conectWindow.close()
  conectWindow = null
})

app.on('ready', () => {
  if (process.env.NODE_ENV !== 'production') {
    require('vue-devtools').install()
  }
  // createLogin()
  // createWindow()
  createConectWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createLogin()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
