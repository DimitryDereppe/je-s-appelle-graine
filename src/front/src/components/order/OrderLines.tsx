import type { IOrderLine } from "../../@types";
import { formatEuros } from "../../app/utils/format";
import styles from "./orderLines.module.css";

interface OrderLinesProps {
  lines: IOrderLine[];
}

// Les arbres d'une commande, partagés par /commandes/[id] (client) et /admin/commandes/[id] (admin)
export function OrderLines({ lines }: OrderLinesProps) {
  return (
    <ul className={styles.list}>
      {lines.map((line) => (
        // key : pas d'id dans une ligne de commande ; un arbre n'apparaît qu'une fois par commande
        <li key={`${line.treeName}-${line.unitPrice}`} className={styles.line}>
          <span className={styles.name}>{line.treeName}</span>
          {/* total de la ligne, calculé ici : l'API ne le renvoie pas */}
          <span className={styles.amount}>
            {formatEuros(line.unitPrice * line.quantity)}
          </span>
          {/* && : n'affiche le lieu que s'il est renseigné (il peut être null) */}
          {line.plantingLocation && (
            <span className={styles.location}>
              Lieu de plantation :
              {/* "Forêt … — Landiras (33)" : une ligne pour le lieu, une pour la commune */}
              {line.plantingLocation.split(" — ").map((part) => (
                <span key={part}>{part}</span>
              ))}
            </span>
          )}
          {/* quantité × prix : à droite, sous le total de la ligne */}
          <span className={styles.quantity}>
            {line.quantity} × {formatEuros(line.unitPrice)}
          </span>
        </li>
      ))}
    </ul>
  );
}
