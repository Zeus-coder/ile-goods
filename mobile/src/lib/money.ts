// Same rules as the website's lib/money.ts. Prices are stored in kobo.
export function formatNaira(kobo: number) {
  return "₦" + Math.round(kobo / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const FREE_SHIPPING_FROM_KOBO = 7_500_000;
