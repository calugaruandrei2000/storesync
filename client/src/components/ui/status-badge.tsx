import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "error" | "neutral" | "info";

const styles: Record<StatusType, string> = {
  success: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  error: "bg-red-100 text-red-700 border-red-200",
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
};

export function StatusBadge({ status, type = "neutral", className }: { status: string; type?: StatusType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        styles[type],
        className
      )}
    >
      {status}
    </span>
  );
}
