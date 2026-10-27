FROM node:24-alpine AS builder

WORKDIR /app

# package-lock.json copié + npm ci : installe exactement les versions du lock
COPY package.json package-lock.json ./
RUN npm ci

COPY ./ ./

EXPOSE 3000

CMD ["npm", "run", "dev"]
