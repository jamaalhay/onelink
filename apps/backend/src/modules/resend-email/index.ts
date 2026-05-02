import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import ResendEmailNotificationService from "./service";

export default ModuleProvider(Modules.NOTIFICATION, {
  services: [ResendEmailNotificationService],
});
