# Utiliser une image Node.js basée sur Debian/Ubuntu
FROM node:20

# Mettre à jour les packages et installer les dépendances système pour sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    sqlite3 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./


RUN npm install -g ts-node

# Installer les dépendances dans le container (rebuild natif)
RUN npm install

# Forcer la recompilation de sqlite3 pour l'architecture du container
RUN npm rebuild sqlite3 --build-from-source

# Copier le code source
COPY . .

# Create uploads/profile_images directory for storing profile pictures
RUN mkdir -p /usr/src/app/uploads_profile_images && \
    chown -R node:node /usr/src/app/uploads_profile_images

# Exposer le port
EXPOSE 3020

# Commande par défaut
CMD ["npm", "start"]