/**
 * WhatsApp click-to-chat helper. Reads the support number from a public env var
 * so the live number can be swapped without code changes (DESIGN.md §9).
 */
const RAW_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+18760000000";

const sanitize = (n: string) => n.replace(/[^\d]/g, "");

export interface WhatsAppLinkOptions {
  message?: string;
}

export function whatsappLink(opts: WhatsAppLinkOptions = {}): string {
  const number = sanitize(RAW_NUMBER);
  const base = `https://wa.me/${number}`;
  if (!opts.message) return base;
  return `${base}?text=${encodeURIComponent(opts.message)}`;
}

export const SUPPORT_NUMBER_DISPLAY = RAW_NUMBER;
