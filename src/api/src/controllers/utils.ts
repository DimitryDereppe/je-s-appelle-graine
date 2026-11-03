import type { AuthenticatedRequest, IAccount } from "../@types/index.d.ts";
import { accountDatamapper } from "../datamappers/accountDatamapper.ts";
import { UnauthorizedError } from "../lib/errors.ts";

// --------------------------------
// recherche le compte connecté selon l'id rangé par isConnected dans la requête
// (comme getAuthenticatedUser dans controllers/utils.ts d'oQuiz)
// --------------------------------
export async function getAuthenticatedUser(
  req: AuthenticatedRequest,
): Promise<IAccount> {
  const userId = req.userId;
  if (!userId) {
    throw new UnauthorizedError("Vous devez être connecté.");
  }

  // compte supprimé depuis la connexion : le jeton ne correspond plus à personne
  const account = await accountDatamapper.findById(userId);
  if (!account) {
    throw new UnauthorizedError("Vous devez être connecté.");
  }
  return account;
}
