# Quickstart: Phase IV — Cloud-Native Todo AI Chatbot

**Branch**: `001-phase4-k8s-todo` | **Date**: 2026-02-02

## Prerequisites

- Docker Desktop (with BuildKit enabled)
- Minikube (v1.30+)
- Helm (v3.12+)
- kubectl (matching Minikube K8s version)
- Node.js 18+ (for frontend local dev)
- Python 3.11+ (for backend local dev)

## Local Development (Docker Compose)

```bash
# From project root
cd apps/phase4-todo-app

# Start both services
docker compose up --build

# Backend: http://localhost:8000
# Frontend: http://localhost:3002
# Health checks:
#   Backend:  http://localhost:8000/health
#   Frontend: http://localhost:3002/api/health
```

## Kubernetes Deployment (Minikube)

```bash
# 1. Start Minikube
minikube start

# 2. Build images locally
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# 3. Load images into Minikube
minikube image load todo-backend:latest
minikube image load todo-frontend:latest

# 4. Deploy via Helm (single command)
helm install todo-app ./helm/todo-app \
  --set backend.env.DATABASE_URL="postgresql://..." \
  --set backend.env.BETTER_AUTH_SECRET="your-secret" \
  --set backend.env.DEEPSEEK_API_KEY="your-key"

# 5. Verify pods
kubectl get pods

# 6. Access services
minikube service todo-app-frontend --url
minikube service todo-app-backend --url
```

## Common Operations

```bash
# Scale backend replicas
helm upgrade todo-app ./helm/todo-app --set backend.replicaCount=3

# Update configuration
helm upgrade todo-app ./helm/todo-app --set backend.env.DATABASE_URL="new-url"

# Redeploy (clean)
helm uninstall todo-app
helm install todo-app ./helm/todo-app

# View pod status
kubectl get pods -l app.kubernetes.io/instance=todo-app

# View logs
kubectl logs -l app=todo-backend
kubectl logs -l app=todo-frontend

# Health check verification
kubectl exec -it <pod-name> -- curl http://localhost:8000/health
```

## Environment Variables

### Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | PostgreSQL connection string |
| BETTER_AUTH_SECRET | Yes | - | JWT signing secret |
| CORS_ORIGINS | No | localhost origins | Comma-separated allowed origins |
| DEEPSEEK_API_KEY | No | "" | AI agent API key |
| PORT | No | 8000 | Server port |
| DEBUG | No | false | Debug mode |

### Frontend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | Yes | - | Backend URL |
| BETTER_AUTH_SECRET | Yes | - | JWT verification secret |
| PORT | No | 3000 | Server port |
| HOSTNAME | No | 0.0.0.0 | Bind address |

## Key URLs

| Service | Local Dev | Minikube |
|---------|-----------|----------|
| Frontend | http://localhost:3002 | `minikube service todo-app-frontend --url` |
| Backend | http://localhost:8000 | `minikube service todo-app-backend --url` |
| Backend Health | http://localhost:8000/health | Internal: /health |
| Frontend Health | http://localhost:3002/api/health | Internal: /api/health |
