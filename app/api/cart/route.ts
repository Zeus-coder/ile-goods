import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { addItem, currentCartId, ensureCartId, getCart, setItemQuantity } from "@/lib/cart";

export const dynamic = "force-dynamic";

// The signed-in user's cart for the mobile app. It is the same cart the website shows,
// so changes on either side appear on the other. Auth is the Better Auth session cookie.

const body = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(0).max(99),
});

async function unauthorized() {
  return (await getSession()) ? null : Response.json({ error: "Sign in to use your cart." }, { status: 401 });
}

async function parse(request: Request) {
  const parsed = body.safeParse(await request.json().catch(() => null));
  return parsed.success ? parsed.data : null;
}

export async function GET() {
  return (await unauthorized()) ?? Response.json(await getCart());
}

// Add to cart: increases the quantity if the product is already there.
export async function POST(request: Request) {
  const denied = await unauthorized();
  if (denied) return denied;
  const input = await parse(request);
  if (!input || input.quantity < 1) return Response.json({ error: "Send a productId and a quantity of at least 1." }, { status: 400 });

  await addItem(await ensureCartId(), input.productId, input.quantity);
  revalidatePath("/", "layout");
  return Response.json(await getCart());
}

// Set a line's quantity; 0 removes it.
export async function PATCH(request: Request) {
  const denied = await unauthorized();
  if (denied) return denied;
  const input = await parse(request);
  if (!input) return Response.json({ error: "Send a productId and a quantity." }, { status: 400 });

  const cartId = await currentCartId();
  if (cartId) await setItemQuantity(cartId, input.productId, input.quantity);
  revalidatePath("/", "layout");
  return Response.json(await getCart());
}
