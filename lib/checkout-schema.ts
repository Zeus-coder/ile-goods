import { z } from "zod";
import { NIGERIAN_STATES } from "./states";

export const checkoutSchema = z.object({
  email: z.email("Enter an email like name@example.com so we can send your receipt."),
  fullName: z.string().trim().min(2, "Enter the name the rider should ask for."),
  phone: z
    .string()
    .trim()
    .refine((v) => /^\+?[0-9\s-]{10,16}$/.test(v), "Enter a phone number like 0803 123 4567."),
  address: z.string().trim().min(6, "Add a street address with a house number."),
  city: z.string().trim().min(2, "Enter the town or city."),
  state: z.enum(NIGERIAN_STATES, "Choose a state."),
  deliveryNotes: z.string().trim().max(300, "Keep delivery notes under 300 characters.").optional(),
  paymentMethod: z.enum(["pay_on_delivery", "bank_transfer"], "Choose how you'd like to pay."),
});

export type CheckoutField = keyof z.infer<typeof checkoutSchema>;
