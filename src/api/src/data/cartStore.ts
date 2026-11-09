import type { ICartItem } from "../@types/index.js";
import { NotFoundError } from "../lib/errors.ts";
import { treeDatamapper } from "../datamappers/treeDatamapper.ts";

// paniers en mémoire : accountId -> lignes du panier du compte
const carts = new Map<number, ICartItem[]>();
let nextItemId = 1;

export const cartStore = {
  // lignes du panier du compte (tableau vide au premier accès)
  async findCartByUserId(accountId: number): Promise<ICartItem[]> {
    return carts.get(accountId) ?? [];
  },

  // ajoute l'arbre, ou cumule la quantité s'il y est déjà
  // async : l'arbre est relu via treeDatamapper pour figer nom et prix
  async addCartItem(
    accountId: number,
    treeId: number,
    quantity: number,
  ): Promise<ICartItem> {
    const items = carts.get(accountId) ?? [];
    const existing = items.find((i) => i.treeId === treeId);
    if (existing) {
      existing.quantity += quantity;
      return existing;
    }
    const tree = await treeDatamapper.findById(treeId);
    if (!tree || tree.availabilityName === "retiré") {
      throw new NotFoundError("Arbre introuvable");
    }
    const item: ICartItem = {
      id: nextItemId++,
      accountId,
      treeId,
      quantity,
      name: tree.name,
      price: tree.price,
      photoUrl: tree.photoUrl,
      plantingLocation: tree.plantingLocation,
      availabilityName: tree.availabilityName,
    };
    items.push(item);
    carts.set(accountId, items);
    return item;
  },

  // met à jour la quantité d'une ligne du compte
  async updateCartItem(
    accountId: number,
    itemId: number,
    quantity: number,
  ): Promise<ICartItem> {
    const item = (carts.get(accountId) ?? []).find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundError("Ligne de panier introuvable");
    }
    item.quantity = quantity;
    return item;
  },

  // supprime une ligne du compte
  async deleteCartItem(accountId: number, itemId: number): Promise<void> {
    const items = carts.get(accountId) ?? [];
    const index = items.findIndex((i) => i.id === itemId);
    if (index === -1) {
      throw new NotFoundError("Ligne de panier introuvable");
    }
    items.splice(index, 1);
  },
};
