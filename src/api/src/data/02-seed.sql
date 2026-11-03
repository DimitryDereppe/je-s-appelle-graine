-- =============================================================================
-- Je s'appelle Graine : données de départ
-- Exécuté après 01-schema.sql, sur une base neuve : les id commencent à 1
-- dans l'ordre des INSERT (les id cités en commentaire en dépendent).
-- Mots de passe : hachés en Argon2 (argon2id). Les mots de passe en clair des
-- admins ne sont PAS dans le dépôt : ils sont partagés en privé dans l'équipe.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Tables de référence
-- -----------------------------------------------------------------------------

-- 1 = customer, 2 = admin
INSERT INTO role (name) VALUES
  ('customer'),
  ('admin');

-- 1 = Résineux, 2 = Feuillage caduc, 3 = Feuillage persistant
INSERT INTO category (name) VALUES
  ('Résineux'),
  ('Feuillage caduc'),
  ('Feuillage persistant');

-- 1 = disponible (visible, commandable)
-- 2 = en rupture de stock (visible, non commandable)
-- 3 = retiré (masqué, conservé pour l'historique)
INSERT INTO availability (name) VALUES
  ('disponible'),
  ('en rupture de stock'),
  ('retiré');

-- -----------------------------------------------------------------------------
-- Comptes : id 1 à 5 = administrateurs (l'équipe), id 6 à 10 = clients de test
-- Les 3 types de compte sont représentés ; id 7 et 9 sont désactivés
-- (is_active = FALSE : la connexion doit répondre 403).
-- -----------------------------------------------------------------------------

INSERT INTO account (email, password, firstname, lastname, address, account_type, organization_name, is_active, role_id) VALUES
  -- id 1 : admin
  ('dimitry@graine.fr', '$argon2id$v=19$m=65536,p=4,t=3$lWcxnnGk6G4e8gL0JO+Suw$c95TfPZxRAGncKxWECC+VgSvQotUIlS8D5+2TkZIapg', 'Dimitry', 'Dereppe', NULL, 'particulier', NULL, TRUE, 2),
  -- id 2 : admin
  ('loic@graine.fr', '$argon2id$v=19$m=65536,p=4,t=3$KtFpnBhpB+wZXlFm9HF4MA$x8A/8GB3dDRGudzlvDJma2JyCZk9WphVEP3iLUTM/VQ', 'Loïc', 'Roch', NULL, 'particulier', NULL, TRUE, 2),
  -- id 3 : admin
  ('shanna@graine.fr', '$argon2id$v=19$m=65536,p=4,t=3$YYzxFWlq1gb68cTvrBo/xA$co5vFDM/6nkK++NDoP6NoF/FbUIJ8NTD9B0JgOCzLGw', 'Shanna', 'Etna', NULL, 'particulier', NULL, TRUE, 2),
  -- id 4 : admin
  ('mahamadou@graine.fr', '$argon2id$v=19$m=65536,p=4,t=3$qTTMVmo8srvq/vGntxG4tg$fD8DoJ18fhMv0+MIh1vtUy/AxUSNCvPaAALQOUic6Qg', 'Mahamadou', 'Doucantji', NULL, 'particulier', NULL, TRUE, 2),
  -- id 5 : admin
  ('fabrice@graine.fr', '$argon2id$v=19$m=65536,p=4,t=3$EyLKl5CbSJuNiO7GkuzF8A$2i/oLtc06lzJuxGl7j6RlStreTGpcGOljXclgP9uNpU', 'Fabrice', 'Seny Couty', NULL, 'particulier', NULL, TRUE, 2),
  -- id 6 : client, particulier
  ('alice@test.fr', '$argon2id$v=19$m=65536,p=4,t=3$jgNVnAOfqCd8NO1JTBZqJw$Ed7EnBeQMWKEj51rhyUgOPs1b7PtAI6HGhpm52CyzQg', 'Alice', 'Martin', '12 rue des Tilleuls, 35000 Rennes', 'particulier', NULL, TRUE, 1),
  -- id 7 : client, particulier, DÉSACTIVÉ
  ('bob@test.fr', '$argon2id$v=19$m=65536,p=4,t=3$oT7d1U5umMST4MU1icemjA$EmGVAmiQ4nF2i87vZFeqF/eAs0ULt9A29FViyHJEh8c', 'Bob', 'Bernard', NULL, 'particulier', NULL, FALSE, 1),
  -- id 8 : client, association
  ('charlie@test.fr', '$argon2id$v=19$m=65536,p=4,t=3$SaU6UAw+S6L1CmdyCY2/YA$VWjA0GR9fHmBQA/q6IwYRtzOXrsJ3FgDbUP5US1Wyuk', 'Charlie', 'Lefèvre', '5 place de la Mairie, 33720 Landiras', 'association', 'Les Amis de la Forêt des Landes', TRUE, 1),
  -- id 9 : client, entreprise, DÉSACTIVÉ
  ('david@test.fr', '$argon2id$v=19$m=65536,p=4,t=3$9rhyWfsoMqtV9b3r95uusw$+cwEcM1DiE4jhIhS8UalX7nvB+Tv4dfa+MbnTKZ6MT4', 'David', 'Dubois', '48 avenue Jean Jaurès, 11000 Carcassonne', 'entreprise', 'Dubois Menuiserie SARL', FALSE, 1),
  -- id 10 : client, entreprise
  ('eve@test.fr', '$argon2id$v=19$m=65536,p=4,t=3$ZWmv5owU/GH5oNfYeurCMA$eycuUb6MFyC68CU3VAqQCCae0n72+ueIJBytoiurhFg', 'Eve', 'Benali', NULL, 'entreprise', 'Verdure & Co', TRUE, 1);

-- -----------------------------------------------------------------------------
-- Arbres : 13 disponibles, 5 en rupture de stock (id 7, 10, 11, 18, 21), 3 retirés (id 4, 6, 17)
-- L'accueil affiche les 3 derniers arbres DISPONIBLES (id le plus grand) :
-- id 20, 19, 16 (Chêne vert, Filaire à larges feuilles, Arbousier).
-- Les id 21 et 18 (en rupture de stock) et 17 (retiré), plus récents, servent aux tests
-- « un arbre en rupture de stock ou retiré n'apparaît pas sur l'accueil ».
-- -----------------------------------------------------------------------------

INSERT INTO tree (name, description, price, photo_url, planting_location, category_id, availability_id) VALUES
  -- Résineux (category_id = 1) : id 1 à 7
  -- id 1
  ('Pin maritime',
   'L''arbre emblématique des Landes. Ses cônes s''ouvrent à la chaleur et libèrent leurs graines après le feu.',
   9.90, '/images/trees/pin-maritime.webp', 'Forêt des Landes de Gascogne — Landiras (33)', 1, 1),
  -- id 2
  ('Pin sylvestre',
   'Robuste et peu exigeant, il pousse sur les sols pauvres et acides des landes bretonnes.',
   10.90, '/images/trees/pin-sylvestre.webp', 'Monts d''Arrée — Finistère (29)', 1, 1),
  -- id 3
  ('Pin d''Alep',
   'Pin méditerranéen très résistant à la sécheresse, il recolonise rapidement les zones brûlées.',
   11.50, '/images/trees/pin-alep.webp', 'Massif des Corbières — Aude (11)', 1, 1),
  -- id 4 : retiré
  ('Pin parasol',
   'Reconnaissable à sa couronne en ombrelle, il produit les pignons de pin.',
   14.90, '/images/trees/pin-parasol.webp', 'Massif des Maures — Gonfaron (83)', 1, 3),
  -- id 5
  ('Sapin pectiné',
   'Grand sapin des forêts de montagne, il apprécie la fraîcheur et l''ombre des versants du Jura.',
   12.90, '/images/trees/sapin-pectine.webp', 'Massif du Jura — Cerniébaud (39)', 1, 1),
  -- id 6 : retiré
  ('Épicéa commun',
   'Conifère des montagnes, à croissance rapide, au bois très utilisé en charpente.',
   9.50, '/images/trees/epicea-commun.webp', 'Massif du Jura — Cerniébaud (39)', 1, 3),
  -- id 7 : en rupture de stock
  ('If commun',
   'Arbre légendaire pouvant vivre plus de mille ans, à la croissance très lente. Toutes ses parties sauf la chair rouge du fruit sont toxiques.',
   19.90, '/images/trees/if-commun.webp', 'Forêt de Brocéliande — Paimpont (35)', 1, 2),
  -- Feuillage caduc (category_id = 2) : id 8 à 14
  -- id 8
  ('Chêne pédonculé',
   'Le chêne des forêts légendaires de Brocéliande, refuge de centaines d''espèces d''insectes et d''oiseaux.',
   16.90, '/images/trees/chene-pedoncule.webp', 'Forêt de Brocéliande — Paimpont (35)', 2, 1),
  -- id 9
  ('Bouleau verruqueux',
   'Arbre pionnier à l''écorce blanche, l''un des premiers à repousser après un incendie.',
   11.90, '/images/trees/bouleau-verruqueux.webp', 'Monts d''Arrée — Finistère (29)', 2, 1),
  -- id 10 : en rupture de stock
  ('Sorbier des oiseleurs',
   'Petit arbre de montagne et de lande, ses baies rouges nourrissent les oiseaux en automne.',
   13.50, '/images/trees/sorbier-oiseleurs.webp', 'Monts d''Arrée — Finistère (29)', 2, 2),
  -- id 11 : en rupture de stock
  ('Chêne tauzin',
   'Chêne du Sud-Ouest adapté aux sols sableux, il rejette de souche après le passage du feu.',
   15.90, '/images/trees/chene-tauzin.webp', 'Forêt des Landes de Gascogne — Landiras (33)', 2, 2),
  -- id 12
  ('Châtaignier',
   'Arbre nourricier des Maures, il repart vigoureusement de sa souche après un incendie.',
   15.50, '/images/trees/chataignier.webp', 'Massif des Maures — Gonfaron (83)', 2, 1),
  -- id 13
  ('Chêne pubescent',
   'Chêne aux feuilles duveteuses, très tolérant à la chaleur et à la sécheresse méditerranéennes.',
   16.50, '/images/trees/chene-pubescent.webp', 'Massif des Corbières — Aude (11)', 2, 1),
  -- id 14
  ('Érable sycomore',
   'Grand érable de montagne au feuillage dense, qui pousse vite et stabilise les sols.',
   14.50, '/images/trees/erable-sycomore.webp', 'Massif du Jura — Cerniébaud (39)', 2, 1),
  -- Feuillage persistant (category_id = 3) : id 15 à 21
  -- id 15
  ('Houx commun',
   'Arbre aux feuilles piquantes et aux baies rouges, qui forme le sous-bois des forêts bretonnes.',
   17.90, '/images/trees/houx-commun.webp', 'Forêt de Brocéliande — Paimpont (35)', 3, 1),
  -- id 16
  ('Arbousier',
   'Ses fruits rouges ressemblent à des fraises. Il rejette très vite de souche après le feu.',
   18.50, '/images/trees/arbousier.webp', 'Forêt des Landes de Gascogne — Landiras (33)', 3, 1),
  -- id 17 : retiré
  ('Laurier noble',
   'Le laurier-sauce de la cuisine, qui supporte bien le climat doux de la côte atlantique.',
   16.90, '/images/trees/laurier-noble.webp', 'Forêt des Landes de Gascogne — Landiras (33)', 3, 3),
  -- id 18 : en rupture de stock
  ('Chêne-liège',
   'Son écorce épaisse (le liège) protège l''arbre du feu : il survit souvent aux incendies.',
   22.90, '/images/trees/chene-liege.webp', 'Massif des Maures — Gonfaron (83)', 3, 2),
  -- id 19
  ('Filaire à larges feuilles',
   'Petit arbre méditerranéen au feuillage vert sombre, très résistant à la sécheresse.',
   17.50, '/images/trees/filaire-larges-feuilles.webp', 'Massif des Maures — Gonfaron (83)', 3, 1),
  -- id 20
  ('Chêne vert',
   'Le chêne des garrigues, toujours vert, capable de repousser de souche après un incendie.',
   19.50, '/images/trees/chene-vert.webp', 'Massif des Corbières — Aude (11)', 3, 1),
  -- id 21 : en rupture de stock
  ('Olivier sauvage',
   'L''ancêtre sauvage de l''olivier cultivé, adapté aux sols secs et caillouteux.',
   21.90, '/images/trees/olivier-sauvage.webp', 'Massif des Corbières — Aude (11)', 3, 2);

COMMIT;
