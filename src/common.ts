export function transformTime24To12(hoursRef: number) {
  const isAm = hoursRef >= 1 && hoursRef <= 12
  let hours = hoursRef % 12
  if (hours === 0) {
    hours += 12
  }
  return {
    hours,
    isAm,
  }
}

export function transformTime12To24(hours: number, isAm: boolean) {
  if (!isAm && hours === 12) {
    return 0
  }
  if (isAm) {
    return hours
  }
  return hours === 12 ? 0 : hours + 12
}

export function searchFolder() {
  // 默认目录
  // 默认目录+歌手分类
  // 默认目录+歌手/专辑分类
  // 目录示例：
  // E:\CloudMusic
}
