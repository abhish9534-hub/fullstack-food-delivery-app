# Local Kubernetes Deployment with Kind

This guide explains how to deploy **BiteDash** locally using **Kind** (Kubernetes in Docker). Kind is an excellent tool for local development and testing of Kubernetes manifests without the cost of a cloud provider.

## 📋 Prerequisites

Ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/)
- [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

---

## 🚀 Step-by-Step Deployment Process

### 1. Create a Kind Cluster
Create a cluster with a custom configuration to support an Ingress Controller (optional but recommended for local testing).

```bash
# Create cluster with ingress support
kind create cluster --name bitedash-local --config - <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF
```

### 2. Build Docker Images Locally
Build the frontend and backend images.

```bash
# Build Frontend
docker build -t bitedash-frontend:local -f devops/docker/frontend.Dockerfile .

# Build Backend
docker build -t bitedash-backend:local -f devops/docker/backend.Dockerfile .
```

### 3. Load Images into Kind
Kind cannot pull images from your local Docker daemon automatically. You must "load" them into the cluster nodes.

```bash
kind load docker-image bitedash-frontend:local --name bitedash-local
kind load docker-image bitedash-backend:local --name bitedash-local
```

### 4. Deploy Ingress Controller (Optional)
If you want to use the `ingress.yaml` manifest:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
```

### 5. Apply Kubernetes Manifests
Update the image names in your YAML files or use the provided automation script.

```bash
# Apply Config & Secrets
kubectl apply -f devops/k8s/config-secrets.yaml

# Apply Apps (Ensure image is set to bitedash-frontend:local and bitedash-backend:local)
kubectl apply -f devops/k8s/frontend.yaml
kubectl apply -f devops/k8s/backend.yaml
```

---

## 🛠️ Automation Script

We have provided a script `scripts/kind-deploy.sh` that automates these steps.

**Run it with:**
```bash
chmod +x scripts/kind-deploy.sh
./scripts/kind-deploy.sh
```

---

## 🔍 Verifying the Deployment

Check the status of your pods:
```bash
kubectl get pods
```

Access the application:
- If using Ingress: `http://localhost`
- If using Port-Forward:
  ```bash
  kubectl port-forward deployment/frontend 8080:80
  ```
  Then open `http://localhost:8080` in your browser.

---

## 🧹 Cleanup

To delete the cluster and free up resources:
```bash
kind delete cluster --name bitedash-local
```
