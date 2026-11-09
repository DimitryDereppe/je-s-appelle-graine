-- =============================================================================
-- Je s'appelle Graine : création de la base (extension + 8 tables)
-- Source : docs/conception/modele-de-donnees/07-mpd.md et 00-dictionnaire-de-donnees.md
-- Exécuté automatiquement par PostgreSQL au premier démarrage du conteneur
-- (dossier /docker-entrypoint-initdb.d), avant 02-seed.sql.
-- =============================================================================

BEGIN;

-- Fournit unaccent() pour la recherche par nom sans accents (US03b)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- -----------------------------------------------------------------------------
-- Tables de référence (remplies par 02-seed.sql)
-- -----------------------------------------------------------------------------

CREATE TABLE role (
  id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE                 -- 'customer', 'admin'
);

CREATE TABLE category (
  id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE                -- Résineux, Feuillage caduc, Feuillage persistant
);

CREATE TABLE availability (
  id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE                 -- 'disponible', 'en rupture de stock', 'retiré'
);

-- -----------------------------------------------------------------------------
-- Comptes ("user" est un mot réservé de PostgreSQL)
-- -----------------------------------------------------------------------------

CREATE TABLE account (
  id                INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email             VARCHAR(255) NOT NULL UNIQUE,
  password          VARCHAR(255) NOT NULL,       -- haché en Argon2, jamais en clair
  firstname         VARCHAR(100) NOT NULL,
  lastname          VARCHAR(100) NOT NULL,
  address           VARCHAR(255),
  account_type      VARCHAR(20)  NOT NULL DEFAULT 'particulier'
                    CHECK (account_type IN ('particulier', 'association', 'entreprise')),
  organization_name VARCHAR(150),
  is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
  role_id           INT          NOT NULL REFERENCES role (id)
);

-- -----------------------------------------------------------------------------
-- Catalogue
-- -----------------------------------------------------------------------------

CREATE TABLE tree (
  id                INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name              VARCHAR(150)  NOT NULL,
  description       TEXT,
  price             NUMERIC(10,2) NOT NULL CHECK (price >= 0),   -- prix TTC
  photo_url         VARCHAR(255),                                 -- ex. /images/trees/pin-maritime.webp
  planting_location VARCHAR(150),
  category_id       INT NOT NULL REFERENCES category (id),
  avail ability_id   INT NOT NULL REFERENCES availability (id)
);

-- -----------------------------------------------------------------------------
-- Panier : l'ensemble des lignes cart_item d'un compte (pas de table "cart")
-- -----------------------------------------------------------------------------

CREATE TABLE cart_item (
  id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id INT NOT NULL REFERENCES account (id) ON DELETE CASCADE,
  tree_id    INT NOT NULL REFERENCES tree (id) ON DELETE CASCADE,
  quantity   INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  UNIQUE (account_id, tree_id)                    -- un arbre une seule fois par panier
);

-- -----------------------------------------------------------------------------
-- Commandes ("order" est un mot réservé de PostgreSQL)
-- -----------------------------------------------------------------------------

CREATE TABLE purchase (
  id                 INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  purchase_date      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  status             VARCHAR(20)   NOT NULL DEFAULT 'en attente'
                     CHECK (status IN ('en attente', 'payée', 'plantée', 'annulée')),
  total_amount       NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_method     VARCHAR(20)   NOT NULL
                     CHECK (payment_method IN ('virement', 'chèque')),
  -- Identité de l'acheteur figée au moment de la commande
  buyer_firstname    VARCHAR(100)  NOT NULL,
  buyer_lastname     VARCHAR(100)  NOT NULL,
  buyer_email        VARCHAR(255)  NOT NULL,
  buyer_organization VARCHAR(150),
  buyer_address      VARCHAR(255),
  -- Date de chaque changement de statut
  paid_at            TIMESTAMPTZ,
  planted_at         TIMESTAMPTZ,
  cancelled_at       TIMESTAMPTZ,
  -- Compte supprimé : la commande reste, sans propriétaire
  account_id         INT REFERENCES account (id) ON DELETE SET NULL
);

CREATE TABLE purchase_line (
  id                INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  purchase_id       INT NOT NULL REFERENCES purchase (id) ON DELETE CASCADE,
  tree_id           INT NOT NULL REFERENCES tree (id),   -- un arbre commandé ne peut plus être supprimé
  -- Copiés depuis tree au moment de l'achat
  tree_name         VARCHAR(150)  NOT NULL,
  unit_price        NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  planting_location VARCHAR(150),
  quantity          INT NOT NULL CHECK (quantity > 0)
);

COMMIT;
