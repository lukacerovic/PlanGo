export const formatDate = (isoString) => {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat("sr-RS", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date)
  }

export const formatTime = (dateString) => {
  const date = new Date(dateString)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`
}

export const formatDateToISO = (date) => {
  const isoString = date.toISOString();
  const formattedDate = isoString.split('.')[0] + '.' + isoString.split('.')[1].padEnd(6, '0') + "+00:00";
  return formattedDate;
}