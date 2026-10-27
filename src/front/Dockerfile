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

# Créé au nom de node : le volume .next en hérite
RUN mkdir -p .next

EXPOSE 3000

# Serveur de dev Next.js
CMD ["npm", "run", "dev"]
