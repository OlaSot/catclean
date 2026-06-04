import type { AdminOrderServiceDetails } from "@/entities/order/admin-order-service-details.types";
import type { AdminOrderOperationalNotes } from "@/entities/order/admin-order-detail.types";
import type { OrderOperationalNotesPublic } from "@/entities/order/order-operational-notes.types";
import { SERVICE_DETAIL_DISPLAY } from "@/entities/order/service-detail-display-config";
import type { ServiceDetailDisplayField } from "@/entities/order/admin-order-service-details.types";
import type { OrderServiceType } from "@/lib/constants/orders";
import { displayValue } from "@/features/orders/lib/format-order-display";
import { useT } from "@/i18n/useT";
import { formatCleaningFrequencyLabel } from "@/lib/orders/booking-product-label";

export type ServiceDetailsAudience = "admin" | "cleaner" | "client";

type OrderServiceDetailsCardProps = {
  serviceLabel: string;
  serviceDetails: AdminOrderServiceDetails | null;
  operationalNotes: OrderOperationalNotesPublic;
  audience: ServiceDetailsAudience;
  /** Admin-only: discount, surcharge, price breakdown. */
  adminOperationalExtras?: Pick<
    AdminOrderOperationalNotes,
    "manualDiscount" | "manualSurcharge" | "priceBreakdown" | "internalNote"
  >;
};

type PriceBreakdownLine = {
  label: string;
  amount?: number;
  value?: number;
};

function BoolBadge({ value }: { value: boolean }) {
  const { t } = useT();
  return value ? (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
      {t("serviceDetails.yes")}
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
      {t("serviceDetails.no")}
    </span>
  );
}

function formatPropertyType(value: unknown): string | null {
  const key = String(value ?? "").trim().toLowerCase();
  if (key === "apartment") return "Apartment";
  if (key === "house") return "House";
  return key ? String(value).trim() : null;
}

function formatFieldValue(
  value: unknown,
  valueType: ServiceDetailDisplayField["valueType"],
  fieldKey?: string
): string | null {
  if (value === null || value === undefined) return null;

  if (fieldKey === "cleaningFrequency") {
    return (
      formatCleaningFrequencyLabel(String(value)) ??
      (String(value).trim() || null)
    );
  }
  if (fieldKey === "propertyType") {
    return formatPropertyType(value);
  }

  if (valueType === "boolean") {
    return typeof value === "boolean" ? (value ? "yes" : "no") : null;
  }

  if (valueType === "number") {
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
    return null;
  }

  if (valueType === "stringArray") {
    if (Array.isArray(value) && value.length > 0) {
      return value.map((item) => String(item)).join(", ");
    }
    return null;
  }

  const text = String(value).trim();
  return text ? text : null;
}

function FieldRow({
  label,
  value,
  valueType,
  fieldKey,
}: {
  label: string;
  value: unknown;
  valueType: ServiceDetailDisplayField["valueType"];
  fieldKey?: string;
}) {
  if (valueType === "boolean") {
    if (typeof value !== "boolean") return null;
    return (
      <div className="flex items-center justify-between gap-4 py-2">
        <dt className="text-sm text-slate-600">{label}</dt>
        <dd>
          <BoolBadge value={value} />
        </dd>
      </div>
    );
  }

  const formatted = formatFieldValue(value, valueType, fieldKey);
  if (formatted === null) return null;

  return (
    <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className="text-sm font-medium text-slate-800 sm:text-right">
        {displayValue(formatted)}
      </dd>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#34597E]">
        {title}
      </h3>
      <dl className="mt-3 divide-y divide-slate-200/60">{children}</dl>
    </div>
  );
}

function fieldHasContent(
  value: unknown,
  valueType: ServiceDetailDisplayField["valueType"],
  fieldKey?: string
): boolean {
  if (valueType === "boolean") return typeof value === "boolean";
  return formatFieldValue(value, valueType, fieldKey) !== null;
}

