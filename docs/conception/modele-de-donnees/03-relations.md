# Relations entre les entités du projet Je s’appelle Graine

Quelles entités possèdent des liens logiques entre elles ?

**Arbre** -- Appartenir -- **Catégorie**

**Arbre** -- Être -- **Disponibilité**

**Panier** -- Contenir (quantité) -- **Arbre**

**Utilisateur** -- Posséder -- **Panier**

**Utilisateur** -- Avoir -- **Rôle**

**Utilisateur** -- Passer -- **Commande**

**Commande** -- Composer (quantité, nom de l'arbre, prix unitaire, lieu de plantation) -- **Arbre**
