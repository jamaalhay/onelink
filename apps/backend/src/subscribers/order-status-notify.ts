import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

const STOREFRONT_URL =
  process.env.STOREFRONT_URL ?? "https://storefront-dun-three.vercel.app";

// Sends an SMS or WhatsApp update when ops marks a fulfillment shipped (rider
// dispatched) or delivered. Medusa's shipment.created and delivery.created
// events only include the fulfillment id, so we look up the parent order via
// the query graph to get the customer's phone and notification preference.
export default async function orderStatusNotify({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const fulfillmentId = event.data.id;
  const eventName = event.name;
  const logger = container.resolve("logger");

  let order: {
    id: string;
    display_id?: number | null;
    metadata?: Record<string, unknown> | null;
    shipping_address?: { phone?: string | null } | null;
  } | undefined;
  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY) as unknown as {
      graph(args: {
        entity: string;
        fields: string[];
        filters?: Record<string, unknown>;
        pagination?: { take?: number };
      }): Promise<{
        data: Array<{
          id: string;
          display_id?: number | null;
          metadata?: Record<string, unknown> | null;
          shipping_address?: { phone?: string | null } | null;
          fulfillments?: { id: string }[];
        }>;
      }>;
    };
    // Order doesn't expose fulfillments as a queryable filter, so we list a
    // recent batch and find the one containing this fulfillment id. The
    // fulfillment was just created, so it's almost always in the first page.
    const { data } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "metadata",
        "shipping_address.phone",
        "fulfillments.id",
      ],
      pagination: { take: 50 },
    });
    order = data.find((o) =>
      (o.fulfillments ?? []).some((f) => f.id === fulfillmentId)
    );
  } catch (err) {
    logger.warn(
      `[${eventName}] could not look up order for fulfillment ${fulfillmentId}: ${(err as Error).message}`
    );
    return;
  }

  if (!order) {
    logger.warn(`[${eventName}] no order found for fulfillment ${fulfillmentId}`);
    return;
  }

  const phone = order.shipping_address?.phone?.trim();
  if (!phone) {
    logger.info(`[${eventName}] order ${order.id} has no phone — skipping notification`);
    return;
  }

  const orderNumber = `OL-${order.display_id ?? order.id.slice(-6).toUpperCase()}`;
  const trackUrl = `${STOREFRONT_URL.replace(/\/$/, "")}/track/${order.id}`;
  const delivered = eventName === "delivery.created";
  const body = delivered
    ? `Onelink: Order ${orderNumber} delivered. Thanks for shopping with us!`
    : `Onelink: Your rider is on the way with order ${orderNumber}. Track: ${trackUrl}`;
  const wantsWhatsApp = order.metadata?.notify_via_whatsapp === true;
  const channel = wantsWhatsApp ? "whatsapp" : "sms";
  const contentVariables = delivered
    ? { "1": orderNumber }
    : { "1": orderNumber, "2": "your rider", "3": "15-30 min", "4": trackUrl };

  try {
    const notificationModule = container.resolve(Modules.NOTIFICATION) as unknown as {
      createNotifications(data: {
        to: string;
        channel: string;
        template?: string;
        content?: { text: string };
        data?: Record<string, unknown>;
        trigger_type?: string;
        resource_id?: string;
        resource_type?: string;
      }): Promise<unknown>;
    };
    await notificationModule.createNotifications({
      to: phone,
      channel,
      template: eventName,
      content: { text: body },
      data: { body, contentVariables },
      trigger_type: eventName,
      resource_id: order.id,
      resource_type: "order",
    });
    logger.info(
      `[${eventName}] ${channel.toUpperCase()} queued to ${phone} for ${orderNumber}`
    );
  } catch (err) {
    logger.error(
      `[${eventName}] ${channel} dispatch failed for ${orderNumber}: ${(err as Error).message}`
    );
  }
}

export const config: SubscriberConfig = {
  event: ["shipment.created", "delivery.created"],
};
