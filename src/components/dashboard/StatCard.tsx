type TrendDirection = "up" | "down" | "neutral";

type StatCardProps = {
  label: string;
  value: string;
  trend?: {
    direction: TrendDirection;
    label: string;
  };
  icon?: React.FC<{ className?: string }>;
};

const trendClasses: Record<TrendDirection, string> = {
  up: "text-green-600",
  down: "text-red-500",
  neutral: "text-slate-500",
};

export default function StatCard({
  label,
  value,
  trend,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {Icon && <Icon className="h-5 w-5 text-slate-400" />}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      {trend && (
        <p className={`mt-2 text-sm ${trendClasses[trend.direction]}`}>
          {trend.label}
        </p>
      )}
    </div>
  );
}
