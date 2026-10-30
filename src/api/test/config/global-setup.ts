import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import type { Server } from "node:http";
import { after, before, beforeEach } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { app } from "../../src/app.ts";
import { pool } from "../../src/data/db-client.ts";

// ================================================================================
// Objectif de ce fichier : mettre en place l'environnement des tests d'intégration

// === AVANT le lancement des tests ===
// Création d'une BDD de test (conteneur graine_test)
// Chargement des variables d'environnement (.env.test) à l'aide du flag --env-file
// Création des tables dans la BDD de test (01-schema.sql)
// Lancement du serveur Express

// === Entre chaque test ===
// On vide les tables

// === APRES les tests ===
// Fermeture des connexions à la BDD
// Arrêt du serveur Express de test
// Suppression de la BDD de test
// ================================================================================

// Serveur HTTP (de test)
let server: Server;

// Hook before : s'exécute une fois avant l'ensemble des tests
before(async () => {
  // Ce setup efface les données : refuser toute autre base que la base de test
  const databaseUrl = new URL(process.env.DATABASE_URL || "");
  if (databaseUrl.pathname !== "/graine_test") {
    throw new Error("Les tests doivent cibler la base dédiée graine_test.");
  }

  // (Hack) S'assurer que la BDD de test a bien été supprimée
  execSync(`docker rm -f graine_test 2>/dev/null || true`);

  // Créer un conteneur BDD dédié aux tests
  // --tmpfs : les données de PostgreSQL sont en mémoire vive (RAM), pas sur le disque
  // - démarrage en ~3 s au lieu de ~45 s sur un disque dur classique
  // - sans risque ici : la BDD de test est supprimée à la fin des tests
  execSync(`
    docker run \
    -d \
    --name graine_test \
    --tmpfs /var/lib/postgresql \
    -p ${process.env.POSTGRES_PORT}:5432 \
    -e POSTGRES_USER=${process.env.POSTGRES_USER} \
    -e POSTGRES_PASSWORD=${process.env.POSTGRES_PASSWORD} \
    -e POSTGRES_DB=${process.env.POSTGRES_DB} \
    postgres:18-alpine
  `);

  // Vérifier que PostgreSQL répond avant de créer les tables
  await waitForDatabase();

  // Créer les tables dans la BDD de test : on exécute tout 01-schema.sql, comme Docker pour la base de dev
  // - readFileSync : lit le fichier (Sync : on attend la fin, sans souci ici, c'est fait une seule fois)
  // - "utf8" : renvoie du texte (sans lui, des octets bruts), avec les accents des commentaires
  // - chemin depuis src/api/ : on lance toujours les tests par npm test
  await pool.query(readFileSync("src/data/01-schema.sql", "utf8"));

  // On lance un serveur de test
  server = app.listen(process.env.PORT);
});

// Hook beforeEach : s'exécute une fois avant chaque test
beforeEach(async () => {
  await truncateTables();
});

// Hook after : s'exécute une fois après l'ensemble des tests
after(async () => {
  // On éteint le serveur HTTP
  server?.close();

  // On ferme les connexions à la BDD
  await pool.end();

  // On éteint la base de données de test
  execSync(`docker rm -f graine_test`);
});

// essaye 10 fois de se connecter à la BDD (1 fois par seconde)
// si une connexion répond, on continue
// si toutes les tentatives de connexion ont échoué -> lance une erreur
async function waitForDatabase() {
  const maxAttempts = 10;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Cette requête ne nécessite aucune table : elles sont créées ensuite
      await pool.query("SELECT 1");
      return;
    } catch (error) {
      // les 10 tentatives ont échoué --> lance une erreur
      if (attempt === maxAttempts) {
        throw new Error(
          `PostgreSQL indisponible après ${maxAttempts} tentatives`,
          {
            cause: error,
          },
        );
      }

      // Attente non bloquante d'une seconde entre deux tentatives
      await delay(1000);
    }
  }
}

async function truncateTables() {
  // https://stackoverflow.com/questions/3327312/how-can-i-drop-all-the-tables-in-a-postgresql-database
  await pool.query(`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE "' || r.tablename || '" RESTART IDENTITY CASCADE';
      END LOOP;
    END $$;
  `);
}
