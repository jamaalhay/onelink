/**
 * Onelink seed — JMD region · 7 categories · 16 products · 10 Kingston zones.
 * Run: pnpm exec medusa exec ./src/scripts/seed-onelink.ts
 *
 * Idempotent: skips any entity whose handle/code/name already exists.
 */
import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  deleteProductCategoriesWorkflow,
  deleteProductsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

// ────────── Onelink brand data ──────────────────────────────────────────────
const CATEGORIES = [
  { handle: "vapes",                name: "Vapes",                 description: "Premium disposables and pod systems." },
  { handle: "zyn-pouches",          name: "ZYN Pouches",           description: "Nicotine pouches in every strength." },
  { handle: "lighters",             name: "Lighters",              description: "Bic, Clipper, refillables, torches." },
  { handle: "smoking-accessories",  name: "Smoking Accessories",   description: "Trays, grinders, tools, and cases." },
  { handle: "drinks",               name: "Drinks",                description: "Soft drinks, juices, energy." },
  { handle: "snacks",               name: "Snacks",                description: "Chips, sweets, late-night fuel." },
  { handle: "rolling-papers",       name: "Rolling Papers",        description: "RAW, OCB, Zig-Zag and more." },
];

interface SeedProduct {
  handle: string;
  title: string;
  brand: string;
  category: string;
  priceJmd: number;
  description: string;
  variants?: { label: string; sku: string }[];
  stock: number;
}

const PRODUCTS: SeedProduct[] = [
  { handle: "vuse-go-1000-grape-ice",         title: "Vuse Go 1000 — Grape Ice",            brand: "Vuse",     category: "vapes",                priceJmd: 3200, description: "Cool grape with a crisp menthol finish. Up to 1000 puffs, no charging.", variants: [{label:"Grape Ice", sku:"VG-GI-001"},{label:"Blue Razz Ice", sku:"VG-BR-002"},{label:"Watermelon", sku:"VG-WM-003"}], stock: 50 },
  { handle: "elf-bar-bc5000-blue-razz",       title: "Elf Bar BC5000 — Blue Razz",          brand: "Elf Bar",  category: "vapes",                priceJmd: 2800, description: "Sweet blue raspberry, all-day flavor.",                                  stock: 80 },
  { handle: "elf-bar-bc5000-strawberry",      title: "Elf Bar BC5000 — Strawberry",         brand: "Elf Bar",  category: "vapes",                priceJmd: 2800, description: "Ripe strawberry, smooth pull.",                                          stock: 60 },
  { handle: "elf-bar-bc5000-watermelon",      title: "Elf Bar BC5000 — Watermelon",         brand: "Elf Bar",  category: "vapes",                priceJmd: 2800, description: "Crisp watermelon, every puff.",                                          stock: 0  },
  { handle: "zyn-cool-mint-6mg",              title: "ZYN Cool Mint Pouches",               brand: "ZYN",      category: "zyn-pouches",          priceJmd: 1800, description: "Clean mint hit, slim format.",                                            variants: [{label:"3 mg", sku:"ZYN-CM-3"},{label:"6 mg", sku:"ZYN-CM-6"}],                              stock: 120 },
  { handle: "zyn-citrus-3mg",                 title: "ZYN Citrus Pouches",                  brand: "ZYN",      category: "zyn-pouches",          priceJmd: 1800, description: "Bright citrus, lighter strength.",                                       stock: 90 },
  { handle: "bic-classic-lighter-blue",       title: "Bic Classic Lighter — Blue",          brand: "Bic",      category: "lighters",             priceJmd: 350,  description: "Reliable, refillable, classic.",                                          stock: 300 },
  { handle: "clipper-lighter-black",          title: "Clipper Lighter — Black",             brand: "Clipper",  category: "lighters",             priceJmd: 450,  description: "Refillable, replaceable flint, iconic.",                                  stock: 180 },
  { handle: "raw-classic-papers-king",        title: "RAW Classic Papers — King Size",      brand: "RAW",      category: "rolling-papers",       priceJmd: 250,  description: "Unbleached, slow-burning, king size.",                                    stock: 400 },
  { handle: "ocb-premium-slim",               title: "OCB Premium Slim",                    brand: "OCB",      category: "rolling-papers",       priceJmd: 280,  description: "Ultra-thin, smooth burn.",                                                stock: 250 },
  { handle: "red-bull-original-250ml",        title: "Red Bull Original 250ml",             brand: "Red Bull", category: "drinks",               priceJmd: 600,  description: "Gives you wings.",                                                        stock: 240 },
  { handle: "ting-grapefruit-355ml",          title: "Ting Grapefruit Soda 355ml",          brand: "Ting",     category: "drinks",               priceJmd: 250,  description: "Jamaica's bittersweet classic.",                                          stock: 380 },
  { handle: "ferrero-rocher-3pack",           title: "Ferrero Rocher 3-pack",               brand: "Ferrero",  category: "snacks",               priceJmd: 750,  description: "Hazelnut, wafer, chocolate.",                                             stock: 95  },
  { handle: "pringles-original-156g",         title: "Pringles Original 156g",              brand: "Pringles", category: "snacks",               priceJmd: 850,  description: "Once you pop, you can't stop.",                                           stock: 145 },
  { handle: "rolling-tray-medium",            title: "Rolling Tray — Medium",               brand: "House",    category: "smoking-accessories",  priceJmd: 1200, description: "Anodized aluminum, deep lip, easy clean.",                                stock: 38  },
  { handle: "metal-grinder-4-piece-50mm",     title: "4-Piece Metal Grinder · 50mm",        brand: "House",    category: "smoking-accessories",  priceJmd: 1800, description: "Aircraft-grade aluminum, magnetic top, kief catcher.",                    stock: 24  },
];

