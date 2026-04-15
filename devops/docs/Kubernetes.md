# Kubernetes Deployment

The application is deployed on EKS using standard Kubernetes manifests.

## Resources

- **Deployments**: Manages the lifecycle of frontend and backend pods.
- **Services**: Provides stable networking (ClusterIP) for internal communication.
- **ConfigMaps**: Stores non-sensitive configuration (e.g., API URLs).
- **Secrets**: Stores sensitive data (e.g., DB passwords).
- **Ingress**: Uses AWS Load Balancer Controller to provision an Application Load Balancer (ALB).

## Scalability
- **HPA (Horizontal Pod Autoscaler)**: Can be added to scale pods based on CPU/Memory usage.
- **Cluster Autoscaler**: Scales EC2 nodes based on pod demand.

## Security
- **Namespace Isolation**: App runs in the `ecommerce` namespace.
- **Resource Limits**: CPU and Memory limits are enforced to prevent resource exhaustion.
- **Non-root User**: Containers run as a non-privileged user.
