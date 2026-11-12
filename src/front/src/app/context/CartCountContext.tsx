"use client";

// ─── Contexte du panier : stocke les lignes et expose refresh() ──────────────
// Le panier est initialisé via GET /api/cart au montage,
// puis rafraîchi à chaque mutation (ajout, modification, suppression).

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { clientApi } from "@/app/utils/clientApi";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CartItem {
  id: number;
  treeId: number;
  name: string;
  quantity: number;
  price: number;
  photoUrl: string;
  plantingLocation: string | null;
}

interface CartCountContextType {
  itemCount: number;
  items: CartItem[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const CartCountContext = createContext<CartCountContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CartCountProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // ─── Refresh : appelé après chaque mutation (clic, pas effect) ─────────────
  // Relit le panier depuis l'API et met à jour l'état.
  const refresh = useCallback(async () => {
    try {
      const response = await clientApi("cart", "GET");
      if (response.ok) {
        const data: { items: CartItem[]; total: number } =
          await response.json();
        setItems(data.items);
      } else if (response.status === 401) {
        setItems([]);
      }
    } catch {
      // API injoignable : on garde l'état actuel
    }
  }, []);

  // ─── Fetch initial au montage ──────────────────────────────────────────────
  // Le fetch est écrit directement ici (pas via refresh) pour éviter
  // le warning "Calling setState synchronously within an effect".
  useEffect(() => {
    let cancelled = false;

    async function fetchInitialCart() {
      try {
        const response = await clientApi("cart", "GET");
        if (cancelled) return;

        if (response.ok) {
          const data: { items: CartItem[]; total: number } =
            await response.json();
          setItems(data.items);
        } else if (response.status === 401) {
          setItems([]);
        }
      } catch {
        // API injoignable : panier vide
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchInitialCart();
    return () => {
      cancelled = true;
    };
  }, []); // ← dépendances vides : exécuté une seule fois au montage

  return (
    <CartCountContext.Provider value={{ itemCount, items, loading, refresh }}>
      {children}
    </CartCountContext.Provider>
  );
}

// ─── Hook consommateur ────────────────────────────────────────────────────────
export const useCartCount = () => {
  const ctx = useContext(CartCountContext);
  if (!ctx)
    throw new Error("useCartCount doit être utilisé dans <CartCountProvider>");
  return ctx;
};
