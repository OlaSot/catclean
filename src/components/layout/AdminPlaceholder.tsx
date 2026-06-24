type AdminPlaceholderProps = {
  title: string;
  description: string;
};

export default function AdminPlaceholder({
  title,
  description,
}: AdminPlaceholderProps) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-800">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
        <p className="text-sm font-medium text-slate-600">Скоро здесь будет раздел</p>
        <p className="mt-2 text-sm text-slate-400">
          Этот раздел находится в разработке.
        </p>
      </div>
    </div>
  );
}
