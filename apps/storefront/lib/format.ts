/**
 * JMD currency formatter. Uses Intl.NumberFormat with the JMD currency code.
 * Spec: storefront prices are quoted in Jamaican Dollars.
 */
const JMD = new Intl.NumberFormat("en-JM", {
  style: "currency",
  currency: "JMD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatJmd = (cents: number): string => JMD.format(cents);

const ETA_FORMATTER = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export const formatEtaRange = (min: number, max: number): string =>
  `${min}–${max} min`;

export const formatRating = (r: number): string => r.toFixed(1);
