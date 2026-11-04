import type {
  IAuthenticatedRequest,
  IAccountProfile,
} from "../@types/index.d.ts";
import { accountDatamapper } from "../datamappers/accountDatamapper.ts";
import { UnauthorizedError } from "../lib/errors.ts";

// --------------------------------
// recherche le compte connecté selon l'id placé par isConnected dans la requête
// --------------------------------
export async function getAuthenticatedUser(
  req: IAuthenticatedRequest,
): Promise<IAccountProfile> {
  const userId = req.userId;
  if (!userId) {
    throw new UnauthorizedError("Vous devez être connecté.");
  }

  // cherche en BDD le compte dont l'id est dans le jeton
  const account = await accountDatamapper.findById(userId);
  // compte introuvable (ex. supprimé après la connexion par l'admin ou le client, jeton encore valide 24 h) → 401
  if (!account) {
    throw new UnauthorizedError("Vous devez être connecté.");
  }
  return account;
}
