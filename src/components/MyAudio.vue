<template>
  <audio ref="audio" loop controls @ended="handleEnded"></audio>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { getTime } from '@/common'

@Options({
  props: {
    basePath: {
      type: String,
      required: true,
    },
    hours: {
      validator(value: number) {
        return value >= 0 && value < 24
      },
    },
    weather: {
      validator(value: TWeather) {
        return ['sunny', 'rainy', 'snowy'].indexOf(value) !== -1
      },
    },
  },
  emits: ['ready', 'change', 'ended'],
  data() {
    const fileNameMap: { [key: string]: string } = {}
    for (let i = 0; i < 24; i++) {
      const { hours, isAm } = getTime(i)
      fileNameMap[`${i}-sunny`] = `Nintendo Sound Team - ${hours}：00 ${isAm ? 'a.m.' : 'p.m.'
      } (Sunny).flac`
      fileNameMap[`${i}-rainy`] = `Nintendo Sound Team - ${hours}：00 ${isAm ? 'a.m.' : 'p.m.'
      } (Rainy).flac`
      fileNameMap[`${i}-snowy`] = `Nintendo Sound Team - ${hours}：00 ${isAm ? 'a.m.' : 'p.m.'
      } (Snowy).flac`
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
      return (
        `local-audio://${this.basePath}${this.fileNameMap[`${this.calcHours}-${this.weather}`]}`
      )
    },
  },
  watch: {
    hours() {
      this.$audio.src = this.src
      this.play()
    },
    weather() {
      const { currentTime } = this.$audio
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
    },
  },
})
export default class HelloWorld extends Vue {
  msg!: string
}
</script>
