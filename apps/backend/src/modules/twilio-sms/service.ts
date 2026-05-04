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
   * the storefront sends notifications with channel = "whatsapp". */
  whatsappFromNumber?: string;
}

interface InjectedDependencies {
  logger: Logger;
}

/**
 * Twilio SMS notification provider for Onelink.
 *
 * Sends SMS via the Twilio REST API. Used by Medusa's notification module to
 * dispatch order confirmations and rider updates to the customer's phone.
 *
 * The notification body is pre-built by the subscriber — this provider doesn't
 * own any templating, it just relays the text to Twilio.
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

    // Body is passed via notification.content.text or notification.data.body.
    const body =
      (notification.content?.text as string | undefined) ??
      ((notification.data as { body?: string } | undefined)?.body) ??
      "";
    if (!body) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "[twilio-sms] notification body is empty"
      );
    }

    // Twilio uses the same Messages endpoint for SMS and WhatsApp; the channel
    // is encoded by prefixing From / To with `whatsapp:`. We let the
    // notification.channel decide; if it's "whatsapp" but we don't have a
    // WA-enabled sender configured, fall back to SMS so the customer still
    // gets the update.
    const wantsWhatsApp = notification.channel === "whatsapp";
    const useWhatsApp = wantsWhatsApp && Boolean(this.options_.whatsappFromNumber);
    if (wantsWhatsApp && !useWhatsApp) {
      this.logger_.warn(
        `[twilio-sms] WhatsApp requested but TWILIO_WHATSAPP_FROM not configured — sending as SMS instead`
      );
    }
    const fromAddr = useWhatsApp ? this.options_.whatsappFromNumber! : this.options_.fromNumber;
    const toAddr = useWhatsApp ? `whatsapp:${to.replace(/^whatsapp:/, "")}` : to;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.options_.accountSid}/Messages.json`;
    const auth = Buffer.from(`${this.options_.accountSid}:${this.options_.authToken}`).toString("base64");
    const params = new URLSearchParams({
      From: fromAddr,
      To: toAddr,
      Body: body,
    });

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
    this.logger_.info(`[twilio-sms] sent ${useWhatsApp ? "WA" : "SMS"} to ${to}, sid=${data.sid}`);
    return { id: data.sid ?? "twilio-no-sid" };
  }
}
