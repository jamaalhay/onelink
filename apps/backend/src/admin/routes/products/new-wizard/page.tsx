import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Plus, CheckCircle, ArrowLeft, ArrowRight } from "@medusajs/icons";
import {
  Container,
  Heading,
  Text,
  Input,
  Textarea,
  Select,
  Button,
  Label,
  ProgressTabs,
  toast,
} from "@medusajs/ui";
import { useEffect, useMemo, useState } from "react";

// Three-step product creation wizard. Replaces the stock Medusa "create
// product" form for ops staff who only need title / category / price /
// thumbnail / stock — the simplified path Onelink's catalog actually uses.
//
// Flow:
//   Step 1 — Basic info: title, handle, description, brand, category, price.
//   Step 2 — Media & inventory: thumbnail URL, gallery URLs (one per line),
//            stock count.
//   Step 3 — Review payload, then submit via POST /admin/products. Shows
//            inline error if Medusa rejects the payload (validation, etc.).

interface Category { id: string; name: string; handle: string }
interface SalesChannel { id: string; name: string }
interface ShippingProfile { id: string; type: string }

type Step = "basic" | "media" | "review";

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const emptyFormValues = {
  title: "",
  handle: "",
  description: "",
  brand: "",
  categoryId: "",
  priceJmd: "",
  thumbnail: "",
  gallery: "",
  stock: "0",
};

