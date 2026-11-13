import type { Metadata } from "next";
import { CartItems } from "./CartItems";
import styles from "./cartItems.module.css";
export const metadata: Metadata = {
  title: "Mon panier",
  // page privée : les moteurs de recherche ne l'indexent pas
  robots: { index: false },
};

export default function CartPage() {
  return (
    <main className={styles.basketContainer}>
      <CartItems />
    </main>
  );
}
