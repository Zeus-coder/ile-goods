"use client";

import { MinusIcon, PlusIcon } from "@phosphor-icons/react";

export function QuantityStepper({
  value,
  max,
  onChange,
  disabled,
  label,
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="inline-flex h-11 items-center rounded-md border border-line bg-white" role="group" aria-label={label}>
      <button
        type="button"
        className="grid size-11 place-items-center text-ink hover:bg-bone disabled:text-line"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= 1}
        aria-label="Decrease quantity"
      >
        <MinusIcon size={16} weight="bold" />
      </button>
      <span className="w-8 text-center font-mono text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="grid size-11 place-items-center text-ink hover:bg-bone disabled:text-line"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <PlusIcon size={16} weight="bold" />
      </button>
    </div>
  );
}
