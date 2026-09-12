"use client";

import type { ReactNode } from "react";
import { PlutoButton, type PlutoButtonProps } from "@/components/ui/pluto-button";
import { cn } from "@/lib/utils";
import { requestSubmitToolModal } from "./submit-tool-events";

export function SubmitToolButton(props: Omit<PlutoButtonProps, "href" | "onClick">) {
  return <PlutoButton {...props} onClick={requestSubmitToolModal} type="button" />;
}

export function SubmitToolLink({ children, className }: { children: ReactNode; className?: string }) {
  return <button className={cn(className, "cursor-pointer border-0 bg-transparent text-left font-inherit")} onClick={requestSubmitToolModal} type="button">{children}</button>;
}
