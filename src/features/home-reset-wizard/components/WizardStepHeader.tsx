type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
};

export function WizardStepHeader({ eyebrow, title, subtitle, className = "" }: Props) {
  return (
    <header className={`max-w-xl space-y-3 ${className}`.trim()}>
      {eyebrow ? (
        <p className="text-sm font-medium tracking-wide text-[#5B8DB8]">{eyebrow}</p>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-[2.125rem] sm:leading-tight">
        {title}
      </h1>
      {subtitle ? (
        <p className="text-base leading-relaxed text-slate-500">{subtitle}</p>
      ) : null}
    </header>
  );
}
