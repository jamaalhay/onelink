import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";

const STOREFRONT_URL =
  process.env.STOREFRONT_URL ?? "https://storefront-dun-three.vercel.app";

// Send an SMS confirmation to the customer when an order is placed.
// Triggered by Medusa's "order.placed" event. Twilio is wired in via the
// notification module's "sms" channel — see medusa-config.ts.
export default async function orderPlacedNotify({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = event.data.id;
  const logger = container.resolve("logger");

  let order: {
    id: string;
    display_id?: number | string | null;
    total?: number | null;
    currency_code?: string | null;
    payment_status?: string | null;
    shipping_address?: { phone?: string | null } | null;
    items?: { quantity?: number | null }[] | null;
  };
  try {
    const orderModule = container.resolve(Modules.ORDER) as unknown as {
      retrieveOrder(
        id: string,
        config: { relations: string[] }
      ): Promise<typeof order>;
    };
    order = await orderModule.retrieveOrder(orderId, {
      relations: ["shipping_address", "items"],
    });
  } catch (err) {
    logger.warn(
      `[order.placed] could not retrieve order ${orderId}: ${(err as Error).message}`
    );
    return;
  }

  const phone = order.shipping_address?.phone?.trim();
  if (!phone) {
    logger.info(`[order.placed] order ${orderId} has no shipping phone — skipping SMS`);
    return;
  }

  const orderNumber = `OL-${order.display_id ?? orderId.slice(-6).toUpperCase()}`;
  const totalUnits = order.total ?? 0;
  const currency = (order.currency_code ?? "JMD").toUpperCase();
  const itemCount = (order.items ?? []).reduce(
    (n, it) => n + (it.quantity ?? 0),
    0
  );
  const trackUrl = `${STOREFRONT_URL.replace(/\/$/, "")}/track/${orderId}`;
  const cod = order.payment_status === "authorized";

  const body = cod
    ? `Onelink: Order ${orderNumber} confirmed (${itemCount} item${itemCount === 1 ? "" : "s"}, ${currency}$${totalUnits} on delivery). Track: ${trackUrl}`
    : `Onelink: Order ${orderNumber} confirmed (${itemCount} item${itemCount === 1 ? "" : "s"}, ${currency}$${totalUnits}). Track: ${trackUrl}`;

  try {
    const notificationModule = container.resolve(Modules.NOTIFICATION) as unknown as {
      createNotifications(data: {
        to: string;
        channel: string;
        template?: string;
        content?: { text: string };
        trigger_type?: string;
        resource_id?: string;
        resource_type?: string;
      }): Promise<unknown>;
    };
    await notificationModule.createNotifications({
      to: phone,
      channel: "sms",
      template: "order-placed",
      content: { text: body },
      trigger_type: "order.placed",
      resource_id: orderId,
      resource_type: "order",
    });
    logger.info(`[order.placed] SMS queued to ${phone} for ${orderNumber}`);
  } catch (err) {
    logger.error(
      `[order.placed] SMS dispatch failed for ${orderNumber}: ${(err as Error).message}`
    );
    // Swallow — notification failure should not break the order flow.
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
