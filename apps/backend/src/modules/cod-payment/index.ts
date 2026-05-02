import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import CashOnDeliveryProviderService from "./service";

export default ModuleProvider(Modules.PAYMENT, {
  services: [CashOnDeliveryProviderService],
});
