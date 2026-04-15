# CI/CD Pipeline Documentation

The pipeline is implemented using GitHub Actions and follows a security-first approach.

## Stages

1. **Code Checkout**: Fetches the latest code from the repository.
2. **Security Scan (SAST)**:
   - **SonarQube**: Analyzes code for bugs, vulnerabilities, and code smells.
   - **OWASP Dependency Check**: Scans project dependencies for known vulnerabilities (CVEs).
3. **Container Build**:
   - Uses multi-stage Dockerfiles to minimize image size.
   - Builds both frontend and backend images.
4. **Image Scanning**:
   - **Trivy**: Scans the built Docker images for OS-level and application-level vulnerabilities.
5. **Push to Registry**:
   - Pushes scanned and verified images to AWS ECR.
6. **Deploy**:
   - Updates Kubernetes manifests with the new image tag.
   - Triggers ArgoCD or applies manifests directly to EKS.

## Security Gates
The pipeline is configured to fail if:
- SonarQube quality gate fails.
- OWASP finds high/critical vulnerabilities.
- Trivy finds critical vulnerabilities in the Docker image.
