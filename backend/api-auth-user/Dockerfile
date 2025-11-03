# Étape 1 : choisir une image Node
FROM node:20

# Installer zsh et utilitaires
RUN apt-get update && apt-get install -y zsh git curl && \
    rm -rf /var/lib/apt/lists/*
    
# Définir zsh comme shell par défaut
SHELL ["/usr/bin/zsh", "-c"]

# Étape 2 : définir le dossier de travail
WORKDIR /usr/src/app

# Étape 3 : copier les fichiers package.json et installer les deps
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

# Étape 4 : copier le reste du code
COPY . .

# Étape 5 : exposer le port Fastify
EXPOSE 4000

RUN npx tsc

# Étape 6 : lancer le serveur avec ts-node (développement)
CMD ["npx", "ts-node", "server.ts"]