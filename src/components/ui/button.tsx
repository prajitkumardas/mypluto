import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 type-label-md transition disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        primary:
          "bg-violet-600 text-white shadow-card hover:bg-violet-500 active:translate-y-px",
        secondary:
          "border border-neutral-200 bg-white text-neutral-900 shadow-card hover:border-violet-500 hover:text-violet-600",
        outline:
          "border border-white/24 bg-white/8 text-white hover:border-lime-400 hover:text-lime-400",
        ghost: "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
        lime: "bg-lime-400 text-ink-950 hover:bg-lime-100"
      },
      size: {
        default: "h-11",
        sm: "h-10 px-4",
        lg: "h-14 px-6 type-label-lg",
        icon: "h-11 w-11 p-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
