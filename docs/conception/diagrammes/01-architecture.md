# Architecture de l'application — Je s’appelle Graine

## Lire le diagramme

- Chaque **rectangle** est une brique de l'application ; les **cadres** regroupent ce qui tourne au même endroit.
- Les **flèches** indiquent qui appelle qui, avec le protocole utilisé sur la flèche.
- Le navigateur ne parle **jamais** directement à la base de données : tout passe par l'API.

## 1. Vue d'ensemble (environnement distant : le VPS)

Toute l'application est hébergée sur un **VPS** (serveur privé virtuel loué), chaque brique dans son conteneur Docker. Un serveur web placé devant reçoit toutes les requêtes HTTPS, envoie celles qui commencent par `/api` à l'API et les autres au front-end : le site et l'API partagent ainsi le même nom de domaine.

```mermaid
flowchart TB
    U["Utilisateur<br/>(visiteur, client, admin)"]

    subgraph NAV["Navigateur (mobile / ordinateur)"]
        P["Pages du site<br/>React"]
    end

    subgraph VPS["VPS — conteneurs Docker (Docker Compose)"]
        W["Serveur web<br/>HTTPS, aiguillage des requêtes"]
        F["Front-end Next.js<br/>pages publiques, catalogue, panier,<br/>paiement, espace client, administration"]
        API["API REST Je s’appelle Graine<br/>Node.js + Express"]
        DB[("PostgreSQL<br/>comptes, arbres, paniers, commandes<br/>(volume de données sauvegardé)")]
    end

    MAIL["Service d'envoi d'emails<br/>(prestataire SMTP)"]
    BOX["Boîte mail du client"]

    U --> P
    P -- "HTTPS : pages et requêtes /api/...<br/>+ cookie de session" --> W
    W -- "pages" --> F
    W -- "/api/..." --> API
    API -- "réseau Docker interne<br/>(base non exposée sur Internet)" --> DB
    API -- "SMTP : confirmation de commande,<br/>réception du paiement" --> MAIL
    MAIL --> BOX
```

## 2. Intérieur de l'API REST

Le cahier des charges sépare le back-end en couches : chaque couche a un seul rôle et n'appelle que la couche juste en dessous.

```mermaid
flowchart TB
    REQ["Requête HTTP<br/>(ex. POST /api/orders)"]

    subgraph API["API REST Je s’appelle Graine — Express"]
        R["Routeur<br/>associe l'URL et la méthode à un contrôleur"]
        M["Middlewares<br/>validation des données, vérification<br/>de la session et du rôle (401 / 403)"]
        C["Contrôleurs<br/>lisent la requête, renvoient la réponse JSON"]
        S["Services métier<br/>règles du projet (disponibilité des arbres,<br/>engagement de paiement, calcul du total,<br/>mot de passe Argon2, envoi des emails...)"]
        D["DataMappers<br/>requêtes SQL paramétrées"]
    end

    DB[("PostgreSQL")]
    MAIL["Service d'envoi d'emails"]

    REQ --> R --> M --> C --> S --> D --> DB
    S -- "email" --> MAIL
    DB -. "lignes trouvées" .-> D
    D -. "données" .-> S
    S -. "résultat" .-> C
    C -. "réponse JSON + code HTTP" .-> REQ
```

## 3. Environnement de développement

En local, Docker Compose lance les mêmes conteneurs que sur le VPS, pour que tout le monde travaille avec la même configuration.

```mermaid
flowchart LR
    subgraph POSTE["Poste du développeur"]
        subgraph COMPOSE["Docker Compose"]
            F["Conteneur front-end<br/>Next.js"]
            API["Conteneur API<br/>Node.js + Express"]
            DB[("Conteneur PostgreSQL<br/>(base locale)")]
        end
        H["Husky<br/>vérifications avant chaque commit"]
    end

    F -- "HTTP / JSON" --> API
    API -- "réseau Docker" --> DB
```

## Récapitulatif

| Brique | Technologie | Hébergement (distant) | En développement |
| --- | --- | --- | --- |
| Serveur web | À choisir | VPS (conteneur Docker) | — |
| Front-end | Next.js / React | VPS (conteneur Docker) | Conteneur Docker (Docker Compose) |
| API REST | Node.js + Express | VPS (conteneur Docker) | Conteneur Docker (Docker Compose) |
| Base de données | PostgreSQL | VPS (conteneur Docker + volume sauvegardé) | Conteneur Docker (Docker Compose) |
| Envoi d'emails | Prestataire SMTP (Nodemailer côté API) | Service externe | Prestataire de test ou boîte de test |
| Accès aux données | DataMapper (ou ORM) | — | — |
| Hooks Git | Husky | — | Poste de chaque développeur |

## Points à valider avec l'équipe

- **DataMapper ou Sequelize** : le DataMapper est privilégié, à confirmer.
- **Fournisseur du VPS** et **serveur web** (HTTPS, aiguillage `/api`) : à choisir.
- **Sauvegardes de la base** : fréquence et lieu de stockage (hors du VPS).
- **Prestataire d'envoi d'emails** : à choisir.