const ZONES = [
  { handle: "new-kingston",   name: "New Kingston",   feeJmd: 600,  etaMin: 15, etaMax: 30 },
  { handle: "half-way-tree",  name: "Half Way Tree",  feeJmd: 600,  etaMin: 15, etaMax: 30 },
  { handle: "liguanea",       name: "Liguanea",       feeJmd: 600,  etaMin: 15, etaMax: 30 },
  { handle: "barbican",       name: "Barbican",       feeJmd: 700,  etaMin: 20, etaMax: 35 },
  { handle: "cherry-gardens", name: "Cherry Gardens", feeJmd: 800,  etaMin: 25, etaMax: 40 },
  { handle: "stony-hill",     name: "Stony Hill",     feeJmd: 1000, etaMin: 30, etaMax: 45 },
  { handle: "constant-spring",name: "Constant Spring",feeJmd: 700,  etaMin: 20, etaMax: 35 },
  { handle: "papine",         name: "Papine",         feeJmd: 700,  etaMin: 20, etaMax: 35 },
  { handle: "harbour-view",   name: "Harbour View",   feeJmd: 1100, etaMin: 30, etaMax: 45 },
  { handle: "portmore",       name: "Portmore",       feeJmd: 1200, etaMin: 30, etaMax: 45 },
];

