# Je s’appelle Graine

Plateforme e-commerce autour de la reforestation : le client choisit des arbres, nous les plantons dans une forêt partenaire et il suit leur plantation. Le paiement se fait hors ligne (virement ou chèque) : aucun paiement n’est encaissé sur le site.

Projet d’apothéose de la formation Concepteur Développeur d’Applications (O’clock), réalisé en 3 sprints par Dimitry, Fabrice, Loïc, Mahamadou et Shanna.

- **Site en ligne :** `https://A_COMPLETER.eddi.cloud`
- **Installer le projet :** [guide d’installation](INSTALLATION.md)
- **Déployer :** [guide de déploiement](DEPLOIEMENT.md)

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Démarrer en local](#démarrer-en-local)
- [Comptes pour essayer](#comptes-pour-essayer)
- [Tests](#tests)
- [Sécurité](#sécurité)
- [Pistes d’amélioration](#pistes-damélioration)
- [Documentation](#documentation)

## Fonctionnalités

**Visiteur**

- Accueil avec les arbres du moment, catalogue filtrable par catégorie, recherche par nom, fiche de chaque arbre.
- Inscription (particulier, entreprise ou association) et connexion.

**Client connecté**

- Panier enregistré en base : ajout, quantité de 1 à 100, retrait, compteur dans l’en-tête.
- Commande : récapitulatif, adresse de facturation, paiement par virement ou chèque, confirmation et email de confirmation.
- Espace client : historique et détail des commandes, annulation d’une commande en attente, informations personnelles, mot de passe, suppression du compte.
- Emails à chaque étape : paiement reçu, annulation, plantation.

**Administrateur**

- Catalogue : ajouter, modifier et retirer un arbre ; la photo est choisie parmi celles présentes sur le serveur ; un arbre déjà commandé ne peut pas être supprimé.
- Commandes : liste filtrée par statut, commandes en retard de paiement mises en évidence, passage à « payée », « plantée » ou « annulée » (avec l’email au client).
- Comptes : liste, détail, désactivation et réactivation, suppression ; le dernier administrateur ne peut être ni désactivé ni supprimé.

## Architecture

```text
Navigateur ──HTTPS──▶ Nginx ──┬──▶ Front Next.js (pages, /api relayé vers l’API)
                              │
                              └──▶ API Express ──▶ PostgreSQL
                                      │
                                      └──▶ Gmail (SMTP) pour les emails
```

Tout tourne dans Docker (`src/docker-compose.yml` en développement, `src/docker-compose.prod.yml` en production).

| Partie           | Technologies                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| Front            | Next.js 16.4 (App Router), React 19.3, TypeScript, CSS Modules                                            |
| API              | Node.js 24, Express 5.3, TypeScript, Zod 4 (validation), `pg` (SQL écrit à la main, sans ORM), Nodemailer |
| Authentification | JWT dans un cookie `httpOnly`, mots de passe hachés avec Argon2                                           |
| Base de données  | PostgreSQL 18                                                                                             |
| Production       | Docker Compose, Nginx (HTTPS avec Let’s Encrypt / Certbot), VPS                                           |
| Qualité          | ESLint, Prettier, Husky (vérifications à chaque commit), tests avec `node:test`                           |

**Organisation du code**

```text
src/
├── api/              API Express
│   ├── src/routers/      routes (une par fonctionnalité : arbres, panier, commandes, admin…)
│   ├── src/controllers/  validation Zod, règles métier, et leurs tests (*.spec.test.ts)
│   ├── src/datamappers/  requêtes SQL
│   ├── src/data/         01-schema.sql (tables) et 02-seed.sql (données de test)
│   └── test/             configuration des tests et fichiers .http
├── front/            Front Next.js
│   ├── src/app/          une page par dossier (arbres, panier, commandes, compte, admin…)
│   └── src/components/   composants partagés (en-tête, carte d’arbre, lignes de commande…)
└── nginx/            configuration de Nginx en production
```

## Démarrer en local

Le détail (Windows/WSL et macOS, variables d’environnement, dépannage) est dans le [guide d’installation](INSTALLATION.md). En résumé :

```bash
npm install
npm --prefix src/api ci
npm --prefix src/front ci
mkdir -p src/api/node_modules src/front/node_modules src/front/.next
cp src/.env.docker.example src/.env.docker   # puis remplacer A_REMPLIR par le mot de passe de la base
cd src
docker compose --env-file .env.docker up -d --build
```

| Service | Adresse                            |
| ------- | ---------------------------------- |
| Site    | `http://localhost:3000`            |
| API     | `http://localhost:4000/api/health` |
| Adminer | `http://localhost:8080`            |

En développement, aucun vrai email n’est envoyé : il est affiché dans les logs de l’API (`docker compose --env-file .env.docker logs -f api`).

## Comptes pour essayer

Données de test (`02-seed.sql`), à n’utiliser qu’en local :

- **Clients :** `alice@test.fr`, `charlie@test.fr`, `eve@test.fr`, mot de passe `Client12345!`
- **Comptes désactivés** (la connexion est refusée) : `bob@test.fr`, `david@test.fr`, même mot de passe
- **Administrateurs :** un compte par membre de l’équipe ; leurs mots de passe sont partagés en privé et ne sont jamais dans le dépôt.

## Tests

Depuis `src/api/`, Docker lancé :

```bash
npm test
```

- 230 tests d’intégration (chaque route et chaque code de réponse : 200, 400, 401, 403, 404, 409…) et 6 tests unitaires.
- Les tests d’intégration créent leur propre base dans un conteneur `graine_test`, puis la suppriment : ils ne touchent jamais à la base de développement.
- Les tests manuels, les audits Lighthouse et les résultats sont dans le [plan de tests](docs/tests/PLAN-DE-TESTS.md).
- Des fichiers `.http` (`src/api/test/`) permettent d’essayer chaque route à la main.

## Sécurité

- **Injections SQL :** toutes les requêtes sont paramétrées (`$1`, `$2`…).
- **XSS :** React échappe tout texte affiché ; les emails sont envoyés en texte brut.
- **Validation :** chaque donnée reçue par l’API est vérifiée par Zod avant d’atteindre la base.
- **Authentification :** JWT dans un cookie `httpOnly` (et `secure` en production), mots de passe hachés avec Argon2, comptes désactivables.
- **Droits :** les routes client vérifient que la ressource appartient au compte connecté ; les routes admin sont réservées au rôle administrateur (401, 403).
- **En-têtes HTTP :** `helmet` (Content-Security-Policy, `X-Frame-Options`, HSTS…), CORS limité au front.
- **Secrets :** jamais dans le dépôt (`.env` ignorés par Git, modèles `.env.example`).
- **RGPD :** suppression du compte par le client ; ses commandes restent en base pour la comptabilité, sans être consultables.

## Pistes d’amélioration

Ce qui n’a pas été fait dans le temps du projet, et comment nous le ferions :

- **Photo d’un arbre :** aujourd’hui, l’admin choisit parmi les photos du serveur. Étape suivante : envoyer une photo depuis l’admin (multer, avec un volume Docker en production), puis un stockage externe (Cloudinary, S3).
- **Adresse de facturation :** aujourd’hui, un seul champ de texte. Étapes suivantes : des champs séparés (rue, code postal, ville, pays) vérifiés par Zod, puis de vraies colonnes en base et une saisie assistée avec la Base Adresse Nationale.
- **Admin catalogue :** filtrer la liste par disponibilité (disponible, en rupture de stock, retiré).
- **Rôles :** un rôle « administrateur des ventes » (commandes et catalogue, sans les comptes) et le changement de rôle depuis l’admin.
- **Performance :** photos du catalogue plus légères (tailles adaptées à l’affichage), chargement prioritaire des premières photos.
- **Compte :** réinitialisation du mot de passe par email, acceptation des CGV avant la commande.
- **Communauté :** badges, campagnes de plantation, notifications (anniversaire d’un arbre), espace partenaire.
- **Qualité :** lancer les tests à chaque PR (GitHub Actions).

Les autres évolutions prévues sont dans la carte « Évolutions (hors MVP) » du Kanban.

## Documentation

### Suivi du projet

- [Carnet de bord de l’équipe](CARNET-DE-BORD-JE-S-APPELLE-GRAINE.md)
- Carnets de bord personnels : [Dimitry](CARNET-DE-BORD-DIMITRY.md), [Fabrice](CARNET-DE-BORD-FABRICE.md), [Loïc](CARNET-DE-BORD-LOIC.md), [Mahamadou](CARNET-DE-BORD-MAHAMADOU.md), [Shanna](CARNET-DE-BORD-SHANNA.md)

### Cadrage du projet

- [Cahier des charges](docs/specifications/CAHIER-DES-CHARGES-JE-S-APPELLE-GRAINE.md)
- [User stories](docs/specifications/user-stories.md)
- [Charte de nommage](docs/conventions/CHARTE-NOMMAGE-JE-S-APPELLE-GRAINE.md)
- [Plan de tests](docs/tests/PLAN-DE-TESTS.md)
- [Guide d’installation](INSTALLATION.md) et [guide de déploiement](DEPLOIEMENT.md)

### Diagrammes

- [Architecture de l’application](docs/conception/diagrammes/01-architecture.md)
- [Diagramme d’architecture](docs/conception/diagrammes/01b-diagramme-architecture.png)
- [Diagramme des cas d’utilisation](docs/conception/diagrammes/02-diagramme-cas-utilisation.png)
- [Diagramme de séquence — achat](docs/conception/diagrammes/03-diagramme-sequence-achat.png)
- [Diagramme d’activité — achat](docs/conception/diagrammes/04-diagramme-activite-achat.png)

### Modèle de données

Les documents de conception du modèle se trouvent dans [`docs/conception/modele-de-donnees/`](docs/conception/modele-de-donnees/).

- [Dictionnaire de données](docs/conception/modele-de-donnees/00-dictionnaire-de-donnees.md)
- [Entités](docs/conception/modele-de-donnees/01-entites.md)
- [Propriétés des entités](docs/conception/modele-de-donnees/02-entites-proprietes.md)
- [Relations](docs/conception/modele-de-donnees/03-relations.md)
- [Cardinalités des relations](docs/conception/modele-de-donnees/04-relations-cardinalites.md)
- [MCD](docs/conception/modele-de-donnees/05-mcd.md)
- [MLD](docs/conception/modele-de-donnees/06-mld.md)
- [MPD](docs/conception/modele-de-donnees/07-mpd.md)

### Design

- [Charte graphique](docs/design/charte-graphique/), [wireframes](docs/design/wireframes/) et [maquettes](docs/design/maquettes/)
