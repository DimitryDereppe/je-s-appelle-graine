import { CartItems } from "./CartItems";
import styles from "./cartItems.module.css";
export default function CartPage() {
  return (
    <main className={styles.container}>
      <CartItems />
    </main>
  );
}
