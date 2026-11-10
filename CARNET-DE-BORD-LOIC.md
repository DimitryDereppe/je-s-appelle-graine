# Carnet de bord — Loïc (Lead dev front)

## 21/10/2026 - Sprint 0

### Contexte :

En raison d'un magnifique évènement familial de 3,5kgs, je suis arrivé ce jour dans le projet qui a débuté depuis deux jours. Ma première tâche a été de parcourir les documents qui m'avaient été envoyés par les membres de mon équipe. Dans un second temps, j'ai pu échanger avec eux lors du rendez-vous quotidien de 9h.

### Action du jour :

<ul>
    <li> Echange avec la tutrice du projet et prise en compte de son retour sur les documents de conception. Changements notables :
        <ul> 
            <li>Changement du nom de projet. "Green Roots" devient "Je suis Graine" sur une proposition de Dimitry validée collectivement.</li>
            <li>Dans le MCD : suppression de "panier" comme entité, création d'une table "disponibilité" pour l'entité "arbre", le lieu de plantation de l'arbre devient un attribut de l'entité arbre.</li>
            <li>Inclus dans le MVP : suivi du statut des commandes par le client, deux modes de paiement (chèque et virement) </li>
            <li>L'application sera hébergée sur le serveur VPS o'clock mis à la disposition des élèves.</li>
        </ul>
    </li>
    <li>Création des wireframes. Un wireframe par membre du groupe (mobile et desktop). Réunion pour décider des éléments UX à conserver et à écarter.</li>
</ul>

## 22/10/2026 - Sprint 0

### Contexte :

Je me suis porté volontaire pour faire la première présentation des avancées de notre projet qui doit intervenir le 23/10. Cela me permet de parcourir à nouveau l'intégralité des documents de conception.

### Actions du jour :

<ul>
    <li>Décisions collectives sur l'évolution du MVP et des évolutions. Changements notables :
        <ul>
         <li>Choix de Typescript pour le front et l'API</li>
         <li>Envoi d'un email de confirmation par Nodemailer</li>
         <li>Choix de l'architecture du projet avec Nginx</li>
         <li>Validation collective de la page d'accueil</li>
        </ul>
        </li>
    <li>Préparation de la présentation de fin de sprint du 23/10. </li>
    <li>Validation de la charte graphique proposée par Shanna</li>
</ul>

## 23/10/2026 - Sprint 0

### Contexte :

Lors du point matinal, Fabrice nous a proposé un planning devant servir à organiser la prochaine semaine en nous répartissant nos tâches à accomplir. Le planning a été validé. Ma première activité du matin se fait conjointement avec Dimitry. Nous relevons les meilleures compatibilités entre les dépendances et les versions à installer.

### Actions du jour :

<ul>
    <li>Listing des versions à installer</li>
    <li>Validation collective de la maquette graphique</li>
    <li>Présentation de fin de sprint</li>
    <li>Checklist du materiel pour lancement du développement le 26/10</li>
</ul>

## 26/10/2026 - Sprint 1

### Contexte :

Après la présentation du sprint 0 le 23/10, tous les livrables de la période ont été validés et nous avons reçu l'autorisation de passer au sprint 1. Nous commençons à programmer en groupe en utilisant le live-share de Vs Code.

### Actions du jour :

<ul>
    <li>Lancement du back-end :
        <ul>
            <li>Initialisation de la base de données</li>
            <li>Initialisation de l'api</li>
            <li>mise en place d'une route test</li>
        </ul>
    <li>Lancement de Docker :
        <ul>
            <li>contenarisation de la base de données</li>
            <li>contenarisation de la base de l'api</li>
        </ul>
    </li>
</ul>

## 27/10/2026 - Sprint 1

### Contexte :

Nous continuons de programmer en groupe en utilisant le live-share de vsCode.

### Actions du jour :

<ul>
    <li>Lancement du front:
        <ul>
            <li>Initialisation de NextJs</li>
            <li>raccordement de l'api au front (hors-docker)</li>
        </ul>
    </li>
    <li>Extansion du Docker-compose :
        <ul>
            <li>contenarisation du front</li>
            <li>raccordement de l'api au front (dans docker)</li>
        </ul>
    </li>
    <li>Installation et mise en service de husky</li>
