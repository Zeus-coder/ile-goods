"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { addToCart } from "@/app/actions";
import { QuantityStepper } from "./quantity-stepper";

export function AddToCart({ productId, stock }: { productId: number; stock: number }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  if (stock === 0) {
    return <p className="rounded-md bg-bone px-4 py-3 text-muted">Sold out. The maker is working on the next batch.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} max={stock} onChange={setQuantity} disabled={pending} label="Quantity" />
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await addToCart(productId, quantity);
              setAdded(true);
            })
          }
          className="h-11 flex-1 rounded-md bg-ink-strong px-6 text-[15px] font-medium text-white transition hover:bg-press active:scale-[0.98] disabled:opacity-60 sm:flex-none"
        >
          {pending ? "Adding..." : "Add to bag"}
        </button>
      </div>
      {added && !pending && (
        <p className="flex items-center gap-2 text-[15px] text-sage-ink" role="status">
          <CheckIcon size={18} weight="bold" />
          Added to your bag.
          <Link href="/cart" className="font-medium text-ink-strong underline underline-offset-4">
            View bag
          </Link>
        </p>
      )}
      {stock <= 5 && <p className="text-sm text-sand-ink">Only {stock} left in this batch.</p>}
    </div>
  );
}
