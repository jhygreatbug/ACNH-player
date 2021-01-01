(document => {

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

const status = {
  hours: new Date().getHours(),
  weather: 'sunny'
}

const audio = (status => {
  const $audio = document.querySelector('#audio')
  const basePath = '/Users/chenjinying/Music/网易云音乐/'
  const fileNameMap = {}
  for (let i = 0; i < 24; i ++) {
    const { hours, isAm } = getTime(i)
    fileNameMap[`${i}-sunny`] = `Nintendo Sound Team - ${hours}：00 ${isAm ? 'a.m.' : 'p.m.'} (Sunny).flac`
    fileNameMap[`${i}-rainy`] = `Nintendo Sound Team - ${hours}：00 ${isAm ? 'a.m.' : 'p.m.'} (Rainy).flac`
    fileNameMap[`${i}-snowy`] = `Nintendo Sound Team - ${hours}：00 ${isAm ? 'a.m.' : 'p.m.'} (Snowy).flac`
  }
  return {
    play(time) {
      $audio.src = basePath + fileNameMap[`${status.hours}-${status.weather}`]
      $audio.play()
      if (time > 0) {
        $audio.currentTime = time
      }
    },
    changeWeather() {
      this.play($audio.currentTime)
    }
  }
})(status)

const $selectHours = document.querySelector('#select-hours')
const $selectWeather = document.querySelector('#select-weather')

// render
$selectHours.innerHTML = Array.from(
  { length: 24 },
  (v, i) => {
    const { hours, isAm } = getTime(i)
    return `<option value="${hours}">${hours}：00 ${isAm ? 'a.m.' : 'p.m.'}</option>`
  }
).join('')

// bind event
$selectHours.addEventListener('change', function () {
  status.hours = this.value
  audio.play()
})

$selectWeather.addEventListener('change', function () {
  status.weather = this.value
  audio.changeWeather()
})

// init
audio.play()
$selectHours.value = status.hours
$selectWeather.value = status.weather

})(document)
