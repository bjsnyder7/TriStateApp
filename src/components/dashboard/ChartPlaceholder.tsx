type ChartPlaceholderProps = {
  title?: string;
  height?: string;
  className?: string;
};

export default function ChartPlaceholder({
  title = "Chart",
  height = "h-64",
  className,
}: ChartPlaceholderProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 ${className ?? ""}`}
    >
      <h2 className="mb-4 text-base font-semibold text-slate-700">{title}</h2>
      <div
        className={`${height} flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50`}
      >
        <p className="text-sm text-slate-400">Chart coming soon</p>
      </div>
    </div>
  );
}
