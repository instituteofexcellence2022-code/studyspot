# 🚀 STUDYSPOT Platform - Deployment Guide

## 📋 Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Environment Setup](#environment-setup)
3. [Infrastructure as Code](#infrastructure-as-code)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Container Orchestration](#container-orchestration)
6. [Database Deployment](#database-deployment)
7. [Application Deployment](#application-deployment)
8. [Monitoring & Logging](#monitoring--logging)
9. [Security Configuration](#security-configuration)
10. [Backup & Recovery](#backup--recovery)
11. [Rollback Procedures](#rollback-procedures)
12. [Troubleshooting](#troubleshooting)

## 🎯 Deployment Overview

### Deployment Strategy
- **Blue-Green Deployment**: Zero-downtime deployments
- **Canary Releases**: Gradual rollout for new features
- **Infrastructure as Code**: Terraform for infrastructure management
- **Container Orchestration**: Kubernetes for application deployment
- **Automated CI/CD**: GitHub Actions for continuous deployment

### Environment Structure
```
Development → Staging → Production
     ↓           ↓         ↓
   Local      AWS/GCP    AWS/GCP
  Docker     Kubernetes  Kubernetes
```

### Deployment Phases
1. **Infrastructure Provisioning**
2. **Database Setup & Migration**
3. **Application Deployment**
4. **Service Configuration**
5. **Health Checks & Validation**
6. **Traffic Routing**
7. **Monitoring Setup**

---

## 🏗️ Environment Setup

### Prerequisites
```bash
# Required Tools
- Docker 20.10+
- Kubernetes 1.25+
- Terraform 1.5+
- kubectl 1.25+
- AWS CLI 2.0+ or Google Cloud SDK
- Helm 3.0+
```

### Environment Variables
```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/studyspot
REDIS_URL=redis://redis-host:6379
JWT_SECRET=your-jwt-secret
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=studyspot-files
```

### Cloud Provider Setup

#### AWS Configuration
```bash
# Configure AWS CLI
aws configure
AWS Access Key ID: [Your Access Key]
AWS Secret Access Key: [Your Secret Key]
Default region name: us-east-1
Default output format: json

# Create S3 bucket for Terraform state
aws s3 mb s3://studyspot-terraform-state
aws s3api put-bucket-versioning --bucket studyspot-terraform-state --versioning-configuration Status=Enabled
```

#### Google Cloud Configuration
```bash
# Configure Google Cloud CLI
gcloud auth login
gcloud config set project studyspot-platform
gcloud config set compute/region us-central1
gcloud config set compute/zone us-central1-a
```

---

## 🏗️ Infrastructure as Code

### Terraform Configuration

#### Main Configuration (main.tf)
```hcl
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "studyspot-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "studyspot"
}
```

#### VPC Configuration (vpc.tf)
```hcl
# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-vpc"
    Environment = var.environment
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.project_name}-${var.environment}-igw"
    Environment = var.environment
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count = 2

  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-public-${count.index + 1}"
    Environment = var.environment
    Type        = "public"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count = 2

  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name        = "${var.project_name}-${var.environment}-private-${count.index + 1}"
    Environment = var.environment
    Type        = "private"
  }
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-public-rt"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  count = 2

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
```

#### EKS Cluster Configuration (eks.tf)
```hcl
# EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = "${var.project_name}-${var.environment}-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "1.27"

  vpc_config {
    subnet_ids              = aws_subnet.private[*].id
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = ["0.0.0.0/0"]
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
    aws_iam_role_policy_attachment.eks_vpc_resource_controller,
  ]

  tags = {
    Name        = "${var.project_name}-${var.environment}-cluster"
    Environment = var.environment
  }
}

# EKS Node Group
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.project_name}-${var.environment}-nodes"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = aws_subnet.private[*].id

  scaling_config {
    desired_size = 3
    max_size     = 10
    min_size     = 2
  }

  instance_types = ["t3.medium"]

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_read_only,
  ]

  tags = {
    Name        = "${var.project_name}-${var.environment}-nodes"
    Environment = var.environment
  }
}
```

#### RDS Configuration (rds.tf)
```hcl
# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-subnet-group"
    Environment = var.environment
  }
}

# RDS Security Group
resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-${var.environment}-rds-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-sg"
    Environment = var.environment
  }
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-db"

  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = "studyspot"
  username = "studyspot"
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = false
  final_snapshot_identifier = "${var.project_name}-${var.environment}-final-snapshot"

  tags = {
    Name        = "${var.project_name}-${var.environment}-db"
    Environment = var.environment
  }
}
```

#### ElastiCache Configuration (redis.tf)
```hcl
# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
}

# ElastiCache Security Group
resource "aws_security_group" "redis" {
  name_prefix = "${var.project_name}-${var.environment}-redis-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-redis-sg"
    Environment = var.environment
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${var.project_name}-${var.environment}-redis"
  description                = "Redis cluster for StudySpot"

  node_type                  = "cache.t3.micro"
  port                       = 6379
  parameter_group_name       = "default.redis7"

  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled          = true

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-redis"
    Environment = var.environment
  }
}
```

### Terraform Deployment Commands
```bash
# Initialize Terraform
terraform init

# Plan infrastructure changes
terraform plan -var-file="environments/production.tfvars"

# Apply infrastructure changes
terraform apply -var-file="environments/production.tfvars"

# Destroy infrastructure (use with caution)
terraform destroy -var-file="environments/production.tfvars"
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

#### Main Workflow (.github/workflows/deploy.yml)
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  EKS_CLUSTER_NAME: studyspot-production-cluster
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Run security scan
        run: npm audit --audit-level=high

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push API image
        env:
          ECR_REPOSITORY: studyspot-api
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./api
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Build and push Web image
        env:
          ECR_REPOSITORY: studyspot-web
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./web
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Update kubeconfig
        run: aws eks update-kubeconfig --region ${{ env.AWS_REGION }} --name ${{ env.EKS_CLUSTER_NAME }}

      - name: Deploy to Kubernetes
        run: |
          # Update image tags in deployment files
          sed -i "s|IMAGE_TAG|${{ github.sha }}|g" k8s/deployments/*.yaml
          
          # Apply Kubernetes manifests
          kubectl apply -f k8s/namespace.yaml
          kubectl apply -f k8s/configmaps/
          kubectl apply -f k8s/secrets/
          kubectl apply -f k8s/deployments/
          kubectl apply -f k8s/services/
          kubectl apply -f k8s/ingress/

      - name: Wait for deployment
        run: |
          kubectl rollout status deployment/studyspot-api -n studyspot
          kubectl rollout status deployment/studyspot-web -n studyspot

      - name: Run health checks
        run: |
          kubectl get pods -n studyspot
          kubectl get services -n studyspot
```

### Docker Configuration

#### API Dockerfile (api/Dockerfile)
```dockerfile
# Multi-stage build for Node.js API
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

#### Web Dockerfile (web/Dockerfile)
```dockerfile
# Multi-stage build for React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

---

## ☸️ Container Orchestration

### Kubernetes Manifests

#### Namespace (k8s/namespace.yaml)
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: studyspot
  labels:
    name: studyspot
    environment: production
```

#### ConfigMap (k8s/configmaps/app-config.yaml)
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: studyspot-config
  namespace: studyspot
data:
  NODE_ENV: "production"
  PORT: "3000"
  LOG_LEVEL: "info"
  CORS_ORIGIN: "https://studyspot.com"
  RATE_LIMIT_WINDOW: "900000"
  RATE_LIMIT_MAX: "100"
```

#### Secret (k8s/secrets/app-secrets.yaml)
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: studyspot-secrets
  namespace: studyspot
type: Opaque
data:
  DATABASE_URL: <base64-encoded-database-url>
  REDIS_URL: <base64-encoded-redis-url>
  JWT_SECRET: <base64-encoded-jwt-secret>
  AWS_ACCESS_KEY_ID: <base64-encoded-access-key>
  AWS_SECRET_ACCESS_KEY: <base64-encoded-secret-key>
```

#### API Deployment (k8s/deployments/api.yaml)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: studyspot-api
  namespace: studyspot
  labels:
    app: studyspot-api
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: studyspot-api
  template:
    metadata:
      labels:
        app: studyspot-api
        version: v1
    spec:
      containers:
      - name: api
        image: IMAGE_TAG
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: studyspot-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: studyspot-secrets
              key: DATABASE_URL
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: studyspot-secrets
              key: REDIS_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: studyspot-secrets
              key: JWT_SECRET
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
      securityContext:
        fsGroup: 1001
```

#### API Service (k8s/services/api.yaml)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: studyspot-api-service
  namespace: studyspot
  labels:
    app: studyspot-api
spec:
  selector:
    app: studyspot-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

#### Ingress (k8s/ingress/main.yaml)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: studyspot-ingress
  namespace: studyspot
  annotations:
    kubernetes.io/ingress.class: "alb"
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/ssl-redirect: '443'
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID
spec:
  tls:
  - hosts:
    - api.studyspot.com
    secretName: studyspot-tls
  rules:
  - host: api.studyspot.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: studyspot-api-service
            port:
              number: 80
```

### Helm Charts

#### Chart.yaml
```yaml
apiVersion: v2
name: studyspot
description: StudySpot Platform Helm Chart
type: application
version: 1.0.0
appVersion: "1.0.0"
```

#### values.yaml
```yaml
replicaCount: 3

image:
  repository: studyspot/api
  tag: "latest"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
  targetPort: 3000

ingress:
  enabled: true
  className: "alb"
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
  hosts:
    - host: api.studyspot.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: studyspot-tls
      hosts:
        - api.studyspot.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

nodeSelector: {}

tolerations: []

affinity: {}
```

---

## 🗄️ Database Deployment

### Database Migration

#### Migration Script (scripts/migrate.js)
```javascript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of migration files
    const migrationDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Check which migrations have been executed
    const executedMigrations = await client.query(
      'SELECT filename FROM migrations ORDER BY id'
    );
    const executedFilenames = executedMigrations.rows.map(row => row.filename);

    // Run pending migrations
    for (const file of files) {
      if (!executedFilenames.includes(file)) {
        console.log(`Running migration: ${file}`);
        
        const migrationSQL = fs.readFileSync(
          path.join(migrationDir, file), 
          'utf8'
        );
        
        await client.query(migrationSQL);
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [file]
        );
        
        console.log(`Migration ${file} completed`);
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
```

#### Database Seeding (scripts/seed.js)
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    // Seed default data
    await client.query(`
      INSERT INTO tenants (id, name, domain, subscription_plan) 
      VALUES 
        ('default-tenant', 'Default Tenant', 'default.studyspot.com', 'free')
      ON CONFLICT (id) DO NOTHING
    `);

    await client.query(`
      INSERT INTO users (id, tenant_id, email, first_name, last_name, role, status) 
      VALUES 
        ('admin-user', 'default-tenant', 'admin@studyspot.com', 'Admin', 'User', 'super_admin', 'active')
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
```

### Database Backup

#### Backup Script (scripts/backup.sh)
```bash
#!/bin/bash

# Database backup script
set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="studyspot_backup_${DATE}.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump $DATABASE_URL > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_DIR/${BACKUP_FILE}.gz s3://studyspot-backups/database/

# Clean up local backup (keep last 7 days)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

---

## 📊 Monitoring & Logging

### Prometheus Configuration

#### prometheus.yml
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'studyspot-api'
    static_configs:
      - targets: ['studyspot-api-service:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
```

### Grafana Dashboard

#### Dashboard Configuration (grafana/dashboard.json)
```json
{
  "dashboard": {
    "id": null,
    "title": "StudySpot Platform Dashboard",
    "tags": ["studyspot", "production"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      }
    ]
  }
}
```

### ELK Stack Configuration

#### Logstash Configuration (logstash/pipeline.conf)
```ruby
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "studyspot-api" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
    
    if [level] == "ERROR" {
      mutate {
        add_tag => [ "error" ]
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "studyspot-logs-%{+YYYY.MM.dd}"
  }
}
```

---

## 🔒 Security Configuration

### SSL/TLS Configuration

#### Certificate Management
```bash
# Request SSL certificate from AWS Certificate Manager
aws acm request-certificate \
  --domain-name studyspot.com \
  --subject-alternative-names "*.studyspot.com" \
  --validation-method DNS \
  --region us-east-1

# Validate certificate
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID
```

### Security Headers

#### Nginx Security Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name api.studyspot.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/studyspot.crt;
    ssl_certificate_key /etc/ssl/private/studyspot.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'";

    location / {
        proxy_pass http://studyspot-api-service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Network Security

#### Security Groups
```hcl
# API Security Group
resource "aws_security_group" "api" {
  name_prefix = "${var.project_name}-${var.environment}-api-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-api-sg"
    Environment = var.environment
  }
}
```

---

## 💾 Backup & Recovery

### Automated Backup Strategy

#### Database Backup (scripts/backup-db.sh)
```bash
#!/bin/bash

# Automated database backup script
set -e

BACKUP_BUCKET="studyspot-backups"
BACKUP_PREFIX="database"
RETENTION_DAYS=30

# Create timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="studyspot_db_${TIMESTAMP}.sql"

# Create database backup
pg_dump $DATABASE_URL > /tmp/$BACKUP_FILE

# Compress backup
gzip /tmp/$BACKUP_FILE

# Upload to S3
aws s3 cp /tmp/${BACKUP_FILE}.gz s3://$BACKUP_BUCKET/$BACKUP_PREFIX/

# Clean up local file
rm /tmp/${BACKUP_FILE}.gz

# Clean up old backups
aws s3 ls s3://$BACKUP_BUCKET/$BACKUP_PREFIX/ | \
  awk '$1 < "'$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)'" {print $4}' | \
  xargs -I {} aws s3 rm s3://$BACKUP_BUCKET/$BACKUP_PREFIX/{}

echo "Backup completed: $BACKUP_FILE.gz"
```

#### File Backup (scripts/backup-files.sh)
```bash
#!/bin/bash

# Automated file backup script
set -e

SOURCE_BUCKET="studyspot-files"
BACKUP_BUCKET="studyspot-backups"
BACKUP_PREFIX="files"

# Sync files to backup bucket
aws s3 sync s3://$SOURCE_BUCKET s3://$BACKUP_BUCKET/$BACKUP_PREFIX/ \
  --storage-class STANDARD_IA

echo "File backup completed"
```

### Disaster Recovery

#### Recovery Procedures
```bash
# Database Recovery
aws s3 cp s3://studyspot-backups/database/studyspot_db_20240115_120000.sql.gz /tmp/
gunzip /tmp/studyspot_db_20240115_120000.sql.gz
psql $DATABASE_URL < /tmp/studyspot_db_20240115_120000.sql

# File Recovery
aws s3 sync s3://studyspot-backups/files/ s3://studyspot-files/

# Application Recovery
kubectl apply -f k8s/
kubectl rollout restart deployment/studyspot-api
kubectl rollout restart deployment/studyspot-web
```

---

## 🔄 Rollback Procedures

### Blue-Green Deployment Rollback

#### Rollback Script (scripts/rollback.sh)
```bash
#!/bin/bash

# Blue-green deployment rollback script
set -e

NAMESPACE="studyspot"
SERVICE_NAME="studyspot-api-service"

# Get current deployment
CURRENT_DEPLOYMENT=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.selector.version}')

if [ "$CURRENT_DEPLOYMENT" = "v1" ]; then
    echo "Currently on v1, rolling back to v2"
    NEW_VERSION="v2"
else
    echo "Currently on v2, rolling back to v1"
    NEW_VERSION="v1"
fi

# Update service selector
kubectl patch service $SERVICE_NAME -n $NAMESPACE -p '{"spec":{"selector":{"version":"'$NEW_VERSION'"}}}'

# Wait for rollout
kubectl rollout status deployment/studyspot-api-$NEW_VERSION -n $NAMESPACE

echo "Rollback completed to version $NEW_VERSION"
```

### Database Rollback

#### Database Rollback Script (scripts/rollback-db.sh)
```bash
#!/bin/bash

# Database rollback script
set -e

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Download backup from S3
aws s3 cp s3://studyspot-backups/database/$BACKUP_FILE /tmp/

# Restore database
gunzip -c /tmp/$BACKUP_FILE | psql $DATABASE_URL

echo "Database rollback completed"
```

---

## 🔧 Troubleshooting

### Common Issues

#### Application Not Starting
```bash
# Check pod status
kubectl get pods -n studyspot

# Check pod logs
kubectl logs -f deployment/studyspot-api -n studyspot

# Check pod events
kubectl describe pod <pod-name> -n studyspot
```

#### Database Connection Issues
```bash
# Test database connection
kubectl exec -it deployment/studyspot-api -n studyspot -- node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error(err);
  else console.log(res.rows[0]);
  pool.end();
});
"
```

#### Performance Issues
```bash
# Check resource usage
kubectl top pods -n studyspot

# Check node resources
kubectl top nodes

# Check HPA status
kubectl get hpa -n studyspot
```

### Monitoring Commands

#### Health Check
```bash
# Check application health
curl -f https://api.studyspot.com/health

# Check database health
curl -f https://api.studyspot.com/health/db

# Check Redis health
curl -f https://api.studyspot.com/health/redis
```

#### Log Analysis
```bash
# Search logs in Elasticsearch
curl -X GET "elasticsearch:9200/studyspot-logs-*/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "level": "ERROR"
    }
  }
}'
```

---

**Document Version**: 1.0.0  
**Last Updated**: [Current Date]  
**Next Review**: [Next Review Date]  
**Deployment Version**: v1.0







































