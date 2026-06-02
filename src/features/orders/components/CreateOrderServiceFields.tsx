"use client";

import { FormField, inputClassName } from "@/components/ui/FormField";
import type { CreateOrderServiceDetailsForm } from "@/features/orders/types/create-order-service-details.types";

type Props = {
  serviceType: string;
  details: CreateOrderServiceDetailsForm;
  fieldErrors: Record<string, string>;
  onChange: (patch: Partial<CreateOrderServiceDetailsForm>) => void;
};

function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-[#34597E] focus:ring-[#5B8DB8]/30"
      />
      {label}
    </label>
  );
}

export default function CreateOrderServiceFields({
  serviceType,
  details,
  fieldErrors,
  onChange,
}: Props) {
  if (serviceType === "regular_cleaning") {
    return (
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          label="Property size (m²)"
          htmlFor="propertySizeM2"
          error={fieldErrors["serviceDetails.propertySizeM2"]}
          hint="Primary field for price and duration"
        >
          <input
            id="propertySizeM2"
            type="number"
            min="1"
            step="1"
            className={inputClassName}
            value={details.propertySizeM2}
            onChange={(e) => onChange({ propertySizeM2: e.target.value })}
          />
        </FormField>

        <FormField label="Cleaning intensity" htmlFor="cleaningIntensity">
          <select
            id="cleaningIntensity"
            className={inputClassName}
            value={details.cleaningIntensity}
            onChange={(e) =>
              onChange({
                cleaningIntensity: e.target.value as "standard" | "deep",
              })
            }
          >
            <option value="standard">Standard</option>
            <option value="deep">Deep</option>
          </select>
        </FormField>

        <FormField label="Rooms (optional)" htmlFor="roomsCount">
          <input
            id="roomsCount"
            type="number"
            min="0"
            className={inputClassName}
            value={details.roomsCount}
            onChange={(e) => onChange({ roomsCount: e.target.value })}
          />
        </FormField>

        <FormField label="Bathrooms (optional)" htmlFor="bathroomsCount">
          <input
            id="bathroomsCount"
            type="number"
            min="0"
            className={inputClassName}
            value={details.bathroomsCount}
            onChange={(e) => onChange({ bathroomsCount: e.target.value })}
          />
        </FormField>

        <div className="md:col-span-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CheckboxField
            id="ovenCleaning"
            label="Oven cleaning (+€25)"
            checked={details.ovenCleaning}
            onChange={(v) => onChange({ ovenCleaning: v })}
          />
          <CheckboxField
            id="fridgeCleaning"
            label="Fridge cleaning (+€20)"
            checked={details.fridgeCleaning}
            onChange={(v) => onChange({ fridgeCleaning: v })}
          />
          <CheckboxField
            id="insideCabinets"
            label="Inside cabinets (+€30)"
            checked={details.insideCabinets}
            onChange={(v) => onChange({ insideCabinets: v })}
          />
          <CheckboxField
            id="balconyIncluded"
            label="Balcony (+€20)"
            checked={details.balconyIncluded}
            onChange={(v) => onChange({ balconyIncluded: v })}
          />
          <CheckboxField
            id="hasPets"
            label="Pets (+€15)"
            checked={details.hasPets}
            onChange={(v) => onChange({ hasPets: v })}
          />
        </div>
      </div>
    );
  }

  if (serviceType === "move_in_out") {
    return (
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          label="Property size (m²)"
          htmlFor="propertySizeM2"
          error={fieldErrors["serviceDetails.propertySizeM2"]}
        >
          <input
            id="propertySizeM2"
            type="number"
            min="1"
            className={inputClassName}
            value={details.propertySizeM2}
            onChange={(e) => onChange({ propertySizeM2: e.target.value })}
          />
        </FormField>

        <FormField label="Package" htmlFor="packageType">
          <select
            id="packageType"
            className={inputClassName}
            value={details.packageType}
            onChange={(e) =>
              onChange({
                packageType: e.target.value as "standard" | "premium",
              })
            }
          >
            <option value="standard">Standard (€3.5/m²)</option>
            <option value="premium">Premium (€4.5/m²)</option>
          </select>
        </FormField>

        <div className="md:col-span-2">
          <CheckboxField
            id="emptyApartment"
            label="Empty apartment"
            checked={details.emptyApartment}
            onChange={(v) => onChange({ emptyApartment: v })}
          />
        </div>

        <div className="md:col-span-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CheckboxField
            id="moveOven"
            label="Oven cleaning"
            checked={details.ovenCleaning}
            onChange={(v) => onChange({ ovenCleaning: v })}
          />
          <CheckboxField
            id="moveFridge"
            label="Fridge cleaning"
            checked={details.fridgeCleaning}
            onChange={(v) => onChange({ fridgeCleaning: v })}
          />
          <CheckboxField
            id="moveCabinets"
            label="Inside cabinets"
            checked={details.insideCabinets}
            onChange={(v) => onChange({ insideCabinets: v })}
          />
          <CheckboxField
            id="moveWindows"
            label="Windows inside"
            checked={details.windowsInside}
            onChange={(v) => onChange({ windowsInside: v })}
          />
          <CheckboxField
            id="moveBalcony"
            label="Balcony"
            checked={details.balconyIncluded}
            onChange={(v) => onChange({ balconyIncluded: v })}
          />
        </div>
      </div>
    );
  }

  if (serviceType === "office_cleaning") {
    return (
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          label="Office size (m²)"
          htmlFor="officeSizeM2"
          error={fieldErrors["serviceDetails.officeSizeM2"]}
        >
          <input
            id="officeSizeM2"
            type="number"
            min="1"
            className={inputClassName}
            value={details.officeSizeM2}
            onChange={(e) => onChange({ officeSizeM2: e.target.value })}
          />
        </FormField>

        <FormField label="Workstations (optional)" htmlFor="workstationsCount">
          <input
            id="workstationsCount"
            type="number"
            min="0"
            className={inputClassName}
            value={details.workstationsCount}
            onChange={(e) => onChange({ workstationsCount: e.target.value })}
          />
        </FormField>

        <FormField label="Bathrooms (optional)" htmlFor="officeBathrooms">
          <input
            id="officeBathrooms"
            type="number"
            min="0"
            className={inputClassName}
            value={details.bathroomsCount}
            onChange={(e) => onChange({ bathroomsCount: e.target.value })}
          />
        </FormField>
      </div>
    );
  }

  return (
    <p className="text-sm text-slate-500">
      Auto-pricing is not available for this service type. Enter the estimated
      price manually below.
    </p>
  );
}
