import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] type-label-md transition duration-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[var(--border-subtle)] disabled:bg-[rgba(255,255,255,0.05)] disabled:text-[var(--text-disabled)] [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        outline:
          "border border-[var(--border-strong)] bg-transparent text-[var(--text-primary)] hover:border-[var(--text-brand)] hover:text-[var(--text-brand)] active:translate-y-px",
        ghost: "border border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--background-interactive)] hover:text-[var(--text-primary)]",
        lime: "border border-transparent bg-[var(--text-brand)] text-[var(--text-inverse)] hover:bg-[#d8ff82] active:translate-y-px",
        destructive: "border border-[rgba(255,138,138,0.42)] bg-[rgba(255,138,138,0.12)] text-[var(--status-danger)] hover:bg-[rgba(255,138,138,0.18)]",
        link: "min-h-0 rounded-[var(--radius-pill)] border border-transparent bg-transparent px-0 text-[var(--color-pluto-purple-300)] hover:text-[var(--text-primary)]"
      },
      size: {
        sm: "min-h-9 px-3.5 type-label-sm",
        default: "min-h-11 px-5",
        lg: "min-h-[3.25rem] px-6 type-label-lg",
        icon: "h-11 min-h-11 w-11 p-0"
      }
    },
    defaultVariants: {
      variant: "ghost",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, children, className, disabled, loading = false, size, variant, ...props }, ref) => {
    const classNames = cn(buttonVariants({ variant, size, className }));

    if (asChild) {
      return (
        <Slot
          aria-busy={loading || undefined}
          aria-disabled={disabled || undefined}
          className={classNames}
          data-loading={loading ? "true" : undefined}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        aria-busy={loading || undefined}
        className={classNames}
        data-loading={loading ? "true" : undefined}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
