import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { verificationTone } from "@/lib/plutos-library";

export function LibraryBadge({ status }: { status: string }) {
  const tone = verificationTone(status);
  const Icon = tone === "success" ? CheckCircle2 : tone === "warning" ? AlertTriangle : HelpCircle;

  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 type-label-sm",
        tone === "success" && "bg-[#E3F8EC] text-[#157A4A]",
        tone === "warning" && "bg-[#FFF3D1] text-[#976500]",
        tone === "danger" && "bg-[#FFE8E8] text-[#C33838]",
        tone === "neutral" && "bg-neutral-100 text-neutral-700"
      )}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}
