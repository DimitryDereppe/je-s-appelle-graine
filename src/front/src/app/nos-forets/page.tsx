import type { Metadata } from "next";
import Link from "next/link";
import commonStyles from "@/components/infoPage/infoPage.module.css";
import styles from "./page.module.css";
import type { ICatalogueTree } from "@/@types";
import { api } from "@/app/utils/apiCall";
import { forests } from "./forests";

export const metadata: Metadata = {
  title: "Nos forêts",
  description:
    "Les 6 forêts françaises touchées par le feu où nous plantons, et le mélange d'essences conseillé pour chacune : une forêt variée résiste mieux qu'une monoculture.",
};

// Sources vérifiées le 20/11/2026 (cf. Apothéose/divers/bdd arbres.md)
const sources = [
  {
    label: "Préfecture du Morbihan — feu de Campénéac (12/08/2022)",
    href: "https://www.morbihan.gouv.fr/index.php/contenu/telechargement/62525/440691/file/2022_08_12_%20Feux%20d'espace%20naturels%20%C3%A0%20Camp%C3%A9n%C3%A9ac%20dans%20le%20Morbihan.pdf",
  },
  {
    label: "Préfecture du Finistère — incendies des Monts d'Arrée (08/08/2022)",
    href: "https://www.finistere.gouv.fr/contenu/telechargement/52613/363959/file/2022.08.08%20-%20CP%20%20Incendies%20en%20cours%20dans%20les%20Monts%20d'Arr%C3%A9e.pdf",
  },
  {
    label: "Préfecture de la Gironde — retour d'expérience des incendies 2022",
    href: "https://www.gironde.gouv.fr/contenu/telechargement/64007/426953/file/RETEX%20incendies%20-%20Gironde%20et%20Landes%20-%20octobre%202022.pdf",
  },
  {
    label:
      "Préfecture du Var — expertise des travaux d'urgence, feu de Gonfaron (ONF, CNPF)",
    href: "https://www.var.gouv.fr/index.php/contenu/telechargement/16803/128476/file/rapport_expertise_travaux_urgence.pdf",
  },
  {
    label:
      "Ministère de la Transition écologique — suites de l'incendie de Ribaute (2025)",
    href: "https://www.ecologie.gouv.fr/presse/suites-lincendie-ribaute-agnes-pannier-runacher-apporte-son-soutien-aux-elus-aux-acteur",
  },
  {
    label: "Préfecture du Jura — feu de Cernon (10/08/2022)",
    href: "https://www.jura.gouv.fr/contenu/telechargement/25038/174194/file/20220810_CP_CERNON%20Feu%20de%20for%C3%AAt%20-%20P1.pdf",
  },
  {
    label: "DRAAF Auvergne-Rhône-Alpes — guide des peuplements mélangés",
    href: "https://draaf.auvergne-rhone-alpes.agriculture.gouv.fr/IMG/pdf/presentation_guide_melange_060224.pdf",
  },
  {
    label: "ONF — faire renaître la forêt après un feu",
    href: "https://www.ffrandonnee.fr/s-informer/actualites/faire-renaitre-la-foret-apres-un-feu-un-travail-au-long-cours-des-equipes-de-l-onf",
  },
];

