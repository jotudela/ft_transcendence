COMPOSE_FILE := docker-compose.yml
COMPOSE := docker compose -f $(COMPOSE_FILE)

APP_STACK := auth-service game-service api_bdd api_bc frontend nginx

all: build up

build:
	@echo "🐳 Build des images APP uniquement ($(APP_STACK))"
	@$(COMPOSE) build $(APP_STACK)

up:
	@echo "🚀 Lancement des services APP uniquement..."
	@$(COMPOSE) up -d $(APP_STACK)

down:
	@echo "🛑 Arrêt + suppression des containers APP uniquement..."
	@$(COMPOSE) stop $(APP_STACK) || true
	@$(COMPOSE) rm -f -v $(APP_STACK) || true

fclean:
	@echo "🔥 Suppression complète : containers, volumes, images et cache"
	@$(COMPOSE) down -v --rmi all --remove-orphans || true
	@docker system prune -af --volumes || true
	@echo "✅ Environnement Docker entièrement nettoyé."

re: fclean all

restart: down build up

.PHONY: all build up down fclean re restart