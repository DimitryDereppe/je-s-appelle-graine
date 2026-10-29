# Image de base : Node 24, version Alpine (légère)
FROM node:24-alpine

# Dossier de travail dans le conteneur
WORKDIR /app

# Utilisateur node (uid 1000 = le nôtre) : sinon les fichiers créés via le bind mount sont à root
RUN chown node:node /app
USER node

# Dépendances d'abord (cache). --chown : COPY écrit en root, même après USER
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

# Le reste du code (recouvert par le bind mount en dev)
COPY --chown=node:node ./ ./

# Compile le site pour la prod (crée aussi .next au nom de node, dont hérite le volume .next du dev)
RUN npm run build

EXPOSE 3000

# Serveur de dev Next.js
CMD ["npm", "run", "dev"]
