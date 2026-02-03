# Quickstart: Phase V — Event-Driven Todo AI Platform

**Feature Branch**: `005-phase5-event-driven`
**Date**: 2026-02-03

## Prerequisites

- Docker Desktop with Kubernetes enabled, OR Minikube installed
- Helm 3.x installed
- Dapr CLI installed (`dapr init -k` for Kubernetes mode)
- kubectl configured for local cluster
- Git (for cloning the repository)

## Step 1: Start Local Kubernetes Cluster

```bash
# Option A: Minikube
minikube start --memory=4096 --cpus=4
eval $(minikube docker-env)

# Option B: Docker Desktop Kubernetes
# Enable Kubernetes in Docker Desktop settings
```

## Step 2: Install Dapr on Kubernetes

```bash
dapr init -k --wait
dapr status -k
# Verify all Dapr services are running
```

## Step 3: Build Service Images

```bash
# From repository root
docker build -t todo-chat-api:latest ./services/chat-api/
docker build -t todo-notification:latest ./services/notification/
docker build -t todo-recurring-task:latest ./services/recurring-task/
docker build -t todo-audit:latest ./services/audit/
docker build -t todo-websocket:latest ./services/websocket/
docker build -t todo-frontend:latest ./frontend/
```

## Step 4: Deploy Infrastructure (Kafka + Redis)

```bash
# Install Kafka via Helm
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install kafka bitnami/kafka --set replicaCount=1 \
  --set kraft.enabled=true --namespace default

# Install Redis via Helm
helm install redis bitnami/redis --set architecture=standalone \
  --set auth.enabled=false --namespace default
```

## Step 5: Deploy Dapr Components

```bash
kubectl apply -f dapr/components/
# Applies: pubsub, statestore, secrets components
```

## Step 6: Deploy Application with Helm

```bash
helm install todo-app helm/todo-app/ \
  --set global.environment=local \
  --namespace default
```

## Step 7: Verify Deployment

```bash
# Check all pods are running
kubectl get pods

# Check Dapr sidecars are injected
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{range .spec.containers[*]}{.name}{"\t"}{end}{"\n"}{end}'

# Check service health
kubectl port-forward svc/chat-api 8000:8000
curl http://localhost:8000/health
```

## Step 8: Access the Application

```bash
# Port-forward frontend
kubectl port-forward svc/frontend 3000:3000

# Open browser
open http://localhost:3000
```

## Step 9: Validate Event Flow

1. Create a task via the chat interface
2. Check audit log: `kubectl logs -l app=audit-service`
3. Open a second browser window and verify real-time sync
4. Set a reminder and wait for WebSocket notification
5. Create a recurring task, complete it, verify next instance

## Troubleshooting

| Issue | Check |
|-------|-------|
| Pods not starting | `kubectl describe pod <name>` |
| Dapr sidecar missing | `kubectl get pods -o yaml | grep daprd` |
| Events not flowing | `kubectl logs -l app=<service> -c daprd` |
| Kafka not ready | `kubectl get pods -l app.kubernetes.io/name=kafka` |
| Health check failing | `kubectl logs <pod> -c <service>` |
