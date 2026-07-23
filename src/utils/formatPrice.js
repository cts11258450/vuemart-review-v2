export const formatPrice = (price) => {
  const numberPrice = Number(price)

  if (Number.isNaN(numberPrice)) {
    return "NT$ 0"
  }

  return `NT$ ${numberPrice.toLocaleString("zh-TW")}`
}