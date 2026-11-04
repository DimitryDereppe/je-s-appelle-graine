import { describe, it } from "node:test";
import assert from "node:assert";
import type { NextFunction, Response } from "express";
import type { IAuthenticatedRequest, Role } from "../@types/index.d.ts";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.ts";
import { checkRoles } from "./isConnectedMiddleware.ts";

// Test unitaire : on appelle le middleware directement (pas besoin de BDD).
// Il couvre le cas que les tests d'intégration ne peuvent pas déclencher :
// checkRoles placé sans isConnected (aucun rôle dans la requête).

// fausse requête : seul userRole sert à checkRoles
function fakeRequest(userRole?: Role) {
  return { userRole } as IAuthenticatedRequest;
}
const fakeResponse = {} as Response;

describe("checkRoles", () => {
  it("should call next() if the role is allowed", () => {
    // Arrange : un next() qui note qu'il a été appelé
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    // Act
    checkRoles(["admin"])(fakeRequest("admin"), fakeResponse, next);

    // Assert
    assert.ok(nextCalled, "next() aurait dû être appelé");
  });

  it("should throw ForbiddenError (403) if the role is not allowed", () => {
    // Arrange : pas besoin ici

    // Act : un client sur une route admin ; on attrape l'erreur lancée par le middleware
    let error;
    try {
      checkRoles(["admin"])(fakeRequest("customer"), fakeResponse, () => {});
    } catch (caughtError) {
      error = caughtError;
    }

    // Assert : une ForbiddenError (403)
    assert.ok(error instanceof ForbiddenError, "ForbiddenError attendue");
    assert.strictEqual(error.status, 403);
  });

  it("should throw UnauthorizedError (401) if there is no role", () => {
    // Arrange : pas besoin ici

    // Act : isConnected oublié, la requête n'a pas de rôle ; on attrape l'erreur
    let error;
    try {
      checkRoles(["admin"])(fakeRequest(), fakeResponse, () => {});
    } catch (caughtError) {
      error = caughtError;
    }

    // Assert : une UnauthorizedError (401)
    assert.ok(error instanceof UnauthorizedError, "UnauthorizedError attendue");
    assert.strictEqual(error.status, 401);
  });
});
