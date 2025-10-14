interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="mb-6 space-y-2">
      <h1 className="text-3xl font-semibold text-primary sm:text-4xl">
        {title}
      </h1>
      {subtitle && <p className="text-sm text-subtle">{subtitle}</p>}
    </div>
  );
}
