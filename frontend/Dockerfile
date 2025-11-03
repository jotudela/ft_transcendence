# Étape 1 : build avec Node
FROM node:18-alpine AS build

ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

WORKDIR /app

# Copier package.json, package-lock.json et vite.config.js
COPY package*.json vite.config.js ./

# Installer toutes les dépendances (y compris devDependencies)
RUN npm install

# Copier le reste du projet
COPY . .

# Build production
RUN npm run build

# Vérifier que dist/ contient index.html
RUN ls -la dist/

# Étape 2 : servir avec Nginx
FROM nginx:alpine

# Installer utilitaires
RUN apk add --no-cache curl bash netcat-openbsd

WORKDIR /usr/share/nginx/html

# Nettoyer le dossier par défaut
RUN rm -rf ./*

# Copier le build depuis l'étape 1
COPY --from=build /app/dist ./

# Copier la config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY ./index.html /usr/share/nginx/html/

# Copier le script frontend-entrypoint
COPY --from=build /app/scripts/frontend-entrypoint.sh /usr/local/bin/frontend-entrypoint.sh
RUN chmod +x /usr/local/bin/frontend-entrypoint.sh

EXPOSE 80

# Healthcheck pour Docker
HEALTHCHECK --interval=5s --timeout=3s --retries=20 \
  CMD curl -f http://localhost/ || exit 1

# CMD pour attendre la gateway puis démarrer Nginx
CMD ["/usr/local/bin/frontend-entrypoint.sh"]