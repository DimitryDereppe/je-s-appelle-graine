"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import SearchBar from "./SearchBar";

import styles from "./header.module.css";
import Image from "next/image";

const navigationLinks = [
  { href: "/", label: "Accueil" },
  { href: "/arbres", label: "Nos arbres" },
  { href: "/qui-sommes-nous", label: "Qui sommes-nous" },
  { href: "/connexion", label: "Connexion" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link
          className={styles.brand}
          href="/"
          aria-label="Je s’appelle Graine, accueil"
          onClick={() => setIsMenuOpen(false)}
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

        <button
          className={styles.menuToggle}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="site-navigation"
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{isMenuOpen ? "×" : "☰"}</span>
        </button>
        <div className={styles.navArea}>
          <nav
            id="site-navigation"
            className={`${styles.navigation} ${
              isMenuOpen ? styles.navigationOpen : ""
            }`}
            aria-label="Navigation principale"
          >
            {navigationLinks.map(({ href, label }) => (
              <Link
                key={href}
                className={`${styles.navigationLink} ${
                  pathname === href ? styles.activeLink : ""
                }`}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>

          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>

        <Link
          className={styles.cartLink}
          href="/panier"
          aria-label="Voir le panier"
          onClick={() => setIsMenuOpen(false)}
        >
          <Image
            src={"/assets/panier.svg"}
            alt=""
            className={styles.badgeIcon}
            width={24}
            height={24}
          />
          <span className={styles.visuallyHidden}>Panier</span>
        </Link>
      </div>
    </header>
  );
}
