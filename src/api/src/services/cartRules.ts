// --------------------------------
// Règles métier du panier
// --------------------------------
// Couche métier : pas de req/res, pas de SQL, seulement des règles de la boutique.

// quantité maximale d'un même arbre dans le panier
export const MAX_QUANTITY_PER_TREE = 100;

// --------------------------------
// Un arbre ne peut être ajouté au panier ou commandé que s'il est disponible
// --------------------------------
// une seule règle pour le panier ET la commande : « disponible », et rien d'autre
// (si on ajoute un jour une nouvelle disponibilité, elle sera refusée par défaut)
export function isTreeAvailable(availabilityName: string): boolean {
  return availabilityName === "disponible";
}

// --------------------------------
// La quantité déjà dans le panier + celle qu'on ajoute ne doit pas dépasser le maximum
// --------------------------------
export function exceedsMaxQuantity(
  currentQuantity: number,
  addedQuantity: number,
): boolean {
  return currentQuantity + addedQuantity > MAX_QUANTITY_PER_TREE;
}
