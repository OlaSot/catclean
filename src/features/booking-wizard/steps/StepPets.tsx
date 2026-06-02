"use client";

import type { HomeResetPetHairLevel, HomeResetPetsOption } from "../booking-wizard.types";

type Props = {
  petsOption: HomeResetPetsOption;
  petHairLevel: HomeResetPetHairLevel;
  petsInfo: string;
  onChange: (next: {
    petsOption: HomeResetPetsOption;
    petHairLevel: HomeResetPetHairLevel;
    petsInfo: string;
  }) => void;
};

const PETS: Array<{ id: HomeResetPetsOption; label: string }> = [
  { id: "no_pets", label: "No pets" },
  { id: "cat", label: "Cat" },
  { id: "dog", label: "Dog" },
  { id: "multiple", label: "Multiple pets" },
];

const HAIR: HomeResetPetHairLevel[] = ["low", "medium", "high"];

export function StepPets({ petsOption, petHairLevel, petsInfo, onChange }: Props) {
  const hasPets = petsOption !== "no_pets";

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">Do you have pets at home?</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PETS.map((item) => {
          const selected = item.id === petsOption;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange({ petsOption: item.id, petHairLevel, petsInfo })}
              className={`rounded-2xl border px-4 py-3 text-left font-semibold transition ${
                selected
                  ? "border-[#34597E] bg-[#34597E]/10 text-[#34597E]"
                  : "border-slate-200 bg-white/90 text-slate-700"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {hasPets ? (
        <div className="space-y-3 rounded-2xl border border-white/70 bg-white/75 p-4">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-600">Pet hair level</p>
            <div className="flex gap-2">
              {HAIR.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ petsOption, petHairLevel: value, petsInfo })}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                    petHairLevel === value
                      ? "border-[#34597E] bg-[#34597E]/10 text-[#34597E]"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Pets info (optional)</span>
            <textarea
              rows={3}
              value={petsInfo}
              onChange={(event) =>
                onChange({
                  petsOption,
                  petHairLevel,
                  petsInfo: event.target.value,
                })
              }
              className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 outline-none focus:border-[#34597E]"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
