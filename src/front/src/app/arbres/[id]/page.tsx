import Link from "next/link";
import styles from "./page.module.css";
import Image from "next/image";
import type { ITree } from "../../../@types";
import { api } from "../../utils/apiCall";
import { notFound } from "next/navigation";
import { formatEuros } from "@/app/utils/format";

interface TreePageProps {
  params: Promise<{ id: string }>;
}

export default async function FicheArbre({ params }: TreePageProps) {
  const { id } = await params;

  let tree: ITree | null = null;

  try {
    const response: ITree = await api<ITree>(`trees/${id}`);
    if (!response) {
      notFound();
    }
    tree = response;
  } catch {
    notFound();
  }

  if (!tree) return null;

  const isOutOfStock = tree.availabilityName === "en rupture de stock";

  return (
    <main className={styles.detail}>
      <nav className={styles.breadcrumb} aria-label="Fil d'Ariane">
        <ol>
          <li>
            <Link href="/">Accueil</Link>
          </li>
          <li>
            <Link href="/arbres">Nos arbres</Link>
          </li>
          <li aria-current="page">{tree.name}</li>
        </ol>
      </nav>

      <Link href="/arbres" className={styles.backButton}>
        ← Retour aux arbres
      </Link>

      <section className={styles.detailCard} aria-label={tree.name}>
        <div className={styles.imageWrapper}>
          {tree.photoUrl && (
            <Image
              src={tree.photoUrl}
              alt={tree.name}
              className={styles.detailImage}
              fill
              sizes="(max-width: 600px) 100vw, 30vw"
            />
          )}
        </div>
        <div className={styles.detailsWrapper}>
          <h1 className={styles.title}>{tree.name}</h1>
          <p className={styles.subtitle}>{tree.categoryName}</p>
          <p className={styles.price}>
            {isOutOfStock
              ? `${formatEuros(tree.price)} TTC - ${tree.availabilityName}`
              : `${formatEuros(tree.price)} TTC`}
          </p>
          <p className={styles.description}>{tree.description}</p>

          {tree.plantingLocation && (
            <p className={styles.location}>
              <span className={styles.locationIcon} aria-hidden="true">
                <Image
                  src="/assets/localisation.svg"
                  alt=""
                  className={styles.locationIcon}
                  width={18}
                  height={18}
                />
              </span>
              <span className={styles.cardScientific}>
                {tree.plantingLocation}
              </span>
            </p>
          )}

          <div className={styles.actions}>
            <button
              className={styles.basketButton}
              type="button"
              disabled={isOutOfStock}
              aria-label={`Ajouter ${tree.name} au panier`}
            >
              <p>Ajouter au panier</p>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
