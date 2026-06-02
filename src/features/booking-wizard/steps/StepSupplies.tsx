"use client";

type Props = {
  suppliesChoice: "have_supplies" | "bring_supplies";
  vacuumChoice: "have_vacuum" | "bring_vacuum";
  onChange: (next: {
    suppliesChoice: "have_supplies" | "bring_supplies";
    vacuumChoice: "have_vacuum" | "bring_vacuum";
  }) => void;
};

function ToggleCard(props: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`rounded-2xl border px-4 py-3 text-left font-semibold transition ${
        props.selected
          ? "border-[#34597E] bg-[#34597E]/10 text-[#34597E]"
          : "border-slate-200 bg-white/90 text-slate-700"
      }`}
    >
      {props.label}
    </button>
  );
}

export function StepSupplies({ suppliesChoice, vacuumChoice, onChange }: Props) {
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">
        What should the cleaner bring?
      </h2>
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-600">Cleaning supplies</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ToggleCard
            label="I have cleaning supplies"
            selected={suppliesChoice === "have_supplies"}
            onClick={() => onChange({ suppliesChoice: "have_supplies", vacuumChoice })}
          />
          <ToggleCard
            label="Cleaner should bring supplies"
            selected={suppliesChoice === "bring_supplies"}
            onClick={() => onChange({ suppliesChoice: "bring_supplies", vacuumChoice })}
          />
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-600">Vacuum</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ToggleCard
            label="I have a vacuum"
            selected={vacuumChoice === "have_vacuum"}
            onClick={() => onChange({ suppliesChoice, vacuumChoice: "have_vacuum" })}
          />
          <ToggleCard
            label="Cleaner should bring vacuum"
            selected={vacuumChoice === "bring_vacuum"}
            onClick={() => onChange({ suppliesChoice, vacuumChoice: "bring_vacuum" })}
          />
        </div>
      </div>
    </div>
  );
}
