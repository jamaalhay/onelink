import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import TwilioSmsNotificationService from "./service";

export default ModuleProvider(Modules.NOTIFICATION, {
  services: [TwilioSmsNotificationService],
});
