import type { ICart, ICartItem } from "../@types/index.d.ts";
import { NotFoundError } from "../lib/errors.ts";
import { treeDatamapper } from "../datamappers/treeDatamapper.ts";

const carts = new Map<number, ICart>(); // accountId -> panier du compte
let nextItemId = 1;

export const cartStore = {
  // charge le panier du compte connecté, ou le crée vide au premier accès
  // (en BDD : SELECT ... WHERE account_id = ? ou INSERT d'une première ligne)
  findByUser: (userId: number): ICart => {
    let cart = carts.get(userId);
    if (!cart) {
      cart = { id: userId, items: [] };
      carts.set(userId, cart);
    }
    return cart;
  },

  // ajoute ou cumule la quantité, renvoie l'item mis à jour
  // async : l'arbre est relu en BDD via treeDatamapper pour figer nom et prix
  addItem: async (
    cart: ICart,
    treeId: number,
    quantity: number,
  ): Promise<ICartItem> => {
    const existing = cart.items.find((i) => i.treeId === treeId);
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
      accountId: cart.id, // id du panier = accountId du compte connecté
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
