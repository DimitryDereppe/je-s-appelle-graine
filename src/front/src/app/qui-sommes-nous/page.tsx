import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "@/components/infoPage/infoPage.module.css";

export const metadata: Metadata = {
  title: "Qui sommes-nous — Je s’appelle Graine",
  description:
    "La mission de Je s’appelle Graine : contribuer à la reforestation en offrant un arbre à une forêt française.",
};

// A valider avec la team
export default function AboutPage() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.title}>Qui sommes-nous</h1>
        <p className={styles.intro}>
          Je s’appelle Graine permet à chacun d’offrir un arbre à une forêt
          française qui en a besoin.
        </p>

        <Image
          className={styles.image}
          src="/assets/acceuil.png"
          alt="Mains plantant une jeune pousse dans la terre"
          width={760}
          height={420}
          sizes="(min-width: 768px) 736px, 100vw"
        />

        <h2>Notre mission</h2>
        <p>
          Replanter des essences locales, adaptées au sol et au climat de chaque
          région, avec des forestiers et des associations partenaires.
        </p>

        <h2>Comment un arbre est choisi et planté</h2>
        <ul>
          <li>
            Chaque essence est choisie avec nos partenaires pour sa résistance
            et sa place dans la forêt.
          </li>
          <li>
            Vous choisissez votre arbre dans le catalogue : sa fiche indique son
            lieu de plantation.
          </li>
          <li>
            Après la réception de votre paiement, l’arbre est planté pendant la
            saison de plantation.
          </li>
        </ul>

        <h2>Un suivi transparent</h2>
        <p>
          Dans votre espace, chaque commande indique son statut : en attente de
          paiement, payée, puis plantée.
        </p>

        <Link className={styles.button} href="/arbres">
          Voir nos arbres
        </Link>
      </div>
    </main>
  );
}
