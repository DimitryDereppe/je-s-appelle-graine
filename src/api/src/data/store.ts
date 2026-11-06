import type { ICart, ICartItem, ICatalogueTree } from "../@types/index.d.ts";
import { NotFoundError } from "../lib/errors.ts";
import { treeDatamapper } from "../datamappers/treeDatamapper.ts";

// ─── Catalogue (délégué au datamapper) ───────────────────────────────────────

export const catalogue = {
  // Remplace l'ancien findAll() : accepte des filtres optionnels
  findAll: async (
    categoryId?: number,
    name?: string,
  ): Promise<ICatalogueTree[]> =>
    treeDatamapper.findAllCatalog(categoryId, name),

  // Recherche par ID (pour addItem)
  findById: async (treeId: number): Promise<ICatalogueTree | undefined> =>
    treeDatamapper.findById(treeId),
};

// ─── Panier ──────────────────────────────────────────────────────────────────

const carts = new Map<number, ICart>();
let nextCartId = 1;
let nextItemId = 1;

export const cartStore = {
  create: (): ICart => {
    const cart: ICart = { id: nextCartId++, items: [] };
    carts.set(cart.id, cart);
    return cart;
  },

  findById: (cartId: number): ICart | undefined => carts.get(cartId),

  // ⚠️ Maintenant async : appelle catalogue.findById qui fait un SELECT
  addItem: async (
    cart: ICart,
    treeId: number,
    quantity: number,
  ): Promise<ICartItem> => {
    // Si déjà présent → on cumule (pas besoin de requête)
    const existing = cart.items.find((i) => i.treeId === treeId);
    if (existing) {
      existing.quantity += quantity;
      return existing;
    }

    // Sinon → on va chercher l'arbre en base
    const tree = await catalogue.findById(treeId);
    if (!tree) {
      throw new NotFoundError("Arbre introuvable");
    }

    const item: ICartItem = {
      id: nextItemId++,
      accountId: 0,
      treeId,
      quantity,
      name: tree.name,
      price: tree.price,
      photoUrl: tree.photoUrl,
      plantingLocation: tree.plantingLocation,
      availabilityName: tree.availabilityName,
    };
    cart.items.push(item);
    return item;
  },

  findItem: (cart: ICart, treeId: number): ICartItem | undefined =>
    cart.items.find((i) => i.treeId === treeId),

  removeItem: (cart: ICart, treeId: number): void => {
    const index = cart.items.findIndex((i) => i.treeId === treeId);
    if (index === -1) {
      throw new NotFoundError("Arbre absent du panier");
    }
    cart.items.splice(index, 1);
  },

  clear: (cart: ICart): void => {
    cart.items = [];
  },
};
