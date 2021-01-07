// import Vue from './vue.esm.browser.js'

const weatherMap = {
  'CLEAR_DAY': 'sunny',
  'CLEAR_NIGHT': 'sunny',
  'PARTLY_CLOUDY_DAY': 'sunny',
  'PARTLY_CLOUDY_NIGHT': 'sunny',
  'CLOUDY': 'sunny',
  'LIGHT_HAZE': 'sunny',
  'MODERATE_HAZE': 'sunny',
  'HEAVY_HAZE': 'sunny',
  'LIGHT_RAIN': 'rainy',
  'MODERATE_RAIN': 'rainy',
  'HEAVY_RAIN': 'rainy',
  'STORM_RAIN': 'rainy',
  'FOG': 'sunny',
  'LIGHT_SNOW': 'snowy',
  'MODERATE_SNOW': 'snowy',
  'HEAVY_SNOW': 'snowy',
  'STORM_SNOW': 'snowy',
  'DUST': 'sunny',
  'SAND': 'sunny',
  'WIND': 'sunny',
}

const pad0 = v => `${v}`.padStart(2, 0)

const dateToHourlyString = d => `${d.getFullYear()}-${pad0(d.getMonth())}-${pad0(d.getDate())} ${pad0(d.getHours())}:00`

function getTime(hourRef) {
  const isAm = 1 <= hourRef && hourRef <= 12
  let hours = hourRef % 12
  if (hours === 0) {
    hours += 12
  }
  return {
    hours,
    isAm
  }
}

function getCurrentHours() {
  return new Date().getHours()
}

function requestGeo() {
  return new Promise((resolve, reject) => {
    fetch('https://api.map.baidu.com/location/ip?ak=kf5mCAHrpjyC9ZB1T9IatxcmpYBqF7nD&coor=bd09ll')
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        const res = response.json()
        return res
      })
      .then(res => {
        if (res.status !== 0 || !res.content || !res.content.point) {
          // todo: 具体的错误信息
          throw new Error(res.status)
        }
        resolve(res.content.point)
      })
      .catch(reject)
  })
}

function requestWeather(coords) {
  return fetch(`https://api.caiyunapp.com/v2.5/NrwTfgL23ti6WwW3/${coords.x},${coords.y}/hourly.json?hourlysteps=6`)
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText);
      }

      return response.json()
    })
    .then(res => {
      if (res.status !== 'ok') {
        throw Error(res.error);
      }

      const hourly = res.result ? res.result.hourly : {}
      if (hourly.status !== 'ok') {
        throw Error(res.error);
      }

      const weathers = {}
      hourly.skycon.forEach(({ datetime, value }) => {
        const date = new Date(datetime)
        const dateStr = dateToHourlyString(date)
        weathers[dateStr] = weatherMap[value]
      })

      return weathers
    })
    .catch(e => {
      console.log('weather error', e)
      return 'sunny'
    })
}

function getWeathers() {
  return new Promise(resolve => {
    requestGeo()
      .then(coords => {
        requestWeather(coords)
          .then(resolve)
      })
      .catch((e) => {
        console.log('failed', e)
        // todo: 更好的通知方式
        alert('获取位置信息失败')
      })
  })
}

const ComponentMyAudio = {
  props: {
    basePath: {
      type: String,
      required: true,
    },
    hours: {
      validator (value) {
        return 0 <= value && value < 24
      }
    },
    weather: {
      validator (value) {
        return ['sunny', 'rainy', 'snowy'].indexOf(value) !== -1
      }
    }
  },
  template: '<audio ref="audio" loop controls @ended="handleEnded"></audio>',
  data() {
    const fileNameMap = {}
    for (let i = 0; i < 24; i ++) {
      const { hours, isAm } = getTime(i)
      fileNameMap[`${i}-sunny`] = `Nintendo Sound Team - ${hours}：00 ${isAm ? 'a.m.' : 'p.m.'} (Sunny).flac`
      fileNameMap[`${i}-rainy`] = `Nintendo Sound Team - ${hours}：00 ${isAm ? 'a.m.' : 'p.m.'} (Rainy).flac`
      fileNameMap[`${i}-snowy`] = `Nintendo Sound Team - ${hours}：00 ${isAm ? 'a.m.' : 'p.m.'} (Snowy).flac`
    }
    return {
      fileNameMap,
      $audio: null,
    }
  },
  mounted() {
    this.$audio = this.$refs.audio
    this.$emit('ready', this)
  },
  computed: {
    calcHours() {
      return Math.floor(this.hours)
    },
    src() {
      return this.basePath + this.fileNameMap[`${this.calcHours}-${this.weather}`]
    }
  },
  watch: {
    hours() {
      this.$audio.src = this.src
      this.play()
    },
    weather() {
      const currentTime = this.$audio.currentTime
      this.$audio.src = this.src
      this.play()
      this.$audio.currentTime = currentTime
    },
    src() {
      this.$emit('change')
    },
  },
  methods: {
    getStatus() {
      return this.$audio.paused
    },
    play() {
      this.$audio.src = this.src
      this.$audio.play()
    },
    handleEnded() {
      this.$emit('ended')
    }
  },
}

