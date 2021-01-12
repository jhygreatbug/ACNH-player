<template>
  <div class="wrap">
    <template v-if="status === 'ready'">
      <my-audio
        ref="audio"
        v-bind="audioStatus"
        @ready="handleAudioReady"
      ></my-audio>
      <br />
      <select
        name="hours"
        v-model="audioStatus.hours"
        :disabled="inputPlayMode"
        @change="handleHoursChange"
      >
        <option
          v-for="item in selectHoursOptions"
          :key="item.value"
          :value="item.value"
        >
          {{ item.hours }}：00 {{ item.isAm ? 'a.m.' : 'p.m.' }}
        </option>
      </select>
      <select
        name="weather"
        v-model="audioStatus.weather"
        :disabled="inputPlayMode"
        @change="handleWeatherChange"
      >
        <option value="sunny">Sunny</option>
        <option value="rainy">Rainy</option>
        <option value="snowy">Snowy</option>
      </select>
      <label>
        <input
          type="checkbox"
          name="simulate"
          v-model="inputPlayMode"
          @change="handlePlayModeChange"
        />模拟播放
      </label>
      <a
        class="feedback"
        href="https://jhygreatbug.github.io/2021/01/12/%E4%B8%8D%E5%BF%85%E6%89%93%E5%BC%80%E6%B8%B8%E6%88%8F%EF%BC%8C%E5%B0%B1%E8%83%BD%E6%92%AD%E6%94%BE%E5%8A%A8%E6%A3%AE%E7%9A%84%E8%83%8C%E6%99%AF%E9%9F%B3%E4%B9%90%E2%80%94%E2%80%94%E3%80%8A%E9%9B%86%E5%90%88%E5%95%A6%EF%BC%81%E5%8A%A8%E7%89%A9%E6%A3%AE%E5%8F%8B%E4%BC%9A%E3%80%8B%E6%92%AD%E6%94%BE%E5%99%A8/#valine-comments"
        target="_blank"
        title="通向一个网站：https://jhygreatbug.github.io/"
      >
        <icon-feedback />反馈
      </a>
    </template>
    <template v-else-if="status === 'loading'">
      <div>loading...</div>
    </template>
    <template v-else-if="status === 'prepare'">
      1. 打开 网易云音乐|QQ音乐|酷我音乐|... ，搜索专辑“あつまれ どうぶつの森
      オリジナルサウンドトラック”，下载全部专辑
      <br />
      2. 等待下载完毕，然后手动选择下载资源所在目录
      <br />
      <input
        type="file"
        @change="handleBasePathChange"
        webkitdirectory
        multiple
      />
    </template>
  </div>
</template>

<script lang="ts">
import jsonp from 'jsonp'
import { Component } from 'vue'
import { Options, Vue } from 'vue-class-component'
import MyAudio from '@/components/MyAudio.vue'
import IconFeedback from '@/components/IconFeedback.vue'
import { transformTime24To12 } from '@/common'
import { weatherMap } from '@/const'

const { ipcRenderer } = window

const pad0 = (v: number) => `${v}`.padStart(2, '0')

function dateToHourlyString(d: Date) {
  const date = `${d.getFullYear()}-${pad0(d.getMonth())}-${pad0(d.getDate())}`
  const time = `${pad0(d.getHours())}:00`
  return `${date} ${time}`
}

function getCurrentHours() {
  return new Date().getHours()
}

function requestGeo() {
  return new Promise<TLocationApiPoint>((resolve) => {
    jsonp(
      'https://api.map.baidu.com/location/ip?ak=kf5mCAHrpjyC9ZB1T9IatxcmpYBqF7nD&coor=bd09ll',
      {},
      (err: Error | null, res: TLocationApi) => {
        if (err) {
          throw err
        }
        if (res.status !== 0 || !res.content?.point) {
          // todo: 具体的错误信息
          throw new Error(`${res.status}`)
        }
        resolve(res.content.point)
      },
    )
    // fetch(
    //   'https://api.map.baidu.com/location/ip?ak=kf5mCAHrpjyC9ZB1T9IatxcmpYBqF7nD&coor=bd09ll',
    // )
    //   .then((response) => {
    //     if (!response.ok) {
    //       throw Error(response.statusText)
    //     }
    //     const res = response.json()
    //     return res
    //   })
    //   .then((res: TLocationApi) => {
    //     if (res.status !== 0 || !res.content?.point) {
    //       // todo: 具体的错误信息
    //       throw new Error(`${res.status}`)
    //     }
    //     resolve(res.content.point)
    //   })
    //   .catch(reject)
  })
}

