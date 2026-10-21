# Carnet de bord — Dimitry (Tech Lead Back)

Suivi de mon travail sur Je s’appelle Graine. Les décisions notées ici ont été prises avec l'équipe sur Discord ; le suivi de l'équipe est dans le [[Apothéose/apo-greenroots/CARNET-DE-BORD-JE-S-APPELLE-GRAINE|carnet de bord Je s’appelle Graine]].

## 2026-10-21 — Lieu de plantation et compte actif

### Travail réalisé

- **Lieu de plantation** ajouté au modèle de données. Il était déjà prévu dans le cahier des charges (fiche arbre) et dans les user stories US04 et US41, mais absent des documents de conception.
  - `tree.planting_location` : `VARCHAR(150)`, facultatif.
  - `purchase_line.planting_location` : copie du lieu **au moment de l'achat**, facultative.
  - Mis à jour : entités, entités-propriétés, relations, cardinalités, MCD (et source Mocodo), MLD, MPD, dictionnaire de données, et les 3 schémas Draw.io.
- **`account.is_active`** (`BOOLEAN NOT NULL DEFAULT TRUE`) ajouté aux 3 schémas Draw.io (MCD, MLD, MPD).
- Légende du schéma MLD déplacée : elle passait sur la table `tree`.

### Décisions (prises avec l'équipe sur Discord)

- **Lieu de plantation = simple champ texte** pour le MVP. Il pourra devenir une entité **Lieu** plus tard, si la carte interactive (US33, évolution) a besoin de coordonnées.
- **Lieu figé dans la commande**, comme le nom et le prix : si l'admin modifie le lieu d'un arbre, l'historique des commandes ne change pas.
- **Compte actif (`is_active`)** : géré par l'admin (`PATCH /api/utilisateurs/:id`, « Modifier l'état d'un compte client »). Un compte est actif dès l'inscription. Un utilisateur désactivé qui se connecte reçoit un **403** : il est bien identifié, mais n'a pas le droit d'accéder au service.

### À poursuivre

- Reporter `is_active` dans les documents texte : entités-propriétés, MCD (et source Mocodo), MLD, dictionnaire de données.
- Préciser où contrôler `is_active` dans l'API : à la connexion, et sur les routes protégées pour une session déjà ouverte.
- Aligner le diagramme de séquence de l'authentification sur le cahier des charges actuel (authentification simplifiée).

## 2026-10-20 — Diagrammes de conception

### Travail réalisé

- Diagramme de séquence de l'authentification (inscription, connexion, route protégée, déconnexion), en Mermaid.
- Diagramme d'architecture de l'application (front Next.js sur Vercel, API Express dans Docker sur mon serveur, PostgreSQL chez Neon), en Mermaid : [[Apothéose/apo-greenroots/docs/conception/diagrammes/01-architecture|architecture]].
- Orthographe de mon prénom corrigée (« Dimitry ») dans le cahier des charges et les diagrammes.

### Décisions (prises avec l'équipe sur Discord)

- L'authentification sera **moins poussée** que dans la première version du diagramme de séquence.
- La séquence la plus complexe du projet est la **validation du panier en commande** (`POST /api/commandes`) : 5 tables touchées, règles métier, transaction.
