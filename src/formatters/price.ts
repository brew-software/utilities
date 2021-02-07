export default function price(price: number, currency = "$") {
  return `${currency}${price.toFixed(2)}`;
}
