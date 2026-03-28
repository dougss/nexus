type Props = {
  value: number;
  label: string;
  color?: "primary" | "success" | "warning";
};

const colorMap = {
  primary: "text-primary",
  success: "text-chart-2",
  warning: "text-chart-3",
};

export function StatBadge({ value, label, color = "primary" }: Props) {
  return (
    <div className="flex items-baseline gap-1.5 text-sm text-muted-foreground">
      <span className={`font-mono text-xl font-semibold ${colorMap[color]}`}>
        {value}
      </span>
      {label}
    </div>
  );
}