// ────────── Seed orchestration ──────────────────────────────────────────────
export default async function seedOnelink({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("[onelink] starting seed");

  // ── 0. Clean up demo data from the initial Medusa scaffold ──────────────
  const demoProductHandles = ["t-shirt", "sweatshirt", "sweatpants", "shorts"];
  const demoCategoryHandles = ["shirts", "pants", "sweatshirts", "merch"];

  const { data: demoProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: demoProductHandles },
  });
  if (demoProducts.length > 0) {
    logger.info(`[onelink] deleting ${demoProducts.length} demo products`);
    await deleteProductsWorkflow(container).run({
      input: { ids: demoProducts.map((p: { id: string }) => p.id) },
    });
  }

  const { data: demoCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
    filters: { handle: demoCategoryHandles },
  });
  if (demoCategories.length > 0) {
    logger.info(`[onelink] deleting ${demoCategories.length} demo categories`);
    await deleteProductCategoriesWorkflow(container).run({
      input: demoCategories.map((c: { id: string }) => c.id),
    });
  }

  // ── 1. Add JMD currency to the store ────────────────────────────────────
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "name", "supported_currencies.*", "default_sales_channel_id"],
  });
  const store = stores[0];
  const hasJmd = (store.supported_currencies as Array<{ currency_code?: string | null } | null>).some(
    (c) => c?.currency_code === "jmd"
  );
  if (!hasJmd) {
    logger.info("[onelink] adding JMD currency to store");
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          supported_currencies: ([
            // Demote existing currencies; JMD becomes the sole default.
            ...(store.supported_currencies as Array<{ currency_code?: string | null }>).flatMap(
              (c) => (c?.currency_code ? [{ currency_code: c.currency_code, is_default: false }] : [])
            ),
            { currency_code: "jmd", is_default: true },
          ]) as Array<{ currency_code: string; is_default: boolean }>,
        },
      },
    });
  }

  // ── 2. Create Jamaica region ─────────────────────────────────────────────
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
    filters: { name: "Jamaica" },
  });
  let region: { id: string };
  if (existingRegions.length > 0) {
    region = existingRegions[0];
    logger.info(`[onelink] reusing Jamaica region (${region.id})`);
  } else {
    logger.info("[onelink] creating Jamaica region");
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [{
          name: "Jamaica",
          currency_code: "jmd",
          countries: ["jm"],
          payment_providers: ["pp_system_default", "pp_cod_cod"],
        }],
      },
    });
    region = result[0];
  }

  // Make sure both Card (system_default) and COD providers are linked to the
  // region — re-runs after adding a new provider should attach it.
  try {
    const { data: regionWithProviders } = await query.graph({
      entity: "region",
      fields: ["id", "payment_providers.id"],
      filters: { id: region.id },
    });
    const rawLinked = (regionWithProviders[0]?.payment_providers ?? []) as Array<{ id?: string } | null>;
    const linked = new Set(
      rawLinked.flatMap((p) => (p?.id ? [p.id] : []))
    );
    const desired = ["pp_system_default", "pp_cod_cod"];
    const missing = desired.filter((p) => !linked.has(p));
    if (missing.length > 0) {
      logger.info(`[onelink] linking missing payment providers to region: ${missing.join(", ")}`);
      const regionModule = container.resolve(Modules.REGION);
      // Note: type-cast needed because the region module's update signature
      // accepts payment_providers but it isn't fully exposed in the type.
      await (regionModule as unknown as {
        updateRegions(id: string, data: { payment_providers: string[] }): Promise<unknown>;
      }).updateRegions(region.id, {
        payment_providers: [...linked, ...missing],
      });
    }
  } catch (err) {
    logger.warn(`[onelink] failed to verify region payment providers: ${(err as Error).message}`);
  }

  // ── 3. Create categories ────────────────────────────────────────────────
  const { data: existingCats } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
  });
  const existingHandles = new Set(existingCats.map((c: { handle: string }) => c.handle));
  const catsToCreate = CATEGORIES.filter((c) => !existingHandles.has(c.handle));
  if (catsToCreate.length > 0) {
    logger.info(`[onelink] creating ${catsToCreate.length} categories`);
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: catsToCreate.map((c) => ({
          name: c.name,
          handle: c.handle,
          description: c.description,
          is_active: true,
        })),
      },
    });
  } else {
    logger.info("[onelink] all categories already exist");
  }
  // Re-query to get IDs for all categories
  const { data: allCats } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
  });
  const catByHandle = new Map(allCats.map((c: { id: string; handle: string }) => [c.handle, c.id]));

  // ── 4. Create products ──────────────────────────────────────────────────
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  });
  const existingProductHandles = new Set(existingProducts.map((p: { handle: string }) => p.handle));
  const productsToCreate = PRODUCTS.filter((p) => !existingProductHandles.has(p.handle));

  // Default sales channel to attach products to
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const defaultChannel = salesChannels.find((s: { name: string }) => s.name === "Default Sales Channel") ?? salesChannels[0];

  // Default shipping profile (Onelink products are physical)
  const { data: profiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name", "type"],
  });
  const defaultProfile = profiles.find((p: { type: string }) => p.type === "default") ?? profiles[0];

  if (productsToCreate.length > 0) {
    logger.info(`[onelink] creating ${productsToCreate.length} products`);
    await createProductsWorkflow(container).run({
      input: {
        products: productsToCreate.map((p) => {
          const variantList = p.variants?.length ? p.variants : [{ label: "Default", sku: p.handle.toUpperCase() }];
          return {
            title: p.title,
            handle: p.handle,
            description: p.description,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: defaultProfile?.id,
            category_ids: catByHandle.get(p.category) ? [catByHandle.get(p.category)!] : [],
            sales_channels: [{ id: defaultChannel.id }],
            options: p.variants?.length ? [{ title: "Variant", values: p.variants.map((v) => v.label) }] : [{ title: "Default", values: ["Default"] }],
            variants: variantList.map((v) => ({
              title: v.label,
              sku: v.sku,
              manage_inventory: true,
              prices: [{ currency_code: "jmd", amount: p.priceJmd }],
              options: { [p.variants?.length ? "Variant" : "Default"]: v.label },
            })),
          };
        }),
      },
    });
  } else {
    logger.info("[onelink] all products already exist");
  }

  // ── 5. Set inventory levels ─────────────────────────────────────────────
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });
  const stockLocation = stockLocations[0];

  // Query inventory_items directly by SKU — bypasses link-table id confusion.
  const allSkus = PRODUCTS.flatMap((p) =>
    (p.variants?.length ? p.variants.map((v) => v.sku) : [p.handle.toUpperCase()])
  );
  const { data: invItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
    filters: { sku: allSkus },
  });
  const itemIdBySku = new Map<string, string>();
  for (const i of invItems as Array<{ id: string; sku?: string | null }>) {
    if (i.sku) itemIdBySku.set(i.sku, i.id);
  }

  const inventoryUpdates: { inventory_item_id: string; location_id: string; stocked_quantity: number }[] = [];
  for (const p of PRODUCTS) {
    const skus = p.variants?.length ? p.variants.map((v) => v.sku) : [p.handle.toUpperCase()];
    for (const sku of skus) {
      const itemId = itemIdBySku.get(sku);
      if (!itemId) continue;
      inventoryUpdates.push({
        inventory_item_id: itemId,
        location_id: stockLocation.id,
        stocked_quantity: p.stock,
      });
    }
  }
  if (inventoryUpdates.length > 0) {
    logger.info(`[onelink] setting inventory levels for ${inventoryUpdates.length} variants`);
    try {
      await createInventoryLevelsWorkflow(container).run({
        input: { inventory_levels: inventoryUpdates },
      });
    } catch (err) {
      logger.warn(`[onelink] inventory levels may already exist: ${(err as Error).message}`);
    }
  }

  // ── 6. Create Kingston shipping options ─────────────────────────────────
  const { data: fulfillmentSets } = await query.graph({
    entity: "fulfillment_set",
    fields: ["id", "name", "service_zones.id", "service_zones.name", "service_zones.geo_zones.country_code"],
  });
  const fulfillmentSet = fulfillmentSets[0];
  const serviceZone = fulfillmentSet?.service_zones?.[0];

  if (!serviceZone) {
    logger.warn("[onelink] no service zone found; skipping shipping options");
  } else {
    // Make sure the service zone covers Jamaica (jm) — initial seed only has EU countries.
    const hasJm = serviceZone.geo_zones?.some(
      (gz: { country_code?: string }) => gz.country_code?.toLowerCase() === "jm"
    );
    if (!hasJm) {
      logger.info("[onelink] adding 'jm' to service zone geo_zones");
      const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
      await fulfillmentModuleService.updateServiceZones(serviceZone.id, {
        geo_zones: [
          ...(serviceZone.geo_zones ?? []).map((gz: { country_code?: string }) => ({
            type: "country" as const,
            country_code: (gz.country_code ?? "").toLowerCase(),
          })),
          { type: "country" as const, country_code: "jm" },
        ],
      });
    }

    const { data: existingShippingOptions } = await query.graph({
      entity: "shipping_option",
      fields: ["id", "name"],
    });
    const existingShipNames = new Set(existingShippingOptions.map((s: { name: string }) => s.name));

    const optionsToCreate = ZONES
      .map((z) => ({
        zone: z,
        name: `Onelink — ${z.name}`,
      }))
      .filter((o) => !existingShipNames.has(o.name));

    if (optionsToCreate.length > 0) {
      logger.info(`[onelink] creating ${optionsToCreate.length} Kingston shipping options`);
      await createShippingOptionsWorkflow(container).run({
        input: optionsToCreate.map(({ zone, name }) => ({
          name,
          price_type: "flat" as const,
          provider_id: "manual_manual",
          service_zone_id: serviceZone.id,
          shipping_profile_id: defaultProfile.id,
          type: {
            label: zone.name,
            description: `${zone.etaMin}–${zone.etaMax} min`,
            code: `kingston-${zone.handle}`,
          },
          prices: [{ currency_code: "jmd", amount: zone.feeJmd }],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
            { attribute: "is_return", value: "false", operator: "eq" as const },
          ],
        })),
      });
    } else {
      logger.info("[onelink] all shipping options already exist");
    }

    // Soft-delete the legacy demo shipping options (Standard / Express) — they
    // have no JMD price and would fail at checkout if a customer picks them.
    const { data: liveOptions } = await query.graph({
      entity: "shipping_option",
      fields: ["id", "name"],
    });
    const demoIds = liveOptions
      .filter((o: { name?: string }) => !o.name?.startsWith("Onelink"))
      .map((o: { id: string }) => o.id);
    if (demoIds.length > 0) {
      logger.info(`[onelink] removing ${demoIds.length} legacy demo shipping options`);
      const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
      await fulfillmentModuleService.deleteShippingOptions(demoIds);
    }
  }

  logger.info("[onelink] seed complete ✓");
}
