"use client";

import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  useRef,
  useState,
} from "react";

interface OtpInputProps {
  idPrefix: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const OTP_LENGTH = 6;

export function OtpInput({
  idPrefix,
  value,
  disabled = false,
  onChange,
  onBlur,
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState<string[]>(
    toDigits(value)
  );

  function updateDigits(nextDigits: string[]) {
    const nextValue = nextDigits.join("").slice(0, OTP_LENGTH);
    setDigits(toDigits(nextValue));
    onChange(nextValue);
  }

  function focusInput(index: number) {
    window.setTimeout(() => {
      inputRefs.current[index]?.focus();
    }, 0);
  }

  function handleInput(
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const nextRawValue = event.currentTarget.value;
    const nextNumbers = nextRawValue
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!nextNumbers) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      updateDigits(nextDigits);
      return;
    }

    const nextDigits = [...digits];

    nextNumbers.split("").forEach((digit, offset) => {
      const nextIndex = index + offset;

      if (nextIndex < OTP_LENGTH) {
        nextDigits[nextIndex] = digit;
      }
    });

    updateDigits(nextDigits);
    focusInput(Math.min(index + nextNumbers.length, OTP_LENGTH - 1));
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const nextDigits = [...digits];
      nextDigits[index - 1] = "";
      updateDigits(nextDigits);
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pastedValue) {
      return;
    }

    event.preventDefault();
    updateDigits(toDigits(pastedValue));
    focusInput(Math.min(pastedValue.length, OTP_LENGTH) - 1);
  }

  return (
    <div className="grid grid-cols-6 gap-2">
      {digits.map((digit, index) => (
        <input
          key={`${idPrefix}-${index}`}
          ref={(input) => {
            inputRefs.current[index] = input;
          }}
          id={`${idPrefix}-${index}`}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={digit}
          aria-label={`Dígito ${index + 1} del código`}
          className="h-12 rounded-lg border border-input bg-background text-center font-mono text-lg font-semibold text-foreground caret-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
          onBlur={onBlur}
          onChange={(event) => handleInput(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}

function toDigits(value: string) {
  const characters = value
    .replace(/\D/g, "")
    .slice(0, OTP_LENGTH)
    .split("");

  return Array.from(
    { length: OTP_LENGTH },
    (_, index) => characters[index] ?? ""
  );
}
