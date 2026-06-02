"use client";

type Props = {
  accessInstructions: string;
  parkingElevatorNote: string;
  additionalComment: string;
  onChange: (next: {
    accessInstructions: string;
    parkingElevatorNote: string;
    additionalComment: string;
  }) => void;
};

function Field(props: { label: string; value: string; onChange: (next: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-600">{props.label}</span>
      <textarea
        rows={3}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 outline-none focus:border-[#34597E]"
      />
    </label>
  );
}

export function StepVisitDetails({
  accessInstructions,
  parkingElevatorNote,
  additionalComment,
  onChange,
}: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">
        Anything the cleaner should know?
      </h2>
      <Field
        label="Access instructions"
        value={accessInstructions}
        onChange={(value) => onChange({ accessInstructions: value, parkingElevatorNote, additionalComment })}
      />
      <Field
        label="Parking / elevator note"
        value={parkingElevatorNote}
        onChange={(value) => onChange({ accessInstructions, parkingElevatorNote: value, additionalComment })}
      />
      <Field
        label="Additional comment"
        value={additionalComment}
        onChange={(value) => onChange({ accessInstructions, parkingElevatorNote, additionalComment: value })}
      />
    </div>
  );
}
