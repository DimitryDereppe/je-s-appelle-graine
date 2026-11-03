import Link from "next/link";
import styles from "./footer.module.css";
import Image from "next/image";

const footerLinks = [
  { href: "/qui-sommes-nous", label: "Qui sommes-nous" },
  { href: "/mentions-legales", label: "Mentions légales" },
  {
    href: "/politique-de-confidentialite",
    label: "Politique de confidentialité",
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerMain}>
        <Link
          className={styles.brand}
          href="/"
          aria-label="Je m’appelle Graine, accueil"
        >
          <Image
            src="/assets/graine-2-germination.ico"
            alt=""
            className={styles.badgeIcon}
            width={34}
            height={34}
          />
          <span className={styles.brandName}>Je s’appelle Graine</span>
        </Link>

        <nav
          className={styles.navigation}
          aria-label="Navigation de pied de page"
        >
          {footerLinks.map(({ href, label }) => (
            <Link className={styles.link} href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className={styles.copyright}>
        <p>
          © {new Date().getFullYear()} Je s’appelle Graine — Tous droits
          réservés
        </p>
      </div>
    </footer>
  );
}
