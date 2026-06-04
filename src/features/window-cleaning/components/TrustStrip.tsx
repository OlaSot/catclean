import { BadgeCheck, Headphones, Leaf, Users } from "lucide-react";

const TRUST_ITEMS = [
  {
    title: "Eco-friendly products",
    description: "Safe for your home & pets",
    icon: Leaf,
  },
  {
    title: "Experienced cleaners",
    description: "Trained & background checked",
    icon: Users,
  },
  {
    title: "Satisfaction guaranteed",
    description: "We're not happy until you are",
    icon: BadgeCheck,
  },
  {
    title: "Support 7 days a week",
    description: "We're here for you",
    icon: Headphones,
  },
] as const;

export function TrustStrip() {
  return (
    <div className="grid grid-cols-1 gap-6 border-t border-slate-200/80 pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      {TRUST_ITEMS.map((item) => (
        <div key={item.title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#34597E]/10 text-[#34597E]">
            <item.icon className="h-5 w-5" aria-hidden />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-800">{item.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