const NewProductWizardPage = () => {
  const [step, setStep] = useState<Step>("basic");
  const [values, setValues] = useState(emptyFormValues);
  const [touchedHandle, setTouchedHandle] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [salesChannel, setSalesChannel] = useState<SalesChannel | null>(null);
  const [shippingProfile, setShippingProfile] = useState<ShippingProfile | null>(null);

  // Hydrate prerequisites that the wizard needs to attach to the new product.
  useEffect(() => {
    const fetchPrereqs = async () => {
      try {
        const [catsRes, scRes, spRes] = await Promise.all([
          fetch("/admin/product-categories?limit=100", { credentials: "include" }),
          fetch("/admin/sales-channels?limit=10", { credentials: "include" }),
          fetch("/admin/shipping-profiles?limit=10", { credentials: "include" }),
        ]);
        const cats = await catsRes.json();
        const scs = await scRes.json();
        const sps = await spRes.json();
        setCategories(cats?.product_categories ?? []);
        const defaultSc =
          (scs?.sales_channels ?? []).find((s: SalesChannel) => s.name === "Default Sales Channel") ??
          (scs?.sales_channels ?? [])[0] ??
          null;
        setSalesChannel(defaultSc);
        const defaultSp =
          (sps?.shipping_profiles ?? []).find((s: ShippingProfile) => s.type === "default") ??
          (sps?.shipping_profiles ?? [])[0] ??
          null;
        setShippingProfile(defaultSp);
      } catch (err) {
        console.error("[wizard] prereq fetch failed:", err);
      }
    };
    fetchPrereqs();
  }, []);

  // Derive the handle from the title until the user edits it manually.
  useEffect(() => {
    if (!touchedHandle) {
      setValues((v) => ({ ...v, handle: slugify(v.title) }));
    }
  }, [values.title, touchedHandle]);

  const set = (k: keyof typeof emptyFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
  };

  const galleryList = useMemo(
    () => values.gallery.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
    [values.gallery]
  );

  const priceNumber = Number(values.priceJmd.replace(/,/g, ""));
  const stockNumber = Number(values.stock);

  const validateBasic = (): string | null => {
    if (!values.title.trim()) return "Title is required";
    if (!values.handle.trim() || !/^[a-z0-9-]+$/.test(values.handle)) {
      return "Handle must contain only lowercase letters, numbers, and dashes";
    }
    if (!values.categoryId) return "Pick a category";
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) return "Price must be a positive number";
    return null;
  };

  const validateMedia = (): string | null => {
    if (!values.thumbnail.trim()) return "Thumbnail URL is required";
    if (!Number.isFinite(stockNumber) || stockNumber < 0) return "Stock must be 0 or greater";
    return null;
  };

  const goNext = () => {
    setError(null);
    if (step === "basic") {
      const e = validateBasic();
      if (e) return setError(e);
      setStep("media");
    } else if (step === "media") {
      const e = validateMedia();
      if (e) return setError(e);
      setStep("review");
    }
  };
  const goBack = () => {
    setError(null);
    if (step === "media") setStep("basic");
    else if (step === "review") setStep("media");
  };

  const submit = async () => {
    setError(null);
    if (!salesChannel || !shippingProfile) {
      return setError("Sales channel or shipping profile not loaded yet — try again in a moment.");
    }
    setSubmitting(true);
    try {
      const sku = values.handle.toUpperCase().replace(/-/g, "_");
      const description = values.brand
        ? `${values.brand} — ${values.description}`.trim()
        : values.description.trim();
      const body = {
        title: values.title.trim(),
        handle: values.handle.trim(),
        description,
        status: "published",
        thumbnail: values.thumbnail.trim(),
        images: [values.thumbnail.trim(), ...galleryList].map((url) => ({ url })),
        category_ids: [values.categoryId],
        sales_channels: [{ id: salesChannel.id }],
        shipping_profile_id: shippingProfile.id,
        options: [{ title: "Default", values: ["Default"] }],
        variants: [
          {
            title: "Default",
            sku,
            manage_inventory: true,
            prices: [{ currency_code: "jmd", amount: priceNumber }],
            options: { Default: "Default" },
          },
        ],
      };
      const res = await fetch("/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? `HTTP ${res.status}`);
      }
      toast.success(`Product "${data.product.title}" created`);
      // Reset for the next product.
      setValues(emptyFormValues);
      setTouchedHandle(false);
      setStep("basic");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="p-6 space-y-6">
      <div>
        <Heading level="h1">Add product</Heading>
        <Text size="small" className="text-ui-fg-muted mt-1">
          Three-step wizard for the Onelink catalog. For multi-variant products
          or richer pricing, use the stock Medusa create form.
        </Text>
      </div>

      <ProgressTabs value={step} onValueChange={(v) => setStep(v as Step)}>
        <ProgressTabs.List>
          <ProgressTabs.Trigger value="basic" status={step === "basic" ? "in-progress" : "completed"}>
            Basic info
          </ProgressTabs.Trigger>
          <ProgressTabs.Trigger
            value="media"
            status={step === "media" ? "in-progress" : step === "review" ? "completed" : "not-started"}
          >
            Media &amp; inventory
          </ProgressTabs.Trigger>
          <ProgressTabs.Trigger
            value="review"
            status={step === "review" ? "in-progress" : "not-started"}
          >
            Review
          </ProgressTabs.Trigger>
        </ProgressTabs.List>

        <ProgressTabs.Content value="basic" className="pt-6 space-y-4">
          <Field label="Title" required>
            <Input value={values.title} onChange={set("title")} placeholder="Vuse Go 1000 — Grape Ice" />
          </Field>
          <Field label="Handle (URL slug)" required help="Auto-derived from title; edit if needed.">
            <Input
              value={values.handle}
              onChange={(e) => {
                setTouchedHandle(true);
                set("handle")(e);
              }}
              placeholder="vuse-go-1000-grape-ice"
            />
          </Field>
          <Field label="Brand">
            <Input value={values.brand} onChange={set("brand")} placeholder="Vuse" />
          </Field>
          <Field label="Short description">
            <Textarea
              value={values.description}
              onChange={set("description")}
              rows={3}
              placeholder="Cool grape with a crisp menthol finish."
            />
          </Field>
          <Field label="Category" required>
            <Select value={values.categoryId} onValueChange={(v) => setValues((s) => ({ ...s, categoryId: v }))}>
              <Select.Trigger>
                <Select.Value placeholder="Pick one" />
              </Select.Trigger>
              <Select.Content>
                {categories.map((c) => (
                  <Select.Item key={c.id} value={c.id}>
                    {c.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Field>
          <Field label="Price (JMD)" required help="Whole number — e.g. 2800 for $2,800 JMD.">
            <Input value={values.priceJmd} onChange={set("priceJmd")} placeholder="2800" inputMode="numeric" />
          </Field>
        </ProgressTabs.Content>

        <ProgressTabs.Content value="media" className="pt-6 space-y-4">
          <Field label="Thumbnail URL" required>
            <Input value={values.thumbnail} onChange={set("thumbnail")} placeholder="https://..." />
          </Field>
          <Field label="Gallery URLs" help="One URL per line. Optional.">
            <Textarea
              value={values.gallery}
              onChange={set("gallery")}
              rows={4}
              placeholder={"https://...\nhttps://..."}
            />
          </Field>
          <Field label="Stock count" required>
            <Input value={values.stock} onChange={set("stock")} placeholder="50" inputMode="numeric" />
          </Field>
          <Text size="small" className="text-ui-fg-muted">
            Note: stock is captured here for reference but inventory levels are
            attached separately on the stock-location side. The product is
            created with manage_inventory enabled; set actual on-hand from the
            Inventory tab.
          </Text>
        </ProgressTabs.Content>

        <ProgressTabs.Content value="review" className="pt-6 space-y-4">
          <ReviewRow label="Title" value={values.title} />
          <ReviewRow label="Handle" value={values.handle} />
          <ReviewRow label="Brand" value={values.brand || "—"} />
          <ReviewRow
            label="Category"
            value={categories.find((c) => c.id === values.categoryId)?.name ?? "—"}
          />
          <ReviewRow label="Price" value={`JMD$${priceNumber.toLocaleString()}`} />
          <ReviewRow label="Description" value={values.description || "—"} />
          <ReviewRow label="Thumbnail" value={values.thumbnail} />
          <ReviewRow label="Gallery" value={galleryList.length > 0 ? `${galleryList.length} extra image(s)` : "—"} />
          <ReviewRow label="Stock" value={String(stockNumber)} />
        </ProgressTabs.Content>
      </ProgressTabs>

      {error && (
        <div className="p-3 rounded-md bg-ui-bg-base border border-ui-border-error">
          <Text size="small" className="text-ui-fg-error">{error}</Text>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-ui-border-base">
        <Button variant="secondary" onClick={goBack} disabled={step === "basic" || submitting}>
          <ArrowLeft /> Back
        </Button>
        {step === "review" ? (
          <Button variant="primary" onClick={submit} disabled={submitting}>
            <CheckCircle /> {submitting ? "Creating…" : "Create product"}
          </Button>
        ) : (
          <Button variant="primary" onClick={goNext} disabled={submitting}>
            Next <ArrowRight />
          </Button>
        )}
      </div>
    </Container>
  );
};

function Field({
  label,
  required,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label size="small" weight="plus">
        {label}
        {required && <span className="text-ui-fg-error ml-1">*</span>}
      </Label>
      {children}
      {help && <Text size="xsmall" className="text-ui-fg-muted">{help}</Text>}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-ui-border-base last:border-b-0">
      <Text size="small" className="text-ui-fg-muted">{label}</Text>
      <Text size="small" className="text-ui-fg-base text-right max-w-[60%] truncate" title={value}>
        {value}
      </Text>
    </div>
  );
}

export const config = defineRouteConfig({
  label: "Add product (wizard)",
  icon: Plus,
});

export default NewProductWizardPage;
