# Image de base : Node 24, version Alpine (légère)
FROM node:24-alpine

# Dossier de travail dans le conteneur
WORKDIR /api

# Dépendances d'abord : couche en cache tant que package*.json ne change pas
COPY package.json package-lock.json ./
RUN npm ci

# Le reste du code
COPY ./ ./

# Compile le TypeScript dans dist/ (pour la prod)
RUN npm run build

EXPOSE 4000

# Commande de prod ; en dev, le compose la remplace par npm run dev
CMD ["npm", "run", "docker:start"]
