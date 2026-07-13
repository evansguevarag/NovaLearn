"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type SwitchProps = Omit<
  React.ComponentProps<"button">,
  "onChange"
> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function Switch({
  checked,
  onCheckedChange,
  className,
  disabled,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        checked
          ? "bg-primary"
          : "bg-muted-foreground/25",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={() => {
        if (!disabled) {
          onCheckedChange(!checked);
        }
      }}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-background shadow-sm transition-transform",
          checked
            ? "translate-x-5"
            : "translate-x-0"
        )}
      />
    </button>
  );
}

export { Switch };
