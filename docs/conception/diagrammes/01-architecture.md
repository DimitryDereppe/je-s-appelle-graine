# Architecture de l'application — Je s’appelle Graine

## Lire le diagramme

- Chaque **rectangle** est une brique de l'application ; les **cadres** regroupent ce qui tourne au même endroit (hébergeur).
- Les **flèches** indiquent qui appelle qui, avec le protocole utilisé sur la flèche.
- Le navigateur ne parle **jamais** directement à la base de données : tout passe par l'API.

## 1. Vue d'ensemble (environnement distant)

```mermaid
flowchart TB
    U["Utilisateur<br/>(visiteur, client, admin)"]

    subgraph NAV["Navigateur (mobile / ordinateur)"]
        P["Pages du site<br/>React"]
    end

    subgraph VERCEL["Vercel"]
        F["Front-end Next.js<br/>pages publiques, catalogue, panier,<br/>espace client, administration"]
    end

    subgraph SERVEUR["Serveur de Dimitry — conteneur Docker"]
        API["API REST Je s’appelle Graine<br/>Node.js + Express"]
    end

    subgraph NEON["Neon"]
        DB[("PostgreSQL<br/>comptes, arbres, paniers, commandes")]
    end

    U --> P
    P -- "HTTPS : charge les pages" --> F
    P -- "HTTPS / JSON : requêtes /api/...<br/>+ cookie de session" --> API
    API -- "connexion PostgreSQL sécurisée<br/>(identifiants dans les variables d'environnement)" --> DB
```

## 2. Intérieur de l'API REST

Le cahier des charges sépare le back-end en couches : chaque couche a un seul rôle et n'appelle que la couche juste en dessous.

```mermaid
flowchart TB
    REQ["Requête HTTP<br/>(ex. POST /api/commandes)"]

    subgraph API["API REST Je s’appelle Graine — Express"]
        R["Routeur<br/>associe l'URL et la méthode à un contrôleur"]
        M["Middlewares<br/>validation des données, vérification<br/>de la session et du rôle (401 / 403)"]
        C["Contrôleurs<br/>lisent la requête, renvoient la réponse JSON"]
        S["Services métier<br/>règles du projet (disponibilité des arbres,<br/>calcul du total, mot de passe Argon2...)"]
        D["DataMappers<br/>requêtes SQL paramétrées"]
    end

    DB[("PostgreSQL")]

    REQ --> R --> M --> C --> S --> D --> DB
    DB -. "lignes trouvées" .-> D
    D -. "données" .-> S
    S -. "résultat" .-> C
    C -. "réponse JSON + code HTTP" .-> REQ
```

## 3. Environnement de développement

En local, Docker Compose lance l'API **et** une base PostgreSQL, pour que tout le monde travaille avec la même configuration. En distant, seul le conteneur de l'API est déployé, et il se connecte à la base Neon.

```mermaid
flowchart LR
    subgraph POSTE["Poste du développeur"]
        F["Front-end Next.js<br/>(serveur de dev)"]
        subgraph COMPOSE["Docker Compose"]
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
| Front-end | Next.js / React | Vercel | Serveur de dev Next.js |
| API REST | Node.js + Express | Serveur de Dimitry (conteneur Docker) | Conteneur Docker (Docker Compose) |
| Base de données | PostgreSQL | Neon | Conteneur Docker (Docker Compose) |
| Accès aux données | DataMapper (ou ORM)| — | — |
| Hooks Git | Husky | — | Poste de chaque développeur |

## Points à valider avec l'équipe

- **DataMapper ou Sequelize** : le DataMapper est privilégié, à confirmer.
- **CORS et cookie** : le front (Vercel) et l'API (serveur de Dimitry) sont sur deux domaines différents ; il faudra autoriser l'origine du front dans l'API et configurer le cookie de session pour qu'il soit bien envoyé.
