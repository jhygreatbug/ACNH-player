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
      (v, i) => getTime(i)
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
    }
  },
  methods: {
    reset() {
      this.audioStatus.hours = getCurrentHours()
      this.audioStatus.weather = this.currentWeather
    },
    handleAudioReady($audio) {
      this.$audio = $audio
      this.$audio.play()
      setTimeout(() => {
        const hours = getCurrentHours()
        if (this.playMode === 'simulate' && hours !== this.audioStatus.hours) {
          this.audioStatus.hours = hours
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
