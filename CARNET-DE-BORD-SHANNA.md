Carnet de bord du projet — Je s'appelle Graine
Contribution consignée : Shanna.

Les entrées sont classées de la plus récente à la plus ancienne.
Sp1 - Jour 4

Travail réalisé

Développement de la page « Nos arbres » en Next.js et TypeScript, avec une mise en page responsive pour ordinateur et mobile, basée sur la maquette et la charte graphique.

Connexion du catalogue à GET /api/trees et ajout du filtre par catégories, avec la requête GET /api/trees?category=….

Ajustements de l’interface à partir de la maquette : suppression de la recherche, réglage des espacements, couleurs, séparateurs, filtre mobile et alignement du prix avec l’icône panier.

Rendu des photos et des noms d’arbres cliquables pour accéder à une fiche individuelle.

Définition de la route dynamique trees/[id] : un seul modèle de page servira les fiches de tous les arbres via GET /api/trees/:id.

Difficultés rencontrées et suites

Plusieurs ajustements CSS ont été nécessaires pour rapprocher le rendu desktop et mobile de la maquette.

Le premier commit a été bloqué par ESLint : window.location.assign() est déconseillé pour naviguer vers une page Next.js interne. Remplacer cet appel par router.push() depuis useRouter.

Les photos et le pictogramme panier ne s’affichaient pas dans la capture ; leurs chemins dans le dossier public restent à vérifier.

Créer la page dynamique trees/[id]/page.tsx et son style, puis vérifier l’affichage réel des fiches et les liens depuis les cartes.

Sp1- Jour 3

Travail réalisé : Création du header et du footer réutilisables dans Next.js avec TypeScript et des modules CSS. Ajustement du rendu responsive selon la maquette et la charte graphique : alignement du logo et des liens, footer mobile avec liens empilés à droite, bandeau d’engagements et séparateurs verticaux. Préparation de commentaires TODO pour ajouter les pictogrammes et l’icône du panier.

Difficultés rencontrées et solutions : Le premier rendu CSS ne correspondait pas assez à la maquette, notamment les marges, les alignements et l’espacement des liens sur mobile. Le CSS du footer a été ajusté en prenant le header existant comme référence. Le commit a aussi rencontré des problèmes de permissions sur des fichiers générés par Docker et un avertissement ESLint pour une variable inutilisée. Après correction, le commit est passé.

Résultat : Le header et le footer sont prêts à être intégrés aux pages du site.

Sp1- Jour 2 -

Travail réalisé : Initialisation du front-end et mise en place de sa dockerisation, avec l’accompagnement de Loïc, notre lead front-end.

Résultat : Le front est lancé dans Docker et accessible en local.

Sprint 1 — Jour 1

Travail réalisé

- Travail en groupe dans Live Share pour initialiser le projet.
- Création d'une route de test pour vérifier la connexion entre l'API et la base de données.
- Correction de la maquette à partir des échanges avec l'équipe.
-

À poursuivre

- Vérifier le fonctionnement de la route de connexion à la base de données.
- Continuer l'intégration de l'API et intégrer les retours éventuels sur la maquette.

Sprint 0

Travail réalisé

- Réalisation de mon wireframe.
- Récupération et consultation des wireframes des autres membres de l'équipe pour comprendre l'ensemble des pages et des parcours.
- Création des maquettes desktop et mobile à partir des wireframes et de la charte graphique.
- Présentation des maquettes à l'équipe pour vérification, puis corrections selon les retours.
- Harmonisation du header, du contenu et du footer entre les pages et les formats desktop et mobile.
- Mise en cohérence de la charte graphique et de la maquette, notamment pour les couleurs, la typographie et les pictogrammes.
- Ajustement du footer mobile : les trois liens sont alignés à droite, les uns au-dessus des autres, avec le copyright centré en dessous.

Coordination et décisions avec l'équipe

- La maquette sert de référence commune pour les pages Accueil, Nos arbres, fiche arbre, Connexion et Panier.
- Les composants partagés restent cohérents d'une page à l'autre.
- Les propositions sont relues en équipe et ajustées avant l'intégration.

Ce que j'ai retenu

La collecte des wireframes de l'équipe et leur relecture commune aident à harmoniser les parcours avant de passer à la maquette puis au développement.
