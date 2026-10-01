const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatNaira(kobo: number) {
  return naira.format(kobo / 100);
}

export const FREE_SHIPPING_FROM_KOBO = 7_500_000;
const SHIPPING_KOBO = 350_000;
const VAT_RATE = 0.075;

// Prices are VAT-inclusive; the VAT line shows how much of the subtotal is tax.
export function priceBreakdown(subtotalKobo: number) {
  const shipping = subtotalKobo === 0 || subtotalKobo >= FREE_SHIPPING_FROM_KOBO ? 0 : SHIPPING_KOBO;
  const vat = Math.round(subtotalKobo - subtotalKobo / (1 + VAT_RATE));
  return { subtotal: subtotalKobo, shipping, vat, total: subtotalKobo + shipping };
}
