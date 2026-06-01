import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx("rounded-xl border border-gray-200 bg-white p-6 shadow-sm", onClick && "cursor-pointer", className)
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={twMerge(clsx("mb-4", className))}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={twMerge(clsx("text-lg font-semibold text-gray-900", className))}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: CardProps) {
  return <div className={twMerge(clsx("", className))}>{children}</div>;
}
