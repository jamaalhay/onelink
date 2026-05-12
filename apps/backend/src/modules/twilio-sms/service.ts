import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils";
import {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types";

interface TwilioOptions {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  /** Optional WhatsApp-enabled sender (e.g. `whatsapp:+14155238886` for the
   * Twilio sandbox, or your approved WA Business sender). Required only if
   * the storefront sends notifications with channel = "whatsapp" and no
   * WhatsApp Messaging Service SID is configured. */
  whatsappFromNumber?: string;
  /** Optional Messaging Service whose sender pool contains the WA sender. */
  whatsappMessagingServiceSid?: string;
  /** Fallback Content Template SID for WhatsApp template sends. */
  whatsappContentSid?: string;
  /** Per-notification template map, keyed by Medusa notification.template. */
  whatsappContentSids?: Record<string, string | undefined>;
  /** Explicitly allow free-form WhatsApp sends inside an active customer window. */
  allowWhatsAppFreeform?: boolean;
}

type TwilioContentVariables = Record<
  string,
  string | number | boolean | null | undefined
>;

interface TwilioNotificationData {
  body?: string;
  contentVariables?: TwilioContentVariables | string;
  twilioContentSid?: string;
}

interface InjectedDependencies {
  logger: Logger;
}

/**
 * Twilio SMS/WhatsApp notification provider for Onelink.
 *
 * Sends SMS bodies and WhatsApp Content Templates via Twilio's Messages API.
 * Subscribers build the customer-facing copy and, for approved WhatsApp
 * templates, provide the variable values Twilio should substitute.
 */
export default class TwilioSmsNotificationService extends AbstractNotificationProviderService {
  static identifier = "twilio-sms";

  protected logger_: Logger;
  protected options_: TwilioOptions;

  constructor({ logger }: InjectedDependencies, options: TwilioOptions) {
    super();
    this.logger_ = logger;
    this.options_ = options;
  }

  static validateOptions(options: Record<string, unknown>): void {
    const required = ["accountSid", "authToken", "fromNumber"];
    for (const key of required) {
      if (!options[key]) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `[twilio-sms] missing required option: ${key}`
        );
      }
    }
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const to = notification.to;
    if (!to) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "[twilio-sms] notification.to (phone number) is required"
      );
    }

    const wantsWhatsApp = notification.channel === "whatsapp";
    let useWhatsApp =
      wantsWhatsApp &&
      Boolean(
        this.options_.whatsappFromNumber || this.options_.whatsappMessagingServiceSid
      );
    let contentSid = useWhatsApp ? this.getContentSid(notification) : undefined;
    const templateName = notification.template ?? "unknown";
    if (wantsWhatsApp && !useWhatsApp) {
      this.logger_.warn(
        `[twilio-sms] WhatsApp requested but no WA sender configured — sending as SMS instead`
      );
    }
    if (useWhatsApp && !contentSid && !this.options_.allowWhatsAppFreeform) {
      this.logger_.warn(
        `[twilio-sms] WhatsApp requested but no ContentSid configured for template ${templateName} — sending as SMS instead`
      );
      useWhatsApp = false;
      contentSid = undefined;
    }

    const body = this.getBody(notification);
    if (!body && !contentSid) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "[twilio-sms] notification body is empty and no WhatsApp ContentSid was configured"
      );
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.options_.accountSid}/Messages.json`;
    const auth = Buffer.from(`${this.options_.accountSid}:${this.options_.authToken}`).toString("base64");
    const params = new URLSearchParams({
      To: useWhatsApp ? this.formatWhatsAppAddress(to) : to,
    });

    if (useWhatsApp && this.options_.whatsappMessagingServiceSid) {
      params.set("MessagingServiceSid", this.options_.whatsappMessagingServiceSid);
    } else {
      params.set(
        "From",
        useWhatsApp ? this.options_.whatsappFromNumber! : this.options_.fromNumber
      );
    }

    if (contentSid) {
      params.set("ContentSid", contentSid);
      const contentVariables = this.getContentVariables(notification);
      if (contentVariables) {
        params.set("ContentVariables", contentVariables);
      }
    } else {
      params.set("Body", body);
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      this.logger_.error(`[twilio-sms] send failed (${res.status}): ${errBody.slice(0, 300)}`);
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Twilio send failed: HTTP ${res.status}`
      );
    }

    const data = (await res.json()) as { sid?: string };
    const mode = useWhatsApp ? (contentSid ? "WA template" : "WA") : "SMS";
    this.logger_.info(`[twilio-sms] sent ${mode} to ${to}, sid=${data.sid}`);
    return { id: data.sid ?? "twilio-no-sid" };
  }

  private getBody(notification: ProviderSendNotificationDTO): string {
    return (
      (notification.content?.text as string | undefined) ??
      ((notification.data as TwilioNotificationData | undefined)?.body) ??
      ""
    );
  }

  private getContentSid(notification: ProviderSendNotificationDTO): string | undefined {
    const data = notification.data as TwilioNotificationData | undefined;
    const template = notification.template;
    return (
      data?.twilioContentSid ??
      (template ? this.options_.whatsappContentSids?.[template] : undefined) ??
      this.options_.whatsappContentSid
    );
  }

  private getContentVariables(notification: ProviderSendNotificationDTO): string | undefined {
    const variables = (notification.data as TwilioNotificationData | undefined)?.contentVariables;
    if (!variables) {
      return undefined;
    }
    if (typeof variables === "string") {
      return variables;
    }

    const normalized = Object.fromEntries(
      Object.entries(variables)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    );
    return Object.keys(normalized).length ? JSON.stringify(normalized) : undefined;
  }

  private formatWhatsAppAddress(to: string): string {
    const raw = to.replace(/^whatsapp:/, "").trim();
    const normalized = raw.startsWith("+")
      ? `+${raw.slice(1).replace(/\D/g, "")}`
      : `+${raw.replace(/\D/g, "")}`;
    return `whatsapp:${normalized}`;
  }
}
