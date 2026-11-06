import type { Request, Response } from "express";
import { z } from "zod";
import { adminTreeDatamapper } from "../datamappers/adminTreeDatamapper.ts";
const treeBodySchema = z.object({
  name: z.string().trim().min(1, { error: "Le nom est obligatoire." }),
  description: z.string().nullable(),
  price: z
    .number({ error: "Le prix doit être positif." })
    .min(0, { error: "Le prix doit être positif." }),
  photoUrl: z
    .string()
    .startsWith("/images/trees/", {
      error: "Le chemin de la photo doit commencer par /images/trees/.",
    }),
  plantingLocation: z.string().nullable(),
  categoryId: z.number().int({ error: "Catégorie invalide." }),
  availabilityId: z.number().int({ error: "Disponibilité invalide." }),
});

// POST /api/admin/trees.

export async function create(req: Request, res: Response): Promise<void> {
  // Vérifie les champs reçus dans le body.
  const treeInput = await treeBodySchema.parseAsync(req.body);

  // Vérifie que la catégorie choisie existe.
  const categoryExists = await adminTreeDatamapper.categoryExists(
    treeInput.categoryId,
  );

  if (!categoryExists) {
    res.status(400).json({
      error: "Catégorie invalide.",
      status: 400,
    });
    return;
  }

  // Vérifie que la disponibilité choisie existe.
  const availabilityExists = await adminTreeDatamapper.availabilityExists(
    treeInput.availabilityId,
  );

  if (!availabilityExists) {
    res.status(400).json({
      error: "Disponibilité invalide.",
      status: 400,
    });
    return;
  }

  // Enregistre l'arbre et récupère son identifiant.
  const newTreeId = await adminTreeDatamapper.create(treeInput);

  // Récupère l'arbre complet pour le renvoyer dans la réponse.
  const newTree = await adminTreeDatamapper.findById(newTreeId);

  res.status(201).json(newTree);
}
