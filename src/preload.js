const { ipcRenderer } = require('electron')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

const config = {
  audioBasePath: ''
}

window.config = config

db.defaults(config)
  .write()

config.audioBasePath = db.get('audioBasePath').value()

window.searchFolder = () => {
  // 默认目录
  // 默认目录+歌手分类
  // 默认目录+歌手/专辑分类
}

window.checkFiles = path =>
  // todo: complete
  new Promise((resolve, reject) => {
    if (path) {
      resolve(path)
    } else {
      reject(path)
    }
  })

window.saveAudioBasePath = path => {
  config.audioBasePath = path
  db.set('audioBasePath', path)
    .write()
}