function collectFieldRows(
  serviceDetails: AdminOrderServiceDetails,
  categories: ServiceDetailDisplayField["category"][] | null,
  t: (key: string) => string
) {
  const config = SERVICE_DETAIL_DISPLAY[serviceDetails.type as OrderServiceType];
  if (!config) return [];

  const data = serviceDetails.data as Record<string, unknown>;
  const allowed = categories ? new Set(categories) : null;

  return config
    .filter((field) => !allowed || allowed.has(field.category))
    .map((field) => {
      const value = data[field.key];
      if (!fieldHasContent(value, field.valueType, field.key)) return null;
      return (
        <FieldRow
          key={field.key}
          label={t(`serviceDetails.field.${field.key}`) !== `serviceDetails.field.${field.key}` ? t(`serviceDetails.field.${field.key}`) : field.label}
          value={value}
          valueType={field.valueType}
          fieldKey={field.key}
        />
      );
    })
    .filter((row): row is React.ReactElement => row !== null);
}

function renderServiceFields(
  serviceDetails: AdminOrderServiceDetails,
  audience: ServiceDetailsAudience,
  t: (key: string) => string
) {
  if (audience === "client") {
    const rows = collectFieldRows(serviceDetails, null, t);
    if (rows.length === 0) return null;
    return <DetailSection title={t("serviceDetails.yourService")}>{rows}</DetailSection>;
  }

  const pricing = collectFieldRows(serviceDetails, ["pricing"], t);
  const cleaner = collectFieldRows(serviceDetails, ["cleaner"], t);
  const general = collectFieldRows(serviceDetails, ["general"], t);

  const pricingTitle =
    audience === "admin" ? t("serviceDetails.pricingRelevant") : t("serviceDetails.scopeAndExtras");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {general.length > 0 ? (
        <DetailSection title={t("serviceDetails.general")}>{general}</DetailSection>
      ) : null}
      {pricing.length > 0 ? (
        <DetailSection title={pricingTitle}>{pricing}</DetailSection>
      ) : null}
      {cleaner.length > 0 ? (
        <DetailSection title={t("serviceDetails.onSite")}>{cleaner}</DetailSection>
      ) : null}
    </div>
  );
}

function OperationalNotesBlock({
  notes,
  audience,
  adminExtras,
}: {
  notes: OrderOperationalNotesPublic;
  audience: ServiceDetailsAudience;
  adminExtras?: OrderServiceDetailsCardProps["adminOperationalExtras"];
}) {
  const { t } = useT();
  const rows: { label: string; value: string | null }[] = [
    { label: t("serviceDetails.accessNotes"), value: notes.accessNotes },
    { label: t("serviceDetails.petsInfo"), value: notes.petsInfo },
    { label: t("serviceDetails.suppliesNote"), value: notes.suppliesNote },
    { label: t("serviceDetails.equipmentNote"), value: notes.equipmentNote },
  ];

  const visible = rows.filter((r) => r.value);
  const hasAdminPricing =
    audience === "admin" &&
    adminExtras &&
    (adminExtras.manualDiscount > 0 ||
      adminExtras.manualSurcharge > 0 ||
      Boolean(adminExtras.priceBreakdown));

  if (visible.length === 0 && !hasAdminPricing) return null;

  const title =
    audience === "client"
      ? t("serviceDetails.notesForVisit")
      : audience === "cleaner"
        ? t("serviceDetails.operationalNotes")
        : t("serviceDetails.orderNotes");

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#34597E]">
        {title}
      </h3>
      <dl className="mt-3 space-y-2">
        {visible.map((row) => (
          <div key={row.label}>
            <dt className="text-sm text-slate-600">{row.label}</dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">{row.value}</dd>
          </div>
        ))}
        {audience === "admin" && adminExtras && adminExtras.manualDiscount > 0 ? (
          <div className="flex justify-between text-sm">
            <dt className="text-slate-600">{t("serviceDetails.manualDiscount")}</dt>
            <dd className="font-medium text-slate-800">
              −{adminExtras.manualDiscount} EUR
            </dd>
          </div>
        ) : null}
        {audience === "admin" && adminExtras && adminExtras.manualSurcharge > 0 ? (
          <div className="flex justify-between text-sm">
            <dt className="text-slate-600">{t("serviceDetails.manualSurcharge")}</dt>
            <dd className="font-medium text-slate-800">
              +{adminExtras.manualSurcharge} EUR
            </dd>
          </div>
        ) : null}
      </dl>
      {audience === "admin" && adminExtras?.priceBreakdown ? (
        <PriceBreakdownView breakdown={adminExtras.priceBreakdown} />
      ) : null}
    </div>
  );
}

