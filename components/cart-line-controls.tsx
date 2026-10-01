"use client";

import { useTransition } from "react";
import { setCartQuantity } from "@/app/actions";
import { QuantityStepper } from "./quantity-stepper";

export function CartLineControls({
  productId,
  quantity,
  stock,
  name,
}: {
  productId: number;
  quantity: number;
  stock: number;
  name: string;
}) {
  const [pending, startTransition] = useTransition();
  const update = (next: number) => startTransition(() => setCartQuantity(productId, next));

  return (
    <div className={`flex items-center gap-4 ${pending ? "opacity-60" : ""}`}>
      <QuantityStepper value={quantity} max={Math.max(stock, quantity)} onChange={update} disabled={pending} label={`Quantity of ${name}`} />
      <button
        type="button"
        onClick={() => update(0)}
        disabled={pending}
        className="text-sm text-muted underline underline-offset-4 hover:text-rose-ink"
      >
        Remove
      </button>
    </div>
  );
}
