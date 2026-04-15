# Production-Grade DevOps & DevSecOps Guide

This guide provides a step-by-step walkthrough for deploying and securing the **BiteDash** e-commerce application using modern DevOps and DevSecOps practices.

## 🏗️ Architecture Overview
- **Frontend/Backend:** React (Vite) + Express (Full-stack)
- **CI/CD:** GitHub Actions / GitLab CI / Jenkins
- **Containerization:** Docker (Multi-stage builds)
- **Registry:** Amazon ECR
- **Orchestration:** Amazon EKS (Kubernetes)
- **Security:** SonarQube, OWASP Dependency Check, Trivy

---

## 🚀 Step 1: CI/CD Pipeline Setup

### GitHub Actions
The workflow is located at `devops/cicd/github-actions.yaml`.
1. Go to your GitHub Repository -> Settings -> Secrets and variables -> Actions.
2. Add the following secrets:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key.
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key.
   - `SONAR_TOKEN`: Token from SonarQube.
   - `SONAR_HOST_URL`: Your SonarQube server URL.

### GitLab CI/CD
The configuration is at `devops/cicd/.gitlab-ci.yml`.
1. Go to GitLab Project -> Settings -> CI/CD -> Variables.
2. Add `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `SONAR_TOKEN`.

### Jenkins
The `Jenkinsfile` is at `devops/cicd/Jenkinsfile`.
1. Install Jenkins plugins: `Docker`, `AWS Steps`, `Pipeline`, `SonarQube Scanner`.
2. Configure AWS Credentials in Jenkins Global Credentials.
3. Create a "Multibranch Pipeline" and point to your repository.

---

## 🛡️ Step 2: DevSecOps Practices

### 1. Static Application Security Testing (SAST)
We use **SonarQube** to scan code for vulnerabilities and code smells.
- **Command:** `sonar-scanner -Dsonar.projectKey=ecommerce -Dsonar.sources=. -Dsonar.host.url=http://localhost:9000 -Dsonar.login=myAuthenticationToken`

### 2. Software Composition Analysis (SCA)
We use **OWASP Dependency Check** to find vulnerable libraries.
- **Command:** `dependency-check --project ecommerce --scan . --format HTML`

### 3. Container Image Scanning
We use **Trivy** to scan Docker images for OS-level vulnerabilities.
- **Command:** `trivy image ecommerce-frontend:latest`

### 4. Local Security Script
Run our custom security script before pushing code:
```bash
chmod +x scripts/security-scan.sh
./scripts/security-scan.sh
```

---

## 📦 Step 3: Containerization (Docker)

We use multi-stage builds to keep images small and secure.

**Build Frontend:**
```bash
docker build -t ecommerce-frontend -f devops/docker/frontend.Dockerfile .
```

**Build Backend:**
```bash
docker build -t ecommerce-backend -f devops/docker/backend.Dockerfile .
```

---

## ☸️ Step 4: Kubernetes Deployment (EKS)

1. **Configure AWS CLI:**
   ```bash
   aws configure
   ```

2. **Update Kubeconfig:**
   ```bash
   aws eks update-kubeconfig --region us-east-1 --name ecommerce-eks
   ```

3. **Apply Manifests:**
   ```bash
   kubectl apply -f devops/k8s/config-secrets.yaml
   # Update <IMAGE_TAG> in yaml files first
   kubectl apply -f devops/k8s/frontend.yaml
   kubectl apply -f devops/k8s/backend.yaml
   kubectl apply -f devops/k8s/ingress.yaml
   ```

---

## 📈 Step 5: Monitoring & Maintenance
- Use **Prometheus & Grafana** (configs in `devops/monitoring/`) for metrics.
- Use **ArgoCD** (configs in `devops/argocd/`) for GitOps-based deployments.

---

## 🛠️ Useful Commands Summary

| Task | Command |
| :--- | :--- |
| **Linting** | `npm run lint` |
| **Build** | `npm run build` |
| **Docker Build** | `docker build -t app:latest .` |
| **Security Scan** | `./scripts/security-scan.sh` |
| **K8s Status** | `kubectl get pods -n default` |
| **K8s Logs** | `kubectl logs -f deployment/frontend` |
