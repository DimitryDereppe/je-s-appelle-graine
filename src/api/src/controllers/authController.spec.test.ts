import { describe, it } from "node:test";
import assert from "node:assert";
import * as libTests from "../../test/index.ts";
import { ACCESS_COOKIE_NAME } from "../lib/token.ts";
import jwt from "jsonwebtoken";
import { config } from "../../config.ts";

// Test d'intégration : requête HTTP et BDD de test
describe("authController", () => {
  // ==================
  // POST /auth (pour login)
  // ==================
  describe("[POST] /api/auth", () => {
    // Doit répondre 200 et l'accessToken est dans le cookie
    it("should respond 200 and set accessToken cookie", async () => {
      // Arrange : données du formulaire de connexion
      const loginAlice = {
        email: libTests.ALICE.email,
        password: libTests.ALICE.password,
      };
      await libTests.createAccount(libTests.ALICE);

      // Act : envoie une requête POST /auth avec axios
      const response = await libTests.requester.post("/auth", loginAlice);
      const bodyReponse = response.data;

      // Assert :
      // test code réponse 200 OK
      assert.strictEqual(response.status, 200, JSON.stringify(bodyReponse));

      // test access token existe dans la réponse
      const accessToken = libTests.getTokenFromResponse(
        response,
        ACCESS_COOKIE_NAME,
      );
      assert.ok(accessToken, "access token n'existe pas");
    });

    // Doit poser le cookie avec les options du contrat #83
    it("should set accessToken cookie with HttpOnly, SameSite=Lax, Max-Age 24h and Path=/", async () => {
      // Arrange : ALICE existe en BDD
      await libTests.createAccount(libTests.ALICE);
      const loginAlice = {
        email: libTests.ALICE.email,
        password: libTests.ALICE.password,
      };

      // Act : envoie une requête POST /auth avec axios
      const response = await libTests.requester.post("/auth", loginAlice);

      // Assert :
      // tout le cookie : "accessToken=<jeton>; Max-Age=86400; Path=/; Expires=...; HttpOnly; SameSite=Lax"
      const cookie = libTests.findCookieFromResponse(
        response,
        ACCESS_COOKIE_NAME,
      );
      assert.ok(cookie, "cookie accessToken n'existe pas");

      // HttpOnly : le JavaScript du navigateur ne peut pas lire le jeton (protection XSS)
      assert.ok(cookie.includes("HttpOnly"), cookie);
      // SameSite=Lax : un autre site ne peut pas envoyer le cookie avec un POST (protection CSRF)
      assert.ok(cookie.includes("SameSite=Lax"), cookie);
      // Max-Age=86400 : le navigateur garde le cookie 24 h (24 * 60 * 60 secondes)
      assert.ok(cookie.includes("Max-Age=86400"), cookie);
      // Path=/ : le cookie est envoyé sur toutes les routes de l'API
      assert.ok(cookie.includes("Path=/"), cookie);
      // pas de Secure en test : il n'est mis qu'en production (HTTPS)
      assert.ok(!cookie.includes("Secure"), cookie);
    });

    // Doit créer un jeton signé qui contient l'id et le rôle, valable 24 h
    it("should create a valid JWT with userId, userRole and 24h expiration", async () => {
      // Arrange : ALICE existe en BDD, on garde son id pour le comparer au jeton
      const aliceId = await libTests.createAccount(libTests.ALICE);
      const loginAlice = {
        email: libTests.ALICE.email,
        password: libTests.ALICE.password,
      };

      // Act : envoie une requête POST /auth avec axios
      const response = await libTests.requester.post("/auth", loginAlice);
      const accessToken = libTests.getTokenFromResponse(
        response,
        ACCESS_COOKIE_NAME,
      );

      // Assert :
      // jwt.verify vérifie la signature avec la même clé que l'API (sinon il lance une erreur)
      // et renvoie le payload : { userId, userRole, iat, exp }
      const payload = jwt.verify(
        accessToken,
        config.jwtSecret,
      ) as jwt.JwtPayload;

      // le jeton contient l'id et le rôle d'ALICE
      assert.strictEqual(payload.userId, aliceId);
      assert.strictEqual(payload.userRole, "customer");

      // iat : date de création, exp : date d'expiration (en secondes) → 24 h d'écart
      assert.strictEqual(payload.exp! - payload.iat!, 24 * 60 * 60);
    });

    // Doit répondre 401 si le mot de passe est faux
    it("should respond 401 if password is wrong", async () => {
      // Arrange : ALICE existe, mais on envoie un autre mot de passe
      await libTests.createAccount(libTests.ALICE);
      const loginAlice = {
        email: libTests.ALICE.email,
        password: "MauvaisMotDePasse!",
      };

      // Act : envoie une requête POST /auth avec axios
      const response = await libTests.requester.post("/auth", loginAlice);
      const bodyReponse = response.data;

      // Assert :
      // test code réponse 401 Unauthorized, sans dire si l'email existe
      assert.strictEqual(response.status, 401, JSON.stringify(bodyReponse));
      assert.strictEqual(bodyReponse.error, "Email ou mot de passe incorrect.");

      // pas de cookie : l'utilisateur n'est pas connecté
      const accessToken = libTests.getTokenFromResponse(
        response,
        ACCESS_COOKIE_NAME,
      );
      assert.ok(!accessToken, "access token existe");
    });

    // Doit répondre 401 si l'email n'existe pas, avec le même message
    it("should respond 401 if email does not exist", async () => {
      // Arrange : aucun compte en BDD
      const loginInconnu = {
        email: "inconnu@test.fr",
        password: libTests.ALICE.password,
      };

      // Act : envoie une requête POST /auth avec axios
      const response = await libTests.requester.post("/auth", loginInconnu);
      const bodyReponse = response.data;

      // Assert :
      // même code et même message que pour un mauvais mot de passe : on ne révèle pas si l'email existe
      assert.strictEqual(response.status, 401, JSON.stringify(bodyReponse));
      assert.strictEqual(bodyReponse.error, "Email ou mot de passe incorrect.");

      // pas de cookie : l'utilisateur n'est pas connecté
      const accessToken = libTests.getTokenFromResponse(
        response,
        ACCESS_COOKIE_NAME,
      );
      assert.ok(!accessToken, "access token existe");
    });

    // Doit répondre 403 si le compte est désactivé
    it("should respond 403 if account is disabled", async () => {
      // Arrange : ALICE existe mais son compte est désactivé par l'admin
      // { ...libTests.ALICE, isActive: false } "spread operator" : une copie d'ALICE, avec isActive remplacé
      await libTests.createAccount({ ...libTests.ALICE, isActive: false });
      const loginAlice = {
        email: libTests.ALICE.email,
        password: libTests.ALICE.password,
      };

      // Act : envoie une requête POST /auth avec axios
      const response = await libTests.requester.post("/auth", loginAlice);
      const bodyReponse = response.data;

      // Assert :
      // test code réponse 403 Forbidden, même avec le bon mot de passe
      assert.strictEqual(response.status, 403, JSON.stringify(bodyReponse));
      assert.strictEqual(
        bodyReponse.error,
        "Ce compte est désactivé, veuillez contacter l'administrateur.",
      );
    });

    // Doit répondre 400 si l'email n'est pas valide
    it("should respond 400 if email is invalid", async () => {
      // Arrange : un email sans @ (aucun compte nécessaire : Zod refuse avant la BDD)
      const loginInvalide = {
        email: "alice",
        password: libTests.ALICE.password,
      };

      // Act : envoie une requête POST /auth avec axios
      const response = await libTests.requester.post("/auth", loginInvalide);
      const bodyReponse = response.data;

      // Assert :
      // test code réponse 400 Bad Request, message du schéma Zod
      assert.strictEqual(response.status, 400, JSON.stringify(bodyReponse));
      assert.strictEqual(
        bodyReponse.error,
        "Veuillez saisir une adresse e-mail valide.",
      );
    });

    // Doit répondre 400 si le mot de passe est vide
    it("should respond 400 if password is empty", async () => {
      // Arrange : un mot de passe vide (aucun compte nécessaire : Zod refuse avant la BDD)
      const loginMotDePasseVide = {
        email: libTests.ALICE.email,
        password: "",
      };

      // Act : envoie une requête POST /auth avec axios
      const response = await libTests.requester.post(
        "/auth",
        loginMotDePasseVide,
      );
      const bodyReponse = response.data;

      // Assert :
      // test code réponse 400 Bad Request, message du .min(1) du schéma Zod
      assert.strictEqual(response.status, 400, JSON.stringify(bodyReponse));
      assert.strictEqual(
        bodyReponse.error,
        "Veuillez saisir votre mot de passe.",
      );
    });

    // Doit répondre 400 si le mot de passe est absent
    it("should respond 400 if password is missing", async () => {
      // Arrange : pas de champ password dans le body
      const loginSansMotDePasse = {
        email: libTests.ALICE.email,
      };

      // Act : envoie une requête POST /auth avec axios
      const response = await libTests.requester.post(
        "/auth",
        loginSansMotDePasse,
      );
      const bodyReponse = response.data;

      // Assert :
      // test code réponse 400 Bad Request, message du schéma Zod
      assert.strictEqual(response.status, 400, JSON.stringify(bodyReponse));
      assert.strictEqual(
        bodyReponse.error,
        "Veuillez saisir votre mot de passe.",
      );
    });
  });

  // ==================
  // DELETE /auth (pour logout)
  // ==================
  describe("[DELETE] /api/auth", () => {
    it("should respond 204 and empty cookie", async () => {
      // Arrange : ALICE existe en BDD et se connecte
      // (la déconnexion est réservée à un utilisateur connecté : isConnected sur la route)
      await libTests.createAccount(libTests.ALICE);
      const loginResponse = await libTests.requester.post("/auth", {
        email: libTests.ALICE.email,
        password: libTests.ALICE.password,
      });
      // on ne garde que "accessToken=<jeton>", sans les options (Path, HttpOnly…)
      const cookie = libTests
        .findCookieFromResponse(loginResponse, ACCESS_COOKIE_NAME)
        .split(";")[0];

      // Act : envoie une requête DELETE /auth avec le cookie de connexion
      const response = await libTests.requester.delete("/auth", {
        headers: { Cookie: cookie },
      });

      // Assert :
      // test code réponse 204 No Content
      assert.strictEqual(response.status, 204);

      // le cookie renvoyé est vide : le navigateur le supprime
      const newAccessToken = libTests.getTokenFromResponse(
        response,
        ACCESS_COOKIE_NAME,
      );
      assert.ok(!newAccessToken, "Nouveau access token existe");
    });

    // isConnected est sur la route DELETE /auth : sans cookie → 401
    it("should respond 401 if not connected", async () => {
      // Act : envoie une requête DELETE /auth sans cookie
      const response = await libTests.requester.delete("/auth");

      // Assert : isConnected refuse la requête
      assert.strictEqual(response.status, 401);
    });
  });
});
