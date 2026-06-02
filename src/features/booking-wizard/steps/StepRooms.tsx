"use client";

type Props = {
  roomsCount: number;
  bathroomsCount: number;
  kitchenCount: number;
  hallwayCount: number | null;
  onChange: (next: {
    roomsCount: number;
    bathroomsCount: number;
    kitchenCount: number;
    hallwayCount: number | null;
  }) => void;
};

function NumberField(props: {
  label: string;
  value: number | null;
  min?: number;
  onChange: (next: number | null) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-600">{props.label}</span>
      <input
        type="number"
        min={props.min ?? 0}
        value={props.value ?? ""}
        onChange={(e) => props.onChange(e.target.value ? Number(e.target.value) : null)}
        className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 outline-none transition focus:border-[#34597E]"
      />
    </label>
  );
}

export function StepRooms(props: Props) {
  const { roomsCount, bathroomsCount, kitchenCount, hallwayCount, onChange } = props;
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">Tell us about the rooms</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <NumberField
          label="Rooms"
          value={roomsCount}
          min={1}
          onChange={(roomsCount) =>
            onChange({
              roomsCount: roomsCount ?? 1,
              bathroomsCount,
              kitchenCount,
              hallwayCount,
            })
          }
        />
        <NumberField
          label="Bathrooms"
          value={bathroomsCount}
          min={1}
          onChange={(bathroomsCount) =>
            onChange({
              roomsCount,
              bathroomsCount: bathroomsCount ?? 1,
              kitchenCount,
              hallwayCount,
            })
          }
        />
        <NumberField
          label="Kitchen count"
          value={kitchenCount}
          min={1}
          onChange={(kitchenCount) =>
            onChange({
              roomsCount,
              bathroomsCount,
              kitchenCount: kitchenCount ?? 1,
              hallwayCount,
            })
          }
        />
        <NumberField
          label="Hallway count (optional)"
          value={hallwayCount}
          onChange={(hallwayCount) =>
            onChange({
              roomsCount,
              bathroomsCount,
              kitchenCount,
              hallwayCount,
            })
          }
        />
      </div>
    </div>
  );
}
