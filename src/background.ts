/* global __static */
/* eslint-disable import/no-extraneous-dependencies */
import {
  app, protocol, BrowserWindow, ipcMain, shell, Menu,
} from 'electron'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import Store from 'electron-store'
import { autoUpdater } from 'electron-updater'
import fs from 'fs'
import path from 'path'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import { transformTime12To24 } from './common'

const isDevelopment = process.env.NODE_ENV !== 'production'

if (isDevelopment) {
  console.log('userDataPath: ', app.getPath('userData'))
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'acnh', privileges: { secure: true, standard: true } },
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 400,
    height: 180,
    resizable: isDevelopment,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See
      //   nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration
      // for more info
      nodeIntegration: (process.env
        .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__static, 'icon.png'),
  })

  protocol.registerFileProtocol('local-audio', (request, callback) => {
    const url = request.url.replace(/^local-audio:\/\//, '')
    // Decode URL to prevent errors when loading filenames with UTF-8 chars or chars like "#"
    const decodedUrl = decodeURI(url) // Needed in case URL contains spaces
    if (!/.(?:ogg|flac|mp4|mp3|wav|webm)$/.test(url)) {
      return callback({ path: request.url })
    }
    try {
      // eslint-disable-next-line no-undef
      return callback(decodedUrl)
    } catch (error) {
      console.error(
        'ERROR: registerLocalVideoProtocol: Could not get file path:',
        error,
      )
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('acnh')
    // Load the index.html when not in development
    win.loadURL('acnh://./index.html')
    autoUpdater.checkForUpdatesAndNotify()
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// 所有链接用默认浏览器打开
app.on('web-contents-created', (e, webContents) => {
  webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })
})

// 取消默认菜单
Menu.setApplicationMenu(null)

const store = new Store()

ipcMain.handle('get-config', (event, name: string) => {
  const result = store.get(name)
  return result
})

ipcMain.handle('set-config', (event, name: string, value: string) => {
  store.set(name, value)
})

const matchWeatherReg = /sunny|rainy|snowy/i
const matchHoursReg = /([0-9]{1,2})(?:：|:|\/)\s?00/
const matchTimeReg = /(?:a\.m\.|p\.m\.)/i
// https://developer.mozilla.org/zh-CN/docs/Web/HTML/Supported_media_formats
const matchSuffixReg = /.(ogg|flac|mp4|mp3|wav|webm)$/i
const matchFile = (refPath: string) => {
  const [weather] = matchWeatherReg.exec(refPath) || []
  if (!weather) {
    return ''
  }

  const [, _hours] = matchHoursReg.exec(refPath) || []
  const hours = parseInt(_hours, 10)
  if (hours < 1 || hours > 12) {
    return ''
  }

  const [time] = matchTimeReg.exec(refPath) || []
  if (!time) {
    return ''
  }

  const [, suffix] = matchSuffixReg.exec(refPath) || []
  if (!suffix) {
    return ''
  }

  const trans24Hours = transformTime12To24(hours, time === 'a.m.')
  return `${trans24Hours}-${weather.toLowerCase()}`
}

ipcMain.handle('check-and-get-audio-files', async (event, audioPath: string) => {
  const fileNameMap: { [key: string]: string } = {}
  for (let i = 0; i < 24; i++) {
    fileNameMap[`${i}-sunny`] = ''
    fileNameMap[`${i}-rainy`] = ''
    fileNameMap[`${i}-snowy`] = ''
  }
  const result = await new Promise((resolve) => {
    fs.readdir(audioPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.warn(err)
        resolve(null)
        return
      }
      files.forEach((file) => {
        if (!file.isFile()) {
          return
        }
        const matchKey = matchFile(file.name)
        if (matchKey) {
          fileNameMap[matchKey] = file.name
        }
      })
      const notOk = Object.values(fileNameMap).some((v) => !v)
      if (notOk) {
        resolve(null)
      } else {
        resolve(fileNameMap)
      }
    })
  })
  return result
})
