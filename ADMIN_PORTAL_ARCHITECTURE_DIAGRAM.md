# STUDYSPOT Admin Portal - Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        A[Admin Portal<br/>React 19 + TypeScript<br/>Port: 3002]
        B[Mobile Apps<br/>React Native/Flutter]
        C[Web Owner Portal<br/>React + TypeScript]
    end

    subgraph "API Gateway Layer"
        D[API Gateway<br/>Express.js + JWT<br/>Rate Limiting + CORS]
    end

    subgraph "Microservices Layer"
        E[Auth Service<br/>JWT + MFA]
        F[Tenant Management<br/>Multi-tenant Operations]
        G[User Management<br/>User Lifecycle]
        H[Subscription Service<br/>Billing + Plans]
        I[Payment Service<br/>Stripe Integration]
        J[Notification Service<br/>Email + SMS + Push]
        K[AI/ML Services<br/>Analytics + Recognition]
        L[Security Service<br/>RBAC + Audit]
        M[Monitoring Service<br/>Health + Metrics]
    end

    subgraph "Data Layer"
        N[(PostgreSQL<br/>Primary Database)]
        O[(Redis<br/>Cache + Sessions)]
        P[(MongoDB<br/>Analytics Data)]
    end

    subgraph "Infrastructure"
        Q[Load Balancer]
        R[CDN]
        S[File Storage<br/>S3 Compatible]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    D --> F
    D --> G
    D --> H
    D --> I
    D --> J
    D --> K
    D --> L
    D --> M

    E --> N
    F --> N
    G --> N
    H --> N
    I --> N
    J --> O
    K --> P
    L --> N
    M --> O

    Q --> D
    R --> A
    R --> B
    R --> C
    S --> A
    S --> B
    S --> C
```

## Frontend Architecture

```mermaid
graph TB
    subgraph "React Admin Portal"
        A[App.tsx<br/>Root Component]
        B[MainLayout<br/>Navigation + Sidebar]
        C[AuthLayout<br/>Login/Register]
        
        subgraph "Pages"
            D[Dashboard<br/>Analytics + Stats]
            E[Tenant Management<br/>Multi-tenant Operations]
            F[User Management<br/>RBAC + Permissions]
            G[Subscription Management<br/>Billing + Plans]
            H[Security Management<br/>Audit + Compliance]
            I[Service Management<br/>Microservices Health]
        end
        
        subgraph "Components"
            J[Common Components<br/>ErrorBoundary, LoadingSpinner]
            K[Admin Components<br/>DataGrid, Charts]
            L[Tenant Components<br/>Onboarding, Settings]
        end
        
        subgraph "State Management"
            M[Redux Store<br/>Global State]
            N[React Query<br/>Server State]
            O[Custom Hooks<br/>Business Logic]
        end
        
        subgraph "Services"
            P[API Client<br/>Axios + Interceptors]
            Q[Auth Service<br/>JWT Management]
            R[Tenant Service<br/>Multi-tenant API]
            S[Subscription Service<br/>Billing API]
        end
    end

    A --> B
    A --> C
    B --> D
    B --> E
    B --> F
    B --> G
    B --> H
    B --> I
    
    D --> J
    E --> K
    F --> L
    
    M --> N
    N --> O
    
    P --> Q
    P --> R
    P --> S
```

## Microservices Architecture

```mermaid
graph TB
    subgraph "API Gateway"
        A[Express.js Gateway<br/>Authentication<br/>Rate Limiting<br/>Request Routing]
    end

    subgraph "Core Services"
        B[Auth Service<br/>JWT + MFA<br/>Session Management]
        C[Tenant Service<br/>Multi-tenant Operations<br/>Onboarding]
        D[User Service<br/>User Management<br/>Profile Management]
    end

    subgraph "Business Services"
        E[Subscription Service<br/>Billing Management<br/>Plan Management]
        F[Payment Service<br/>Stripe Integration<br/>Invoice Generation]
        G[Notification Service<br/>Email + SMS + Push<br/>Template Management]
        H[Communication Service<br/>Multi-channel Messaging<br/>Campaign Management]
    end

    subgraph "AI/ML Services"
        I[AI Service<br/>AI-powered Features<br/>Recommendations]
        J[ML Service<br/>Machine Learning<br/>Predictive Analytics]
        K[Analytics Service<br/>Data Analytics<br/>Business Intelligence]
        L[Face Recognition<br/>Biometric Authentication<br/>Fraud Detection]
    end

    subgraph "Infrastructure Services"
        M[Monitoring Service<br/>Health Checks<br/>Performance Metrics]
        N[Security Service<br/>RBAC + Permissions<br/>Audit Logging]
        O[Data Pipeline<br/>ETL Operations<br/>Data Processing]
        P[Encryption Service<br/>Data Encryption<br/>Key Management]
    end

    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    A --> J
    A --> K
    A --> L
    A --> M
    A --> N
    A --> O
    A --> P
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant A as Admin Portal
    participant G as API Gateway
    participant S as Microservice
    participant D as Database
    participant C as Cache

    U->>A: Login Request
    A->>G: POST /api/auth/login
    G->>S: Route to Auth Service
    S->>D: Validate Credentials
    D-->>S: User Data
    S-->>G: JWT Token
    G-->>A: Authentication Response
    A-->>U: Login Success

    U->>A: View Dashboard
    A->>G: GET /api/dashboard/stats
    G->>S: Route to Analytics Service
    S->>C: Check Cache
    alt Cache Hit
        C-->>S: Cached Data
    else Cache Miss
        S->>D: Query Database
        D-->>S: Analytics Data
        S->>C: Store in Cache
    end
    S-->>G: Dashboard Data
    G-->>A: Response
    A-->>U: Display Dashboard

    U->>A: Manage Tenant
    A->>G: PUT /api/tenants/:id
    G->>S: Route to Tenant Service
    S->>D: Update Tenant Data
    D-->>S: Success
    S->>C: Invalidate Cache
    S-->>G: Success Response
    G-->>A: Update Confirmation
    A-->>U: Success Message
