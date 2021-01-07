// eslint-disable-next-line import/prefer-default-export
export function getTime(hourRef: number) {
  const isAm = hourRef >= 1 && hourRef <= 12
  let hours = hourRef % 12
  if (hours === 0) {
    hours += 12
  }
  return {
    hours,
    isAm,
  }
}
