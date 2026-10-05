import { useCallback, useEffect, useState } from "react";
import { api, type Product } from "./api";

// One shared copy of the catalogue so the product screen can open instantly from the list.
let cache: Product[] | null = null;

export function useProducts() {
  const [products, setProducts] = useState<Product[] | null>(cache);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      cache = await api.products();
      setProducts(cache);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load products.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!cache) load();
  }, [load]);

  return { products, error, refreshing, reload: load };
}