</ul>

## 28/10/2026 - Sprint 1

### Contexte :

Le groupe s'est divisé en deux. Une équipe commence à travailler sur le back et une autre sur le front. Avec Shanna nous commençons à développer les pages du front. Nous nous sommes répartis les tâches en deux. Shanna gère le layout de toutes les pages tandis que je fais la page d'acceuil.

### Actions du jour :

<ul>
    <li> Création des pages html sur la base des maquettes(rendu statique uniquement)</li>
</ul>

## 29/10/2026 - Sprint 1

### Contexte :

Shanna et moi continuons de produire le html des pages et nous les intégrons à Nextjs au fil de l'eau.

### Actions du jour :

<ul>
    <li> Achèvement des pages layout, acceuil et catalogue</li>
    <li> Liaison entre le front et le back sur la page d'acceuil avec un appel API pour hydrater le front </li>
</ul>

## 30/10/2026 - Sprint 1

### Contexte :

Les tâches du sprint 1 sont termninées par les memebres du groupe ou en voie d'achèvement. Le déploiement du projet sur VPS a été mis en place par Dimitry.

### Actions du jour :

<ul>
    <li> Optimisation de la performance des pages en passant d'un rendu CLS à SSR pour l'acceuil et le catalogue</li>
    <li> Correction du nommage et typage des données front pour correspondre au contrat</li>
    <li> Validation d'une checklist de vérification de la performance et de l'accessibilité </li>
    <li> Revue de la procédure de déploiement sur VPS avec Dimitry et Shanna </li>
    <li> Préparation du front pour la présentation </li>
</ul>

## 02/11/2026 - Sprint 2

### Contexte :

Kick-off du sprint 2. Je continue de travailler sur le backlog de la première feature qui fait aussi intervenir des features de la deuxièeme feature.

### Actions du jour :

<ul>
    <li>Déploiement du vps sur ma machine en suivant la procédure écrite de Dimitry</li>
    <li>Mise en place d'un appel API globalisé </li>
    <li>Développement d'un composant carte arbre</li>
</ul>

## 03/11/2026 - Sprint 2

### Contexte :

Mahamadou travaille avec moi sur le sprint 2 pour des features relatives au catalogue et à la recherche. Son arrivée était l'occasion de faire un tour de présentation des fonctionnalités du front.

### Actions du jour :

<ul>
    <li>Mise en place du composant Arbre</li>
    <li>Intégration du cookie dans l'appel api</li>
</ul>

## 04/11/2026 - Sprint 2

### Contexte :

Poursuite du développement du Front avec Mahamadou. Accessoirement je découvre les avancées du back et notamment des fonctions déjà déployées par Mahamadou.

### Actions du jour :

<ul>
    <li>Développement de la page d'erreur</li>
    <li>Intégration de messages de chargement et d'erreur de chargement sur la page d'acceuil</li>
    <li>En cours : développement de la fiche arbre</li>
</ul>

## 05/11/2026 - Sprint 2

### Actions du jour :

<ul>
    <li>Intégration des fonctions globales dans le front</li>
    <li>Prise en compte des retours d'expérience sur le front</li>
    <li> Fix et améliorations sur le front</li>
</ul>

## 06/11/2026 - Sprint 2

### Contexte :

Je passe sur le back pour développer la feature panier de bout en bout.

### Actions du jour :

<ul>
    <li>Creation des routes paniers et des outils métiers</li>
</ul>

## 08/11/2026 - Sprint 3

### Contexte :

Après revue de ma PR pour le panier, je dois retravailler le cartDataMapper pour l'intégrer.

### Actions du jour :

<ul>
    <li>Développement du CartDataMapper </li>
    <li>Ecriture des test unitiaires et d'intégration dédiés au panier</li>
    <li>Sur la partie client, mise en place du panier avec connexion à l'api</li>
</ul>
