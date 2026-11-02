import styles from "./TreeCard.module.css";
import Image from "next/image";
import type { IFeaturedTree } from "../../@types";

interface FeaturedTreeProps {
  tree: IFeaturedTree;
}
export default async function TreeCard({ tree }: FeaturedTreeProps) {
  return (
    <article key={tree.id} className={styles.card}>
      <div className={styles.cardImage}>
        {tree.photoUrl && (
          <Image
            src={tree.photoUrl}
            alt={tree.name}
            className={styles.cardImg}
            fill
            sizes="(min-width: 600px) 30vw, 90vw"
          />
        )}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardInfo}>
          <h3 className={styles.cardTitle}>
            {tree.name} -{" "}
            <span className={styles.cardScientific}>
              {tree.availabilityName}
            </span>
          </h3>
          <p className={styles.cardScientific}>{tree.categoryName}</p>
          <p className={styles.cardLocation}>
            <span className={styles.locationIcon}>
              <Image
                src="/assets/localisation.svg"
                alt=""
                className={styles.badgeIcon}
                width={18}
                height={18}
              />
            </span>

            <span className={styles.cardScientific}>
              {tree.plantingLocation}
            </span>
          </p>
        </div>

        <div className={styles.cardActions}>
          <div className={styles.cardFooter}>
            <p className={styles.cardPrice}>{tree.price}€ TTC</p>

            <button
              className={styles.basketButton}
              type="button"
              aria-label={`Ajouter ${tree.name} au panier`}
            >
              <Image
                src="/assets/panier.svg"
                alt=""
                className={styles.badgeIcon}
                width={24}
                height={24}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
