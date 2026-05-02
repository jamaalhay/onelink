import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils";
import {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types";

interface ResendOptions {
  apiKey: string;
  from: string;
}

interface InjectedDependencies {
  logger: Logger;
}

/**
 * Resend email notification provider for Onelink.
 *
 * Posts to Resend's REST API with whatever subject + body the subscriber
 * supplies. Body can be plain text (notification.content.text), HTML
 * (notification.content.html), or both.
 *
 * Use a verified domain in RESEND_FROM for prod ("Onelink <noreply@onelink.example>").
 * The default `onboarding@resend.dev` works without verification but caps
 * sends at 100/day and may land in spam.
 */
export default class ResendEmailNotificationService extends AbstractNotificationProviderService {
  static identifier = "resend-email";

  protected logger_: Logger;
  protected options_: ResendOptions;

  constructor({ logger }: InjectedDependencies, options: ResendOptions) {
    super();
    this.logger_ = logger;
    this.options_ = options;
  }

  static validateOptions(options: Record<string, unknown>): void {
    if (!options.apiKey) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "[resend-email] apiKey is required");
    }
    if (!options.from) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "[resend-email] from is required");
    }
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const to = notification.to;
    if (!to) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "[resend-email] notification.to (email) is required");
    }
    const subject =
      ((notification.data as { subject?: string } | undefined)?.subject) ??
      "Onelink";
    const text = notification.content?.text as string | undefined;
    const html = (notification.content as { html?: string } | undefined)?.html;
    if (!text && !html) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "[resend-email] empty body — provide content.text or content.html");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options_.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.options_.from,
        to: [to],
        subject,
        text,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      this.logger_.error(`[resend-email] send failed (${res.status}): ${errBody.slice(0, 300)}`);
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Resend send failed: HTTP ${res.status}`);
    }

    const data = (await res.json()) as { id?: string };
    this.logger_.info(`[resend-email] sent to ${to}, id=${data.id}`);
    return { id: data.id ?? "resend-no-id" };
  }
}
