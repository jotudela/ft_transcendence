FROM node:20

# Installer zsh et utilitaires
RUN apt-get update && apt-get install -y zsh git curl && \
    rm -rf /var/lib/apt/lists/*
    
# Définir zsh comme shell par défaut
SHELL ["/usr/bin/zsh", "-c"]

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx tsc

EXPOSE 3021
CMD ["node", "dist/server.js"]