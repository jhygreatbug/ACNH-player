declare type TWeather = 'sunny' | 'rainy' | 'snowy'

declare type TWeatherCache = { [key: string]: TWeather }

declare type TWeatherMap = {
  CLEAR_DAY: 'sunny'
  CLEAR_NIGHT: 'sunny'
  PARTLY_CLOUDY_DAY: 'sunny'
  PARTLY_CLOUDY_NIGHT: 'sunny'
  CLOUDY: 'sunny'
  LIGHT_HAZE: 'sunny'
  MODERATE_HAZE: 'sunny'
  HEAVY_HAZE: 'sunny'
  LIGHT_RAIN: 'rainy'
  MODERATE_RAIN: 'rainy'
  HEAVY_RAIN: 'rainy'
  STORM_RAIN: 'rainy'
  FOG: 'sunny'
  LIGHT_SNOW: 'snowy'
  MODERATE_SNOW: 'snowy'
  HEAVY_SNOW: 'snowy'
  STORM_SNOW: 'snowy'
  DUST: 'sunny'
  SAND: 'sunny'
  WIND: 'sunny'
}

declare type TLocationApiPoint = {
  x: number
  y: number
}

declare type TLocationApi = {
  status: number
  content?: {
    point?: TLocationApiPoint
  }
}

declare type TWeatherApi = {
  status: string
  error: string
  result?: {
    hourly?: {
      status: string
      error: string
      skycon?: {
        datetime: string
        value: keyof TWeatherMap
      }[]
    }
  }
}
