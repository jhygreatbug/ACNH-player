const fs = require('fs');
const Store = require('electron-store');

const store = new Store();
window.config = {
  audioBasePath: store.get('audioBasePath')
}

window.searchFolder = () => {
  // 默认目录
  // 默认目录+歌手分类
  // 默认目录+歌手/专辑分类
  // 目录示例：
  // E:\CloudMusic
}


window.checkFiles = path =>
// todo: complete
  new Promise((resolve, reject) => {
    // const matchWeatherReg = /sunny|rainy|snowy/i
    // const matchHoursReg = /([0-9]{1,2})(?::|\/)00/
    // const matchTimeReg = /(?:a\.m\.|p\.m\.)/i
    // // https://developer.mozilla.org/zh-CN/docs/Web/HTML/Supported_media_formats
    // const matchSuffixReg = /.(ogg|flac|mp4|mp3|wav|webm)$/i
    // const matchFile = path => {
    //   const [weather] = matchWeatherReg.exec(path)
    //   if (!weather) {
    //     return null
    //   }

    //   const [_h, _hours] = matchHoursReg.exec(path)
    //   const hours = parseInt(_hours, 10)
    //   if (1 >= hours || hours >= 12) {
    //     return null
    //   }

    //   const [time] = matchTimeReg.exec(path)
    //   if (!time) {
    //     return null
    //   }

    //   const [_s, suffix] = matchSuffixReg.exec(path)
    //   if (!suffix) {
    //     return null
    //   }

    //   return `${hours}-${weather}`
    // }
    // fs.readdir(path,{ withFileTypes: true },(err,files)=>{
    //   if(err){
    //     reject(err)
    //     return
    //   }
    //   files.forEach((file)=>{
    //       var pathname=path.join(dir,file)
    //       fs.stat(pathname,(err,stats)=>{
    //           if(err){
    //               console.log(err)
    //           }else if(stats.isDirectory()){
    //               travel(pathname,callback)
    //           }else{
    //               callback(pathname)
    //           }
    //       })
    //   })
    // })
    if (path) {
      resolve(path)
    } else {
      reject(path)
    }
  })

window.saveAudioBasePath = path => {
  config.audioBasePath = path
  store.set('audioBasePath', path);
}
