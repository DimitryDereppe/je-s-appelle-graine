# On part d'une image existante
# Dans notre cas, on va partir sur la version 22 de node en alpine (plus légè)
FROM node:24-alpine

# On va se positionner dans le répertoire de travail
WORKDIR /src/app.ts

# On copie d'abord le fichier package.json
# Comme Dockerfile fonctionne avec un système de couche, au moment de la création d'une V1, il va faire toutes les instructions.
# Cependant, au moment de la création d'une V2 de l'image, il va uniquement partir de la ligne où il y a eu des changements.
# Exemple: Si je n'ai pas changé mon package.json, il n'y aura pas besoin de reinstaller les dépendances...
COPY ./package.json ./

# On installe les dépendances
RUN npm install

# On copie tout le reste
COPY ./ ./

# # On build le projet
RUN npm run build

# On expose le port 4000 (Facultatif)
EXPOSE 4000

# Au lancement de notre image, je veux que cette commande soit lancée
CMD ["npm", "run", "docker:start"]