function requestWeather(coords: TLocationApiPoint) {
  return new Promise<TWeatherCache>((resolve) => {
    jsonp(
      `https://api.caiyunapp.com/v2.5/NrwTfgL23ti6WwW3/${coords.x},${coords.y}/hourly.json?hourlysteps=6`,
      {},
      (err: Error | null, res: TWeatherApi) => {
        if (err) {
          throw err
        }
        if (res.status !== 'ok') {
          throw Error(res.error)
        }

        if (!res.result?.hourly) {
          throw Error()
        }

        const { hourly } = res.result
        if (hourly.status !== 'ok') {
          throw Error(res.error)
        }

        if (!Array.isArray(hourly.skycon)) {
          throw Error()
        }

        const weathers: TWeatherCache = {}
        hourly.skycon.forEach(({ datetime, value }) => {
          const date = new Date(datetime)
          const dateStr = dateToHourlyString(date)
          weathers[dateStr] = weatherMap[value]
        })

        resolve(weathers)
      },
    )
  }).catch((e) => {
    console.warn(e)
    return {}
  })
}

function getWeathers() {
  return new Promise<TWeatherCache>((resolve) => {
    requestGeo()
      .then((coords) => {
        requestWeather(coords).then((res) => resolve(res))
      })
      .catch((e) => {
        console.warn('get weather failed', e)
        resolve({})
        // todo: 通知方式
      })
  })
}

@Options({
  components: {
    MyAudio,
    IconFeedback,
  },
  data() {
    const selectHoursOptions = Array.from({ length: 24 }, (v, i) => ({
      value: i,
      ...transformTime24To12(i),
    }))
    return {
      selectHoursOptions,
      status: 'prepare',
      ready: false,

      weatherCache: {} as {},
      currentWeather: 'sunny',

      $audio: null,
      audioStatus: {
        basePath: '',
        hours: getCurrentHours(),
        weather: 'sunny',
        files: null,
      },
      inputPlayMode: true,
    }
  },
  computed: {
    playMode() {
      return this.inputPlayMode ? 'simulate' : 'custom'
    },
  },
  async created() {
    this.updateWeather()

    const basePath = await ipcRenderer.invoke('get-config', 'audioBasePath')
    if (basePath) {
      this.checkAndUpdatePath(basePath)
    }
  },
  methods: {
    async checkAndUpdatePath(basePath: string) {
      const result = await ipcRenderer.invoke('check-and-get-audio-files', basePath)
      if (!result) {
        console.warn('check file failed')
        this.status = 'prepare'
        return
      }

      ipcRenderer.invoke('set-config', 'audioBasePath', basePath)
      this.audioStatus.basePath = basePath
      this.audioStatus.files = result
      this.status = 'ready'
    },
    updateWeather() {
      const hourlyStr = dateToHourlyString(new Date())
      const update = (refWeatherCache: TWeatherCache, refHourlyStr: string) => {
        const weather = refWeatherCache[refHourlyStr] || 'sunny'
        this.currentWeather = weather
        this.audioStatus.weather = weather
      }

      if (hourlyStr in this.weatherCache) {
        update(this.weatherCache, hourlyStr)
        return
      }

      getWeathers().then((weathers) => {
        this.weatherCache = weathers
        update(this.weatherCache, hourlyStr)
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
    handleAudioReady($audio: Component) {
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
    handleBasePathChange({ target }: { target: HTMLInputElement }) {
      if (!target?.files) {
        return
      }
      const file = target.files[0]
      const basePath = file.path.slice(0, file.path.lastIndexOf(file.name))
      this.checkAndUpdatePath(basePath)
    },
  },
})
export default class App extends Vue { }
</script>

<style lang="scss">
html,
body {
  min-height: 100vh;
}

body {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
    Arial, sans-serif;
  text-align: center;
}

#app {
  padding: 1.5rem 2rem;
}

.feedback {
  color: #999;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}
</style>
