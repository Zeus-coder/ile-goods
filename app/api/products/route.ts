import { listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

// Catalogue for the mobile app.
export async function GET() {
  return Response.json({ products: await listProducts() });
}