function readAmount(line: PriceBreakdownLine): number | null {
  const raw = line.amount ?? line.value;
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  return Math.round(raw * 100) / 100;
}

function PriceBreakdownView({
  breakdown,
}: {
  breakdown: Record<string, unknown>;
}) {
  const { t } = useT();
  const linesRaw = (breakdown as { lines?: unknown }).lines;
  const lines = Array.isArray(linesRaw)
    ? (linesRaw.filter(
        (item): item is PriceBreakdownLine =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { label?: unknown }).label === "string"
      ) as PriceBreakdownLine[])
    : [];

  if (lines.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs text-slate-500">
        {t("serviceDetails.priceBreakdownUnavailable")}
      </div>
    );
  }

  const totalFromLines = lines.reduce((sum, line) => {
    const amount = readAmount(line);
    return sum + (amount ?? 0);
  }, 0);

  return (
    <div className="mt-4 rounded-xl border border-slate-200/80 bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {t("serviceDetails.priceBreakdown")}
      </p>
      <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
        {lines.map((line, index) => {
          const amount = readAmount(line);
          return (
            <li key={`${line.label}-${index}`} className="flex items-start justify-between gap-3">
              <span className="min-w-0 text-slate-600">{line.label}</span>
              <span className="shrink-0 font-medium text-slate-800">
                {amount === null ? "—" : `${amount.toFixed(2)} EUR`}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 border-t border-slate-200 pt-2 text-sm font-semibold text-slate-800">
        <div className="flex items-center justify-between">
          <span>{t("serviceDetails.total")}</span>
          <span>{totalFromLines.toFixed(2)} EUR</span>
        </div>
      </div>
    </div>
  );
}

export default function OrderServiceDetailsCard({
  serviceLabel,
  serviceDetails,
  operationalNotes,
  audience,
  adminOperationalExtras,
}: OrderServiceDetailsCardProps) {
  const { t } = useT();
  const hasService = Boolean(serviceDetails);
  const hasPublicNotes =
    operationalNotes.accessNotes ||
    operationalNotes.petsInfo ||
    operationalNotes.suppliesNote ||
    operationalNotes.equipmentNote;

  const hasAdminExtras =
    audience === "admin" &&
    adminOperationalExtras &&
    (adminOperationalExtras.manualDiscount > 0 ||
      adminOperationalExtras.manualSurcharge > 0 ||
      Boolean(adminOperationalExtras.priceBreakdown));

  if (!hasService && !hasPublicNotes && !hasAdminExtras) {
    return (
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("orders.serviceDetails")}
        </h2>
        <p className="mt-4 text-sm text-slate-500">
          {t("serviceDetails.noDetailsYet")}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("orders.serviceDetails")}
        </h2>
        <span className="inline-flex items-center rounded-full bg-[#EEF4FA] px-3 py-1 text-xs font-semibold text-[#34597E] ring-1 ring-[#C5D9EB]">
          {serviceLabel}
        </span>
      </div>

      <div className="mt-6 space-y-6">
        <OperationalNotesBlock
          notes={operationalNotes}
          audience={audience}
          adminExtras={adminOperationalExtras}
        />
        {serviceDetails ? renderServiceFields(serviceDetails, audience, t) : null}
      </div>
    </section>
  );
}