export default async function ForestsPage() {
  // Les essences en vente : le catalogue (GET /api/trees) exclut déjà les arbres retirés.
  // Set : collection sans doublons, .has() répond sans parcourir tout le tableau
  let availableNames = new Set<string>();
  let isCatalogueLoaded = false;
  try {
    const trees = await api<ICatalogueTree[]>("trees");
    availableNames = new Set(trees.map((tree) => tree.name));
    isCatalogueLoaded = true;
  } catch {
    // API indisponible : la page reste lisible, sans mention de disponibilité
  }

  return (
    <main className={commonStyles.main}>
      <div className={commonStyles.content}>
        <h1 className={commonStyles.title}>Nos forêts</h1>
        <p className={commonStyles.intro}>
          Nous plantons dans 6 forêts françaises touchées par de grands
          incendies. Pour chacune, nous conseillons un mélange d&apos;essences
          locales : une forêt variée résiste mieux qu&apos;une monoculture.
        </p>

        <h2>Pourquoi planter en mélange ?</h2>
        <p>
          Une forêt d&apos;une seule essence est plus fragile : un insecte
          ravageur ou une maladie peut tout détruire d&apos;un coup, elle
          supporte mal les sécheresses, et le feu s&apos;y propage sans
          obstacle. Pour aider la forêt à mieux résister, nous suivons 4
          principes :
        </p>
        <ul>
          <li>
            <strong>plusieurs essences par lieu</strong>, en mélangeant résineux
            et feuillus ;
          </li>
          <li>
            <strong>pas plus de la moitié d&apos;une même essence</strong> sur
            un même lieu ;
          </li>
          <li>
            <strong>une bonne part de feuillus</strong> : ils brûlent moins bien
            que les résineux et freinent le feu ;
          </li>
          <li>
            <strong>des rôles complémentaires</strong> : une essence{" "}
            <em>pionnière</em> qui pousse vite sur le sol nu, une essence{" "}
            <em>principale</em> qui formera la forêt adulte, et des essences
            d&apos;<em>accompagnement</em> qui nourrissent la faune.
          </li>
        </ul>
        <p>
          Ces répartitions sont indicatives : vous restez libre de choisir vos
          arbres.
        </p>

        {forests.map((forest, index) => {
          // id du titre : relie la section à son h2 (aria-labelledby)
          const titleId = `foret-${index + 1}`;
          // reduce : additionne les parts, en partant de 0
          const total = forest.species.reduce(
            (sum, species) => sum + species.share,
            0,
          );
          // URLSearchParams encode le « — », les accents et les parenthèses
          const catalogueQuery = new URLSearchParams({
            lieu: forest.location,
          });

          return (
            <section
              key={forest.location}
              className={styles.forest}
              aria-labelledby={titleId}
            >
              <h2 id={titleId}>{forest.location}</h2>
              <p>{forest.fire}</p>
              {forest.intro && <p>{forest.intro}</p>}

              <div className={commonStyles.tableWrapper}>
                <table className={commonStyles.table}>
                  <caption className={styles.caption}>
                    Mélange conseillé
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Essence</th>
                      <th scope="col">Part conseillée</th>
                      <th scope="col">Rôle dans le mélange</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forest.species.map((species) => (
                      <tr key={species.name}>
                        <th scope="row">
                          {species.name}
                          {/* seulement si le catalogue a été lu : sinon on ne sait pas */}
                          {isCatalogueLoaded &&
                            !availableNames.has(species.name) && (
                              <span className={styles.unavailable}>
                                {" "}
                                (non disponible)
                              </span>
                            )}
                        </th>
                        <td>{species.share} %</td>
                        <td>{species.role}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th scope="row">Total</th>
                      <td>{total} %</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <Link
                className={styles.catalogueLink}
                href={`/arbres?${catalogueQuery}`}
              >
                Voir les arbres de ce lieu
              </Link>
            </section>
          );
        })}

        <h2>Comment nous plantons</h2>
        <p>
          Comme le font les forestiers de l&apos;ONF, la forêt brûlée est
          d&apos;abord laissée à sa régénération naturelle : beaucoup
          d&apos;essences repoussent seules, de souche ou par leurs graines. Les
          plantations viennent la compléter 3 à 5 ans après le feu, avec des
          essences choisies parcelle par parcelle avec nos partenaires
          forestiers.
        </p>

        <h2>Sources</h2>
        <ul>
          {sources.map((source) => (
            <li key={source.href}>
              <a href={source.href} target="_blank" rel="noopener noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>

        <Link className={commonStyles.button} href="/arbres">
          Voir nos arbres
        </Link>
      </div>
    </main>
  );
}
