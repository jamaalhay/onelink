import { AbstractPaymentProvider } from "@medusajs/framework/utils";
import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  PaymentSessionStatus,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types";

interface CodOptions {
  // No options needed — COD is fully manual / offline.
  [key: string]: unknown;
}

/**
 * Cash-on-Delivery payment provider for Onelink.
 *
 * COD has no external API — all "transactions" are state markers that ops
 * confirm offline. The provider exposes the standard Medusa payment lifecycle
 * so it slots into checkout, refunds, and admin tooling without surprises.
 *
 * Lifecycle for a COD order:
 *   initiatePayment → returns a session id, status "pending"
 *   authorizePayment → status "authorized" (rider dispatched, money owed)
 *   capturePayment   → status "captured" (rider returned with cash)
 *   refundPayment    → records refund amount (manual cashback)
 *   cancelPayment    → status "canceled"
 */
export default class CashOnDeliveryProviderService extends AbstractPaymentProvider<CodOptions> {
  static identifier = "cod";

  // Re-declare a public constructor so this class can be passed to
  // ModuleProvider (the framework's typed Constructor<any> requires public).
  constructor(container: unknown, options: CodOptions) {
    super(container as never, options);
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const { amount, currency_code } = input;
    // Prefer Medusa's idempotency key when available so retries reuse the same
    // session id rather than orphaning previous ones.
    const ctx = (input as unknown as { context?: { idempotency_key?: string } }).context;
    const idempotencyKey = ctx?.idempotency_key;
    const id = idempotencyKey
      ? `cod_${idempotencyKey}`
      : `cod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      id,
      data: {
        status: "pending" as PaymentSessionStatus,
        amount,
        currency_code,
        captured_amount: 0,
        refunded_amount: 0,
      },
    };
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    return {
      data: { ...input.data, status: "authorized" },
      status: "authorized" as PaymentSessionStatus,
    };
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    // COD intent: capture means cash physically collected by the rider.
    // Guard against capture being called before authorize (rider dispatched).
    const prevStatus = (input.data?.status as string | undefined) ?? "pending";
    if (prevStatus !== "authorized" && prevStatus !== "captured") {
      throw new Error(
        `[cod] Cannot capture from state "${prevStatus}". Authorize the payment (rider dispatched) before capture (cash collected).`
      );
    }
    const captured =
      ((input as unknown as { amount?: number }).amount ?? (input.data?.amount as number | undefined)) ?? 0;
    return {
      data: {
        ...input.data,
        status: "captured",
        captured_amount: captured,
      },
    };
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return {
      data: { ...input.data, status: "canceled" },
    };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const prevRefund = (input.data?.refunded_amount as number | undefined) ?? 0;
    const captured = (input.data?.captured_amount as number | undefined) ?? 0;
    const requested = (input as unknown as { amount?: number }).amount ?? 0;
    if (requested <= 0) {
      throw new Error(`[cod] Refund amount must be positive (got ${requested}).`);
    }
    if (prevRefund + requested > captured) {
      throw new Error(
        `[cod] Refund of ${requested} exceeds remaining captured amount (${captured - prevRefund}).`
      );
    }
    const newRefund = prevRefund + requested;
    return {
      data: {
        ...input.data,
        refunded_amount: newRefund,
        status: newRefund >= captured ? "canceled" : "captured",
      },
    };
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data: input.data ?? {} };
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return { data: input.data ?? {} };
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data ?? {} };
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const recorded = (input.data?.status as PaymentSessionStatus | undefined) ?? "pending";
    return { status: recorded };
  }

  async getWebhookActionAndData(
    _payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    return { action: "not_supported" };
  }
}
