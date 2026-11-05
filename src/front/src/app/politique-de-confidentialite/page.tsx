import type { Metadata } from "next";
import styles from "@/components/infoPage/infoPage.module.css";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Je s’appelle Graine",
  description:
    "Les données utilisées par Je s’appelle Graine, leur durée de conservation, le cookie de connexion et vos droits.",
};

// Texte du document politique-confidentialite-je-sappelle-graine.docx : (à compléter)
export default function PrivacyPolicyPage() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.title}>Politique de confidentialité</h1>
        <p className={styles.intro}>Dernière mise à jour : à venir</p>
        <p>
          Cette page explique quelles données sont utilisées lorsque vous créez
          un compte ou passez une commande, pourquoi elles sont nécessaires et
          comment vous pouvez exercer vos droits.
        </p>

        <h2>Responsable du traitement</h2>
        <p>
          « Je s’appelle Graine » est un projet pédagogique réalisé par une
          équipe d’apprenants dans le cadre d’une formation O’Clock.
        </p>
        <p>
          La personne ou la structure juridiquement responsable du traitement
          est : à venir.
        </p>

        <h2>Données utilisées et raisons</h2>
        <p>
          Nous utilisons uniquement les données nécessaires à la gestion des
          comptes, des paniers et des commandes.
        </p>
        <ul>
          <li>
            <strong>Compte</strong> — Nom, prénom, adresse électronique, mot de
            passe haché, type de compte et, le cas échéant, nom de
            l’organisation. Créer et gérer le compte, permettre la connexion et
            protéger l’accès.
          </li>
          <li>
            <strong>Commande</strong> — Adresse utile à la commande,
            informations sur les arbres choisis, quantités, montant, date, mode
            de règlement et informations de l’acheteur associées à la commande.
            Enregistrer la commande, en assurer le suivi et envoyer les
            courriels nécessaires.
          </li>
        </ul>
        <p>
          Le mot de passe est haché avant d’être enregistré ; il n’est pas
          conservé en clair.
        </p>
        <p>
          Le traitement des comptes et des commandes est nécessaire à la
          fourniture du service demandé. La conservation de certaines pièces de
          commande répond aux obligations comptables. La sécurisation du site
          repose sur notre intérêt légitime à protéger les comptes et le
          service.
        </p>

        <h2>Durée de conservation</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Données</th>
                <th scope="col">Durée prévue</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Données du compte</td>
                <td>
                  Jusqu’à la suppression du compte, sauf données à conserver
                  pour répondre à une obligation légale.
                </td>
              </tr>
              <tr>
                <td>Panier</td>
                <td>Pendant son utilisation, ou jusqu’à sa suppression.</td>
              </tr>
              <tr>
                <td>Commandes et pièces comptables</td>
                <td>Dix ans pour les documents comptables concernés.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          En cas de suppression d’un compte, les informations nécessaires aux
          justificatifs comptables d’une commande peuvent être conservées
          pendant la durée légale applicable.
        </p>

        <h2>Qui peut accéder aux données ?</h2>
        <p>
          Les personnes autorisées de l’équipe peuvent accéder aux données
          lorsque cela est nécessaire à la gestion d’un compte ou d’une
          commande. Les prestataires techniques chargés de l’hébergement et de
          l’envoi des courriels peuvent également traiter certaines données pour
          fournir ces services.
        </p>
        <p>Les données personnelles ne sont pas vendues.</p>

        <h2>Cookie de connexion</h2>
        <p>
          Le site utilise un cookie nécessaire à la connexion et à la
          sécurisation du compte. Il permet de reconnaître la session de la
          personne connectée et sa durée de validité est de 24 heures. Ce cookie
          est indispensable au service demandé et ne nécessite pas de
          consentement préalable.
        </p>

        <h2>Vos droits</h2>
        <p>
          Vous pouvez demander l’accès à vos données, leur rectification ou leur
          effacement, ainsi que la limitation de leur traitement lorsque les
          règles applicables le permettent.
        </p>
        <p>Adresse électronique pour exercer vos droits : à venir.</p>
        <p>
          Vous pouvez également adresser une réclamation à la Commission
          nationale de l’informatique et des libertés (CNIL) sur{" "}
          <a href="https://www.cnil.fr" rel="noreferrer">
            www.cnil.fr
          </a>
          .
        </p>
      </div>
    </main>
  );
}
