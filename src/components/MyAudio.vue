<template>
  <audio ref="audio" loop controls @ended="handleEnded"></audio>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({
  props: {
    basePath: {
      type: String,
      required: true,
    },
    hours: {
      validator(value: number) {
        return value >= 0 && value < 24 && value === Math.floor(value)
      },
    },
    weather: {
      validator(value: TWeather) {
        return ['sunny', 'rainy', 'snowy'].indexOf(value) !== -1
      },
    },
    files: {
      type: Object,
    },
  },
  emits: ['ready', 'change', 'ended'],
  data() {
    return {
      $audio: null,
    }
  },
  mounted() {
    this.$audio = this.$refs.audio
    this.$emit('ready', this)
  },
  computed: {
    src() {
      return (
        `local-audio://${this.basePath}${this.files[`${this.hours}-${this.weather}`]}`
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
export default class MyAudio extends Vue {
  msg!: string
}
</script>