new Vue({
  el: '#app',
  components: {
    'my-audio': ComponentMyAudio,
  },
  data() {
    const selectHoursOptions = Array.from(
      { length: 24 },
      (v, i) => ({
        value: i,
        ...getTime(i),
      })
    )
    return {
      selectHoursOptions,
      status: 'prepare',
      ready: false,

      weatherCache: {},
      currentWeather: 'sunny',

      $audio: null,
      audioStatus: {
        basePath: '',
        hours: getCurrentHours(),
        weather: 'sunny',
      },
      inputPlayMode: true,
    }
  },
  computed: {
    playMode() {
      return this.inputPlayMode ? 'simulate' : 'custom'
    },
  },
  created() {
    this.updateWeather()

    const basePath = window.config.audioBasePath
    if (basePath) {
      // todo: 如何抽取重复
      checkFiles(basePath)
        .then(() => {
          this.audioStatus.basePath = basePath
          saveAudioBasePath(basePath)
          this.status = 'ready'
        })
        .catch(e => {
          console.log('check file failed', e)
          this.status = 'prepare'
        })
    }
  },
  methods: {
    updateWeather() {
      const hourlyStr = dateToHourlyString(new Date())
      const _update = (_weatherCache, _hourlyStr) => {
        const weather = _weatherCache[_hourlyStr]
        if (!weather) {
          return
        }
        this.currentWeather = weather
        this.audioStatus.weather = weather
      }

      if (hourlyStr in this.weatherCache) {
        _update(this.weatherCache, hourlyStr)
        return
      }

      getWeathers().then(weathers => {
        this.weatherCache = weathers
        _update(this.weatherCache, hourlyStr)
      })
    },
    polling() {
      const hours = getCurrentHours()
      if (this.playMode === 'simulate') {
        const seconds = new Date().getSeconds()
        const minutes = new Date().getMinutes()
        if (seconds === 0 && minutes === 0) {
          // 整点更新天气
          this.updateWeather()
        }
        console.log(this.$audio, this.$audio.paused)
        if (hours !== this.audioStatus.hours && !this.$audio.getStatus()) {
          // 整点更新BGM
          this.audioStatus.hours = hours
        }
      }
    },
    reset() {
      this.audioStatus.hours = getCurrentHours()
      this.audioStatus.weather = this.currentWeather
    },
    handleAudioReady($audio) {
      this.$audio = $audio
      // 开始播放
      this.$audio.play()
      setInterval(() => {
        this.polling()
      }, 950)
    },
    handleHoursChange() {
      this.inputPlayMode = false
    },
    handleWeatherChange() {
      this.inputPlayMode = false
    },
    handleResetClick() {
      this.reset()
    },
    handlePlayModeChange() {
      if (this.playMode === 'simulate') {
        this.reset()
      }
    },
    handleBasePathChange(e) {
      const file = e.target.files[0]
      const basePath = file.path.slice(0, file.path.lastIndexOf(file.name))
      // todo: 如何抽取重复
      checkFiles(basePath)
        .then(() => {
          this.audioStatus.basePath = basePath
          saveAudioBasePath(basePath)
          this.status = 'ready'
        })
        .catch(e => {
          console.log('check file failed', e)
          this.status = 'prepare'
        })
    },
  },
})
