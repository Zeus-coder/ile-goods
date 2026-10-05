import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, type Cart } from "./api";
import { authClient } from "./auth-client";

type CartState = {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  add: (productId: number, quantity?: number) => Promise<void>;
  setQuantity: (productId: number, quantity: number) => Promise<void>;
};

const CartContext = createContext<CartState | null>(null);

// The cart lives on the server, in the same row the website reads, so the app always
// refetches rather than keeping its own copy. Screens call refresh() when they gain focus.
export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (call: () => Promise<Cart>) => {
    setLoading(true);
    setError(null);
    try {
      setCart(await call());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) return;
    await run(api.cart).catch(() => {});
  }, [run, userId]);

  useEffect(() => {
    if (userId) refresh();
    else setCart(null);
  }, [userId, refresh]);

  const value = useMemo<CartState>(
    () => ({
      cart,
      loading,
      error,
      refresh,
      add: (productId, quantity = 1) => run(() => api.addToCart(productId, quantity)),
      setQuantity: (productId, quantity) => run(() => api.setQuantity(productId, quantity)),
    }),
    [cart, loading, error, refresh, run],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
