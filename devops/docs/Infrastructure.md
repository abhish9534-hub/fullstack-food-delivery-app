# Infrastructure as Code (Terraform)

We use Terraform to manage the entire AWS infrastructure, ensuring consistency and reproducibility.

## Components

- **VPC**: A custom VPC with public and private subnets across 3 Availability Zones.
- **NAT Gateway**: Allows private subnets to access the internet (for updates/patches).
- **EKS Cluster**: A managed Kubernetes cluster.
- **Node Groups**: Managed EC2 instances running the Kubernetes workloads.
- **ECR**: Private container registries for frontend and backend images.
- **IAM Roles**: Fine-grained permissions using IAM Roles for Service Accounts (IRSA).

## Best Practices
- **Remote State**: State is stored in S3 with DynamoDB locking (commented out in `main.tf`).
- **Modular Design**: Uses official AWS modules for VPC and EKS.
- **Tagging**: Consistent tagging for resource management and cost tracking.
