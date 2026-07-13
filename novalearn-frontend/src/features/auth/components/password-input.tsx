"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasswordInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type"
>;

export function PasswordInput({
  className,
  disabled,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        className={`pr-10 ${className ?? ""}`}
        disabled={disabled}
        type={isVisible ? "text" : "password"}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
        disabled={disabled}
        onClick={() => setIsVisible((current) => !current)}
      >
        {isVisible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        <span className="sr-only">
          {isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
        </span>
      </Button>
    </div>
  );
}
