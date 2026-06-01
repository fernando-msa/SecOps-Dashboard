import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "critical" | "high" | "medium" | "low" | "default" | "success" | "warning";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          {
            "bg-red-100 text-red-800": variant === "critical",
            "bg-orange-100 text-orange-800": variant === "high",
            "bg-yellow-100 text-yellow-800": variant === "medium",
            "bg-green-100 text-green-800": variant === "low",
            "bg-gray-100 text-gray-800": variant === "default",
            "bg-emerald-100 text-emerald-800": variant === "success",
            "bg-amber-100 text-amber-800": variant === "warning",
          },
          className
        )
      )}
    >
      {children}
    </span>
  );
}
