import Vue from './vue.esm.browser.js'

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

function requestWeather() {
  return fetch('http://example.com/movies.json')
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const res = response.json()
      // return res.weather
      return ['sunny', 'rainy', 'snowy'][Math.floor(Math.random() * 3)]
    })
    .catch(e => {
      console.log('weather error', e)
      return 'sunny'
    })
}

function requestGeo() {
  return new Promise((resolve, reject) => {
    // todo: google maps platform
    if (true) {
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
    } else {
      navigator.geolocation.getCurrentPosition(position => {
        resolve({
          x: position.coords.latitude,
          y: position.coords.longitude
        })
      }, (e) => {
        console.log('geolocation error', e)
        reject(e)
      }, {
        timeout: 10000
      });
    }
  })
}

const ComponentMyAudio = {
  props: {
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
      basePath: '/Users/chenjinying/Music/网易云音乐/',
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
    play() {
      this.$audio.src = this.src
      this.$audio.play()
    },
    handleEnded() {
      this.$emit('ended')
    }
  },
}

var vm = new Vue({
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
      $audio: null,
      currentWeather: 'sunny',
      audioStatus: {
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
  },
  methods: {
    updateWeather() {
      requestGeo()
        .then(coords => {
          console.log('coords', coords.x, coords.y)
          requestWeather(coords)
            .then(weather => {
              this.currentWeather = weather
              this.audioStatus.weather = weather
            })
        })
        .catch((e) => {
          console.log('failed', e)
          alert('获取位置信息失败')
        })
    },
    reset() {
      this.audioStatus.hours = getCurrentHours()
      this.audioStatus.weather = this.currentWeather
    },
    handleAudioReady($audio) {
      this.$audio = $audio
      this.$audio.play()
      setInterval(() => {
        const hours = getCurrentHours()
        if (this.playMode === 'simulate') {
          const seconds = new Date().getSeconds()
          const minutes = new Date().getMinutes()
          if (seconds === 0 && minutes === 0) {
            // 整点更新天气
            this.updateWeather()
          }
          if (hours !== this.audioStatus.hours) {
            // 整点更新BGM
            this.audioStatus.hours = hours
          }
        }
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
    }
  },
})
