import { AlertTriangle, SearchX } from "lucide-react";
import { PlutoButton } from "@/components/ui/pluto-button";

type StatePanelProps = {
  title: string;
  copy: string;
  action: string;
  secondary: string;
  actionHref?: string;
  actionOnClick?: () => void;
  secondaryHref?: string;
  tone?: "empty" | "error";
};

export function StatePanel({
  title,
  copy,
  action,
  secondary,
  actionHref,
  actionOnClick,
  secondaryHref,
  tone = "empty"
}: StatePanelProps) {
  const Icon = tone === "error" ? AlertTriangle : SearchX;

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-card">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-100 text-violet-600">
        <Icon aria-hidden="true" className="h-7 w-7" />
      </div>
      <h2 className="mt-5 type-h2 text-neutral-900">{title}</h2>
      <p className="mt-2 max-w-2xl type-body-sm text-neutral-700">{copy}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {actionHref ? (
          <PlutoButton href={actionHref} showArrow variant="primary">
            {action}
          </PlutoButton>
        ) : (
          <PlutoButton onClick={actionOnClick} showArrow variant="primary">
            {action}
          </PlutoButton>
        )}
        {secondaryHref ? (
          <PlutoButton href={secondaryHref} variant="secondary">{secondary}</PlutoButton>
        ) : (
          <PlutoButton variant="secondary">{secondary}</PlutoButton>
        )}
      </div>
    </div>
  );
}
