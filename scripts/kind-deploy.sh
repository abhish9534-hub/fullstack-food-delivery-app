#!/bin/bash

# Kind Deployment Automation Script for BiteDash

CLUSTER_NAME="bitedash-local"
FRONTEND_IMAGE="bitedash-frontend:local"
BACKEND_IMAGE="bitedash-backend:local"

echo "--------------------------------------------------"
echo "🎡 Starting Kind Deployment for BiteDash..."
echo "--------------------------------------------------"

# 1. Check if Kind is installed
if ! command -v kind &> /dev/null; then
    echo "❌ Kind is not installed. Please install it first."
    exit 1
fi

# 2. Create Cluster if it doesn't exist
if kind get clusters | grep -q "^$CLUSTER_NAME$"; then
    echo "✅ Cluster '$CLUSTER_NAME' already exists."
else
    echo "🚀 Creating Kind cluster '$CLUSTER_NAME'..."
    kind create cluster --name $CLUSTER_NAME --config - <<EOF
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
fi

# 3. Build Images
echo "📦 Building Docker images..."
docker build -t $FRONTEND_IMAGE -f devops/docker/frontend.Dockerfile .
docker build -t $BACKEND_IMAGE -f devops/docker/backend.Dockerfile .

# 4. Load Images into Kind
echo "🚚 Loading images into Kind cluster..."
kind load docker-image $FRONTEND_IMAGE --name $CLUSTER_NAME
kind load docker-image $BACKEND_IMAGE --name $CLUSTER_NAME

# 5. Prepare Manifests (Temporary copies with local image tags)
echo "📝 Preparing Kubernetes manifests..."
mkdir -p devops/k8s/kind-temp
cp devops/k8s/*.yaml devops/k8s/kind-temp/

# Update image tags in temp manifests
# Using a different delimiter for sed to avoid issues with image names
sed -i "s|image: .*frontend.*|image: $FRONTEND_IMAGE|g" devops/k8s/kind-temp/frontend.yaml
sed -i "s|image: .*backend.*|image: $BACKEND_IMAGE|g" devops/k8s/kind-temp/backend.yaml
# Ensure imagePullPolicy is IfNotPresent for local images
sed -i "s|imagePullPolicy: .*|imagePullPolicy: IfNotPresent|g" devops/k8s/kind-temp/*.yaml

# 6. Apply Manifests
echo "🚀 Applying manifests to cluster..."
kubectl apply -f devops/k8s/kind-temp/config-secrets.yaml
kubectl apply -f devops/k8s/kind-temp/frontend.yaml
kubectl apply -f devops/k8s/kind-temp/backend.yaml

echo "--------------------------------------------------"
echo "✅ Kind Deployment Completed!"
echo "--------------------------------------------------"
echo "Run 'kubectl get pods' to check status."
echo "To access the app, run: kubectl port-forward deployment/frontend 8080:80"
echo "Then visit: http://localhost:8080"
echo "--------------------------------------------------"
