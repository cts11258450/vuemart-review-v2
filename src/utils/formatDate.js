export const formatDate = (dateValue) => {
  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return "日期資料錯誤"
  }

  return new Intl.DateTimeFormat(
    "zh-TW",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  ).format(date)
}