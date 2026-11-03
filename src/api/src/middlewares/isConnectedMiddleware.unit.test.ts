import { describe, it } from "node:test";
import assert from "node:assert";
import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../@types/index.d.ts";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.ts";
import { checkRoles } from "./isConnectedMiddleware.ts";

// Test unitaire : on appelle le middleware directement, sans serveur ni BDD.
// Il couvre le cas que les tests d'intégration ne peuvent pas déclencher :
// checkRoles placé sans isConnected (aucun rôle dans la requête).

// fausse requête : seul userRole sert à checkRoles
function fakeRequest(userRole?: "customer" | "admin") {
  return { userRole } as AuthenticatedRequest;
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
    // Act + Assert : un client sur une route admin
    assert.throws(
      () =>
        checkRoles(["admin"])(fakeRequest("customer"), fakeResponse, () => {}),
      ForbiddenError,
    );
  });

  it("should throw UnauthorizedError (401) if there is no role", () => {
    // Act + Assert : isConnected oublié, la requête n'a pas de rôle
    assert.throws(
      () => checkRoles(["admin"])(fakeRequest(), fakeResponse, () => {}),
      UnauthorizedError,
    );
  });
});
