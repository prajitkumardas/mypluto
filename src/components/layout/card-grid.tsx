import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardGridProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
  columns?: "two" | "three" | "four";
};

const columnsClass = {
  two: "md:grid-cols-2",
  three: "md:grid-cols-2 lg:grid-cols-3",
  four: "md:grid-cols-2 lg:grid-cols-4"
};

export function CardGrid({ children, className, columns = "three", ...props }: CardGridProps) {
  return (
    <div className={cn("mt-10 grid gap-5", columnsClass[columns], className)} {...props}>
      {children}
    </div>
  );
}
