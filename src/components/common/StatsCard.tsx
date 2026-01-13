import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  isLoading?: boolean;
}

const variantStyles = {
  default: "bg-card",
  primary: "bg-primary/5 border-primary/20",
  success: "bg-success/5 border-success/20",
  warning: "bg-warning/5 border-warning/20",
  danger: "bg-destructive/5 border-destructive/20",
};

const iconStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
};

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  isLoading = false,
}: StatsCardProps) => {
  const valueDisplay = isLoading ? "..." : value;
  const subtitleDisplay = isLoading ? "Dang tai..." : subtitle;
  const showTrend = trend && !isLoading;

  return (
    <div
      className={cn(
        "rounded-xl border p-5 card-elevated transition-all hover:scale-[1.02]",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{valueDisplay}</p>
          {subtitleDisplay && <p className="text-xs text-muted-foreground">{subtitleDisplay}</p>}
          {showTrend && (
            <div className="flex items-center gap-1 mt-1">
              <span className={cn("text-xs font-medium", trend.isPositive ? "text-success" : "text-destructive")}>
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">so voi thang truoc</span>
            </div>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconStyles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
