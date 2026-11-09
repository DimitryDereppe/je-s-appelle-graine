// import type { NextFunction, Response } from "express";
// import type {
//   IAddItemBody,
//   ICartRequest,
//   IUpdateQuantityBody,
// } from "../@types/index.d.ts";
// import {
//   BadRequestError,
//   NotFoundError,
//   UnauthorizedError,
// } from "../lib/errors.ts";
// import { cartStore } from "../data/cartStore.ts";
// import { treeDatamapper } from "../datamappers/treeDatamapper.ts";

// // --------------------------------
// // charge le panier du compte connecté (créé vide au premier accès)
// // à chaîner APRÈS isConnected, qui renseigne req.userId depuis le JWT
// // --------------------------------
// export function loadCart(
//   req: ICartRequest,
//   _res: Response,
//   next: NextFunction,
// ): void {
//   // req.userId est garanti par isConnected ; garde défensive sinon
//   if (req.userId === undefined) {
//     throw new UnauthorizedError("Connexion requise.");
//   }
//   req.cart = cartStore.findByUser(req.userId);
//   next();
// }

// // --------------------------------
// // valide le body d'ajout : { treeId, quantity }
// // async : l'existence de l'arbre est vérifiée en BDD via treeDatamapper
// // --------------------------------
// export async function validateItem(
//   req: ICartRequest,
//   _res: Response,
//   next: NextFunction,
// ): Promise<void> {
//   const { treeId, quantity } = req.body as Partial<IAddItemBody>;

//   if (typeof treeId !== "number" || !Number.isInteger(treeId)) {
//     throw new BadRequestError("treeId (entier) est requis");
//   }
//   if (
//     typeof quantity !== "number" ||
//     !Number.isInteger(quantity) ||
//     quantity < 1
//   ) {
//     throw new BadRequestError("quantity (entier >= 1) est requise");
//   }
//   const tree = await treeDatamapper.findById(treeId);
//   if (!tree || tree.availabilityName === "retiré") {
//     throw new NotFoundError("Arbre introuvable");
//   }

//   req.body = { treeId, quantity } satisfies IAddItemBody;
//   next();
// }

// // --------------------------------
// // valide le body de mise à jour : { quantity }
// // --------------------------------
// export function validateQuantity(
//   req: ICartRequest,
//   _res: Response,
//   next: NextFunction,
// ): void {
//   const { quantity } = req.body as Partial<IUpdateQuantityBody>;

//   if (
//     typeof quantity !== "number" ||
//     !Number.isInteger(quantity) ||
//     quantity < 1
//   ) {
//     throw new BadRequestError("quantity (entier >= 1) est requise");
//   }

//   req.body = { quantity } satisfies IUpdateQuantityBody;
//   next();
// }

// // --------------------------------
// // vérifie que l'arbre est bien dans le panier, l'attache à req.item
// // --------------------------------
// export function itemInCart(
//   req: ICartRequest,
//   _res: Response,
//   next: NextFunction,
// ): void {
//   const treeId = Number(req.params.treeId);
//   const item = cartStore.findItem(req.cart, treeId);
//   if (!item) {
//     throw new NotFoundError("Arbre absent du panier");
//   }
//   req.item = item;
//   next();
// }
