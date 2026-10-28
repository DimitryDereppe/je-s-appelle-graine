# Image de base : Node 24, version Alpine (légère)
FROM node:24-alpine

# Dossier de travail dans le conteneur
WORKDIR /api

# Utilisateur node (uid 1000 = le nôtre) : sinon les fichiers créés via le bind mount sont à root
RUN chown node:node /api
USER node

# Dépendances d'abord : couche en cache tant que package*.json ne change pas
# --chown : COPY écrit en root, même après USER
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

# Le reste du code
COPY --chown=node:node ./ ./

# Compile le TypeScript dans dist/ (pour la prod)
RUN npm run build

EXPOSE 4000

# Commande de prod ; en dev, le compose la remplace par npm run dev
CMD ["npm", "run", "docker:start"]
