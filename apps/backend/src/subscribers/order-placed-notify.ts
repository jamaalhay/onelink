import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

const STOREFRONT_URL =
  process.env.STOREFRONT_URL ?? "https://storefront-dun-three.vercel.app";

// Real customer email or our placeholder? The checkout route synthesizes
// `<digits>@onelink.local` when the customer skips the optional email field —
// no point firing Resend at those.
function isRealEmail(email?: string | null): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  if (!e || !e.includes("@")) return false;
  if (e.endsWith("@onelink.local")) return false;
  return true;
}

interface OrderForNotify {
  id: string;
  display_id?: number | string | null;
  total?: number | null;
  subtotal?: number | null;
  shipping_total?: number | null;
  currency_code?: string | null;
  payment_status?: string | null;
  email?: string | null;
  shipping_address?: { phone?: string | null; address_1?: string | null; city?: string | null } | null;
  items?: { product_title?: string | null; variant_title?: string | null; quantity?: number | null; unit_price?: number | null; total?: number | null }[] | null;
  metadata?: Record<string, unknown> | null;
}

function fmtAmt(amount: number | null | undefined, currency: string): string {
  const v = amount ?? 0;
  return `${currency.toUpperCase()}$${v.toLocaleString()}`;
}

function renderEmailHtml(o: OrderForNotify, orderNumber: string, trackUrl: string): string {
  const currency = (o.currency_code ?? "JMD").toUpperCase();
  const cod = o.payment_status === "authorized";
  const items = o.items ?? [];
  const rows = items
    .map(
      (it) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;">
          <div style="font-weight:500;color:#111;">${escapeHtml(it.product_title ?? "Item")}</div>
          ${it.variant_title ? `<div style="color:#666;font-size:13px;">${escapeHtml(it.variant_title)}</div>` : ""}
          <div style="color:#888;font-size:13px;">Qty ${it.quantity ?? 1}</div>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;color:#111;">
          ${fmtAmt(it.total ?? (it.unit_price ?? 0) * (it.quantity ?? 1), currency)}
        </td>
      </tr>`
    )
    .join("");

  const addr = o.shipping_address?.address_1 ? `${o.shipping_address.address_1}${o.shipping_address.city ? `, ${o.shipping_address.city}` : ""}` : "";

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <tr><td>
      <h1 style="font-size:22px;font-weight:600;margin:0 0 4px;letter-spacing:-0.01em;">Order ${orderNumber} confirmed</h1>
      <p style="color:#666;margin:0 0 24px;">${cod ? "Pay the rider on delivery." : "We're getting your order ready."}</p>

      <table width="100%" cellspacing="0" cellpadding="0" style="background:#fff;border:1px solid #eee;border-radius:8px;padding:20px 20px 4px;">
        ${rows}
        <tr><td style="padding:14px 0 4px;color:#666;">Subtotal</td><td style="padding:14px 0 4px;text-align:right;color:#111;">${fmtAmt(o.subtotal, currency)}</td></tr>
        <tr><td style="padding:4px 0;color:#666;">Delivery</td><td style="padding:4px 0;text-align:right;color:#111;">${fmtAmt(o.shipping_total, currency)}</td></tr>
        <tr><td style="padding:8px 0 4px;font-weight:600;">Total</td><td style="padding:8px 0 4px;text-align:right;font-weight:600;">${fmtAmt(o.total, currency)}</td></tr>
      </table>

      ${addr ? `<p style="color:#666;margin:20px 0 0;font-size:14px;">Delivering to <span style="color:#111;">${escapeHtml(addr)}</span></p>` : ""}

      <p style="margin:28px 0 0;">
        <a href="${trackUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:11px 20px;border-radius:6px;font-weight:500;">Track your order</a>
      </p>

      <p style="margin:32px 0 0;color:#888;font-size:12px;">Onelink — premium delivery in Kingston.</p>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Send an SMS (always) and an email (when customer has a real email) when an
// order is placed. Triggered by Medusa's order.placed event. Provider mapping
// (sms → Twilio, email → Resend) lives in medusa-config.ts.
export default async function orderPlacedNotify({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = event.data.id;
  const logger = container.resolve("logger");

  let order: OrderForNotify;
  try {
    const orderModule = container.resolve(Modules.ORDER) as unknown as {
      retrieveOrder(id: string, config: { relations: string[] }): Promise<OrderForNotify>;
    };
    order = await orderModule.retrieveOrder(orderId, {
      relations: ["shipping_address", "items"],
    });
    // retrieveOrder may not return `metadata` depending on Medusa version, so
    // fetch it explicitly via Query for the WA opt-in branch.
    if (!order.metadata) {
      const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
        graph(args: { entity: string; fields: string[]; filters: Record<string, unknown> }): Promise<{ data: Array<{ metadata?: Record<string, unknown> }> }>;
      };
      const { data } = await query.graph({
        entity: "order",
        fields: ["id", "metadata"],
        filters: { id: orderId },
      });
      const meta = data?.[0]?.metadata;
      if (meta) order.metadata = meta;
    }
  } catch (err) {
    logger.warn(`[order.placed] could not retrieve order ${orderId}: ${(err as Error).message}`);
    return;
  }

  const orderNumber = `OL-${order.display_id ?? orderId.slice(-6).toUpperCase()}`;
  const trackUrl = `${STOREFRONT_URL.replace(/\/$/, "")}/track/${orderId}`;
  const currency = (order.currency_code ?? "JMD").toUpperCase();
  const itemCount = (order.items ?? []).reduce((n, it) => n + (it.quantity ?? 0), 0);
  const cod = order.payment_status === "authorized";

  const notificationModule = container.resolve(Modules.NOTIFICATION) as unknown as {
    createNotifications(data: {
      to: string;
      channel: string;
      template?: string;
      content?: { text?: string; html?: string };
      data?: Record<string, unknown>;
      trigger_type?: string;
      resource_id?: string;
      resource_type?: string;
    }): Promise<unknown>;
  };

  // SMS / WhatsApp — always when phone present. Channel chosen by
  // order.metadata.notify_via_whatsapp (set at checkout). Provider falls
  // back to SMS internally if no WA sender is configured.
  const phone = order.shipping_address?.phone?.trim();
  const wantsWhatsApp = order.metadata?.notify_via_whatsapp === true;
  const phoneChannel = wantsWhatsApp ? "whatsapp" : "sms";
  if (phone) {
    const smsBody = cod
      ? `Onelink: Order ${orderNumber} confirmed (${itemCount} item${itemCount === 1 ? "" : "s"}, ${fmtAmt(order.total, currency)} on delivery). Track: ${trackUrl}`
      : `Onelink: Order ${orderNumber} confirmed (${itemCount} item${itemCount === 1 ? "" : "s"}, ${fmtAmt(order.total, currency)}). Track: ${trackUrl}`;
    try {
      await notificationModule.createNotifications({
        to: phone,
        channel: phoneChannel,
        template: "order-placed",
        content: { text: smsBody },
        trigger_type: "order.placed",
        resource_id: orderId,
        resource_type: "order",
      });
      logger.info(`[order.placed] ${phoneChannel.toUpperCase()} queued to ${phone} for ${orderNumber}`);
    } catch (err) {
      logger.error(`[order.placed] ${phoneChannel} dispatch failed for ${orderNumber}: ${(err as Error).message}`);
    }
  } else {
    logger.info(`[order.placed] order ${orderId} has no phone — skipping notification`);
  }

  // Email — only when the customer gave a real email (not the synthetic
  // <phone>@onelink.local fallback)
  if (isRealEmail(order.email)) {
    const subject = `Order ${orderNumber} confirmed — Onelink`;
    const html = renderEmailHtml(order, orderNumber, trackUrl);
    try {
      await notificationModule.createNotifications({
        to: order.email!,
        channel: "email",
        template: "order-placed",
        content: { html },
        data: { subject },
        trigger_type: "order.placed",
        resource_id: orderId,
        resource_type: "order",
      });
      logger.info(`[order.placed] email queued to ${order.email} for ${orderNumber}`);
    } catch (err) {
      logger.error(`[order.placed] email dispatch failed for ${orderNumber}: ${(err as Error).message}`);
    }
  } else {
    logger.info(`[order.placed] no real email on ${orderId} — skipping email`);
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