```

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        A[Frontend Security<br/>Input Validation<br/>XSS Protection<br/>CSRF Protection]
        B[API Gateway Security<br/>Rate Limiting<br/>Authentication<br/>Authorization]
        C[Service Security<br/>JWT Validation<br/>Permission Checks<br/>Audit Logging]
        D[Data Security<br/>Encryption at Rest<br/>Encryption in Transit<br/>Access Controls]
    end

    subgraph "Authentication Flow"
        E[User Login<br/>Credentials]
        F[JWT Token Generation<br/>Access + Refresh]
        G[Token Validation<br/>Middleware]
        H[Permission Check<br/>RBAC System]
    end

    subgraph "Authorization System"
        I[Role Hierarchy<br/>Super Admin > Admin > Library Owner]
        J[Permission Matrix<br/>50+ Granular Permissions]
        K[Resource Access Control<br/>Tenant Isolation]
        L[Audit Trail<br/>All Actions Logged]
    end

    A --> B
    B --> C
    C --> D

    E --> F
    F --> G
    G --> H

    I --> J
    J --> K
    K --> L
```

## Performance Architecture

```mermaid
graph TB
    subgraph "Frontend Performance"
        A[Code Splitting<br/>Lazy Loading<br/>Route-based Chunks]
        B[Bundle Optimization<br/>Tree Shaking<br/>Minification]
        C[Caching Strategy<br/>Service Worker<br/>Local Storage]
        D[Performance Monitoring<br/>Web Vitals<br/>Real-time Metrics]
    end

    subgraph "Backend Performance"
        E[Load Balancing<br/>Multiple Instances<br/>Health Checks]
        F[Database Optimization<br/>Indexing<br/>Query Optimization]
        G[Caching Layer<br/>Redis Cache<br/>CDN Integration]
        H[Microservices Scaling<br/>Independent Scaling<br/>Resource Allocation]
    end

    subgraph "Infrastructure Performance"
        I[CDN<br/>Global Distribution<br/>Static Asset Caching]
        J[Database Sharding<br/>Horizontal Scaling<br/>Read Replicas]
        K[Monitoring<br/>APM Tools<br/>Alerting System]
        L[Auto-scaling<br/>Dynamic Resource Allocation<br/>Cost Optimization]
    end

    A --> B
    B --> C
    C --> D

    E --> F
    F --> G
    G --> H

    I --> J
    J --> K
    K --> L
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        A[Local Development<br/>Hot Reloading<br/>Mock Data]
        B[Development API<br/>Local Services<br/>Test Database]
    end

    subgraph "Staging Environment"
        C[Staging Portal<br/>Production-like<br/>Feature Testing]
        D[Staging API<br/>Full Microservices<br/>Staging Database]
    end

    subgraph "Production Environment"
        E[Production Portal<br/>CDN + Load Balancer<br/>High Availability]
        F[Production API<br/>Scaled Microservices<br/>Production Database]
    end

    subgraph "CI/CD Pipeline"
        G[Source Control<br/>Git Repository<br/>Branch Management]
        H[Build Process<br/>TypeScript Compilation<br/>Bundle Generation]
        I[Testing<br/>Unit Tests<br/>Integration Tests]
        J[Deployment<br/>Automated Deployment<br/>Rollback Capability]
    end

    A --> B
    C --> D
    E --> F

    G --> H
    H --> I
    I --> J
    J --> C
    J --> E
```

This comprehensive architecture review provides a detailed analysis of the STUDYSPOT Admin Portal's architecture, highlighting its strengths, areas for improvement, and recommendations for future development.
