import Link from "next/link";
import styles from "./footer.module.css";

const footerLinks = [
  { href: "/qui-sommes-nous", label: "Qui sommes-nous" },
  { href: "/mentions-legales", label: "Mentions légales" },
  {
    href: "/politique-de-confidentialite",
    label: "Politique de confidentialité",
  },
];

const commitments = [
  {
    label: "Des arbres sélectionnés",
    // iconComment: "TODO : ajouter l’icône de sélection.",
  },
  {
    label: "Des projets de plantation",
    // iconComment: "TODO : ajouter le pictogramme graine-5-arbuste.",
  },
  {
    label: "Un suivi transparent",
    // iconComment: "TODO : ajouter l’icône de suivi.",
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <ul className={styles.commitments} aria-label="Nos engagements">
        {commitments.map(({ label }) => (
          <li className={styles.commitment} key={label}>
            <span className={styles.commitmentIcon} aria-hidden="true">
              {/* {iconComment} */}
            </span>
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <div className={styles.footerMain}>
        <Link
          className={styles.brand}
          href="/"
          aria-label="Je m’appelle Graine, accueil"
        >
          {/* TODO : ajouter le pictogramme graine-2-germination. */}
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
