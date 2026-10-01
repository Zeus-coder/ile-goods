"use client";

import { useActionState, useState } from "react";
import { BankIcon, CheckIcon, LockSimpleIcon, MoneyIcon } from "@phosphor-icons/react";
import { placeOrder, type CheckoutState } from "@/app/actions";
import { checkoutSchema, type CheckoutField } from "@/lib/checkout-schema";
import { NIGERIAN_STATES } from "@/lib/states";

const inputClass =
  "mt-1.5 block h-12 w-full rounded-md border bg-white px-3.5 text-[16px] text-ink-strong outline-none transition placeholder:text-[#b3b2ae] focus:border-ink-strong";

function Field({
  name,
  label,
  hint,
  error,
  valid,
  children,
}: {
  name: CheckoutField;
  label: string;
  hint?: string;
  error?: string;
  valid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="flex items-center justify-between text-[15px] font-medium text-ink-strong">
        {label}
        {valid && !error && <CheckIcon size={16} weight="bold" className="text-sage-ink" aria-label="Looks good" />}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-rose-ink">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function CheckoutForm({ defaults, total }: { defaults: Partial<Record<CheckoutField, string>>; total: string }) {
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});
  const [clientErrors, setClientErrors] = useState<Partial<Record<CheckoutField, string>>>({});
  const [valid, setValid] = useState<Partial<Record<CheckoutField, boolean>>>({});
  const [payment, setPayment] = useState(state.values?.paymentMethod ?? "pay_on_delivery");

  // Server errors win until the shopper edits that field again.
  const errors = { ...state.fieldErrors, ...clientErrors };
  const value = (name: CheckoutField) => state.values?.[name] ?? defaults[name] ?? "";

  function validate(name: CheckoutField, raw: string) {
    const shape = checkoutSchema.shape[name];
    const result = shape.safeParse(name === "deliveryNotes" ? raw || undefined : raw);
    setClientErrors((e) => ({ ...e, [name]: result.success ? undefined : result.error.issues[0]?.message }));
    setValid((v) => ({ ...v, [name]: result.success && raw.trim() !== "" }));
  }

  const blur = (name: CheckoutField) => ({
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => validate(name, e.target.value),
    "aria-invalid": Boolean(errors[name]) || undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  const border = (name: CheckoutField) => (errors[name] ? "border-rose-ink" : "border-line");

  return (
    <form action={formAction} noValidate className="space-y-10">
      {state.formError && (
        <div role="alert" className="rounded-md bg-rose px-4 py-3 text-[15px] text-rose-ink">
          {state.formError}
        </div>
      )}

      <fieldset className="space-y-5">
        <legend className="mb-5 text-lg font-medium text-ink-strong">Contact</legend>
        <Field name="email" label="Email" hint="We'll send your receipt and delivery updates here." error={errors.email} valid={valid.email}>
          <input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com"
            defaultValue={value("email")} className={`${inputClass} ${border("email")}`} {...blur("email")} />
        </Field>
        <Field name="phone" label="Phone" hint="The rider will call this number on delivery day." error={errors.phone} valid={valid.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="0803 123 4567"
            defaultValue={value("phone")} className={`${inputClass} ${border("phone")}`} {...blur("phone")} />
        </Field>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-5 text-lg font-medium text-ink-strong">Delivery address</legend>
        <Field name="fullName" label="Full name" error={errors.fullName} valid={valid.fullName}>
          <input id="fullName" name="fullName" autoComplete="name" placeholder="Adaeze Okonkwo"
            defaultValue={value("fullName")} className={`${inputClass} ${border("fullName")}`} {...blur("fullName")} />
        </Field>
        <Field name="address" label="Street address" error={errors.address} valid={valid.address}>
          <input id="address" name="address" autoComplete="street-address" placeholder="14 Adeola Odeku Street, Flat 3"
            defaultValue={value("address")} className={`${inputClass} ${border("address")}`} {...blur("address")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="city" label="Town or city" error={errors.city} valid={valid.city}>
            <input id="city" name="city" autoComplete="address-level2" placeholder="Victoria Island"
              defaultValue={value("city")} className={`${inputClass} ${border("city")}`} {...blur("city")} />
          </Field>
          <Field name="state" label="State" error={errors.state} valid={valid.state}>
            <select id="state" name="state" autoComplete="address-level1" defaultValue={value("state")}
              className={`${inputClass} ${border("state")} appearance-none`} {...blur("state")}>
              <option value="" disabled>Choose a state</option>
              {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <Field name="deliveryNotes" label="Delivery notes (optional)" hint="Gate code, landmark, best time to call." error={errors.deliveryNotes}>
          <textarea id="deliveryNotes" name="deliveryNotes" rows={2} defaultValue={value("deliveryNotes")}
            className={`${inputClass} ${border("deliveryNotes")} h-auto py-3`} {...blur("deliveryNotes")} />
        </Field>
      </fieldset>

      <fieldset>
        <legend className="mb-5 text-lg font-medium text-ink-strong">Payment</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { id: "pay_on_delivery", title: "Pay on delivery", body: "Cash or card to the rider when it arrives.", Icon: MoneyIcon },
            { id: "bank_transfer", title: "Bank transfer", body: "We email account details. Ships once paid.", Icon: BankIcon },
          ].map(({ id, title, body, Icon }) => (
            <label key={id}
              className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${payment === id ? "border-ink-strong bg-white" : "border-line bg-white hover:border-[#cfcfcc]"}`}>
              <input type="radio" name="paymentMethod" value={id} checked={payment === id} onChange={() => setPayment(id)}
                className="mt-1 size-4 accent-[#111111]" />
              <span>
                <span className="flex items-center gap-2 font-medium text-ink-strong"><Icon size={18} weight="bold" />{title}</span>
                <span className="mt-1 block text-sm text-muted">{body}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.paymentMethod && <p className="mt-2 text-sm text-rose-ink">{errors.paymentMethod}</p>}
      </fieldset>

      <div>
        <button type="submit" disabled={pending}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-md bg-ink-strong text-[16px] font-medium text-white transition hover:bg-press active:scale-[0.98] disabled:cursor-wait disabled:opacity-70">
          {pending ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
              Placing your order...
            </>
          ) : (
            `Place order, ${total}`
          )}
        </button>
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted">
          <LockSimpleIcon size={16} weight="bold" />
          Sent over an encrypted connection. We never ask for card details here.
        </p>
      </div>
    </form>
  );
}
