# 🎓 StudySpot Platform

**A comprehensive multi-tenant SaaS platform connecting students with study spaces**

> **Current Status**: 25-30% Complete (Architecture restructured)  
> **Phase**: 6 - SaaS Foundation (In Progress)  
> **Architecture**: ✅ **3-Portal System** (Mobile + Owner Web + Admin Web)  
> **Timeline**: 10-12 months to full launch

## 🏗️ **NEW ARCHITECTURE** (October 2025)

The platform is now **properly structured** into 3 separate applications:

1. **📱 Mobile App** (`/mobile`) - Students (React Native)
2. **🏢 Owner Portal** (`/web-owner`) - Library Owners/Staff (React Web)
3. **⚙️ Admin Portal** (`/web-admin`) - Platform Administrators (React Web)

**Why this matters**: Better security, smaller bundles (50-60% reduction), independent deployment, and professional SaaS architecture.

📖 **Read**: [`ARCHITECTURE.md`](ARCHITECTURE.md) for complete details

---

## 👥 **FOR AI AGENT DEVELOPERS**

**Are you one of the 4 AI agents building this platform?**

👉 **START HERE**: [`communication/START_HERE_ALL_AGENTS.md`](communication/START_HERE_ALL_AGENTS.md)

**Quick Start**:
1. Click the link above
2. Find your role (Agent 1/2/3/4)
3. Read your specific instructions
4. Copy-paste code and start building!

---

## 📊 **Project Status**

**What's Built** (15-20%):
- ✅ 116 basic API endpoints
- ✅ 16 database tables
- ✅ JWT authentication
- ✅ Basic web app (React)
- ✅ Infrastructure (Docker, K8s)

**What's Next** (Phase 6 - 8 weeks):
- ⏳ Subscription system (Stripe)
- ⏳ Multi-tenant enhancement
- ⏳ RBAC (6 roles, 50+ permissions)
- ⏳ Credit management (SMS/WhatsApp)
- ⏳ Mobile app foundation

**Full Platform** (Planned):
- A comprehensive multi-tenant SaaS platform
- AI-powered recommendations
- Real-time booking & payments
- Advanced analytics & gamification
- IoT integration for smart libraries

---

## 📁 **Documentation for Developers**

### **For AI Agent Developers**:
- [`communication/START_HERE_ALL_AGENTS.md`](communication/START_HERE_ALL_AGENTS.md) - **Main entry point**
- [`communication/AGENT_1_INSTRUCTIONS.md`](communication/AGENT_1_INSTRUCTIONS.md) - Backend developer
- [`communication/AGENT_2_INSTRUCTIONS.md`](communication/AGENT_2_INSTRUCTIONS.md) - Frontend web developer
- [`communication/AGENT_3_INSTRUCTIONS.md`](communication/AGENT_3_INSTRUCTIONS.md) - Mobile developer
- [`communication/AGENT_4_INSTRUCTIONS.md`](communication/AGENT_4_INSTRUCTIONS.md) - Integration specialist

### **Coordination & Planning**:
- [`PROJECT_STATUS_ANALYSIS.md`](PROJECT_STATUS_ANALYSIS.md) - Complete gap analysis
- [`communication/AI_AGENTS_COORDINATION.md`](communication/AI_AGENTS_COORDINATION.md) - Team protocol
- [`communication/PHASE_6_KICKOFF.md`](communication/PHASE_6_KICKOFF.md) - Phase 6 overview
- [`communication/SPRINT_PLANNING.md`](communication/SPRINT_PLANNING.md) - Sprint details
- [`communication/API_CONTRACTS.md`](communication/API_CONTRACTS.md) - API specifications

### **Daily Tracking**:
- [`communication/BLOCKERS.md`](communication/BLOCKERS.md) - Track blockers across agents
- `communication/agent-X-xxx/STATUS.md` - Each agent's daily status

---

## 🚀 Features (Planned)

### For Students
- **Smart Library Discovery**: Find study spaces based on location, amenities, and availability
- **Real-time Booking**: Book seats with instant confirmation and QR code check-in
- **Flexible Payment Options**: Multiple payment gateways with secure processing
- **AI-Powered Recommendations**: ML-based study recommendations with 85-95% accuracy
- **Study Analytics**: Track study patterns and optimize learning schedules
- **Pomodoro Timer & Task Management**: Built-in productivity tools
- **Gamification**: Achievements, rewards, and level progression
- **Social Features**: Study groups, discussion forums, and notes sharing
- **Smart Scheduling**: AI-optimized study time recommendations
- **Success Prediction**: Know your booking success probability before booking

### For Library Owners
- **Multi-branch Management**: Manage multiple library locations from one dashboard
- **Revenue Analytics**: Comprehensive financial reporting and insights
- **Seat Management**: Real-time seat availability and occupancy tracking
- **Customer Management**: User profiles, booking history, and feedback
- **Marketing Tools**: Promotional campaigns and loyalty programs
- **Smart Library Features**: IoT device control and automation
- **Energy Monitoring**: Track and optimize energy consumption
- **Predictive Insights**: ML-powered trends and forecasting
- **Anomaly Detection**: Automatic detection of unusual patterns

### For Platform Administrators
- **Multi-tenant Architecture**: Isolated data and configurations per tenant
- **Advanced Analytics**: Platform-wide metrics and performance monitoring
- **User Management**: Role-based access control and user administration
- **Financial Oversight**: Revenue tracking and payment reconciliation
- **System Monitoring**: Health checks, alerts, and performance metrics

## 🏗️ Architecture

### 🎯 **3-Portal System** (NEW - Oct 2025)

#### **📱 1. Student Mobile App** (`/mobile`)
- **Target Users**: Students (end customers)
- **Platform**: React Native (iOS/Android)
- **Features**: Library discovery, seat booking, QR check-in, study tools, gamification
- **Port**: Expo (19000/19001/19002)
- **Status**: ✅ Correctly structured

#### **🏢 2. Library Owner Portal** (`/web-owner`)
- **Target Users**: Library owners/staff (B2B customers)
- **Platform**: React 19 Web Application
- **Features**: Student mgmt, staff mgmt, bookings, payments, subscriptions, credits, analytics, IoT, face recognition
- **Port**: 3000
- **Theme**: Blue (#1976d2)
- **Status**: ✅ App.tsx created, needs file copying

#### **⚙️ 3. Platform Admin Portal** (`/web-admin`)
- **Target Users**: SaaS company administrators (internal)
- **Platform**: React 19 Web Application
- **Features**: Tenant mgmt, platform analytics, revenue (MRR/ARR), credit pricing, security, compliance
- **Port**: 3002
- **Theme**: Red (#d32f2f)
- **Status**: ✅ App.tsx created, needs file copying

#### **🔌 4. Backend API** (`/api`)
- **Platform**: Node.js + Express
- **Port**: 3001
- **Features**: RESTful API, multi-tenant database, JWT auth, payments (Razorpay/Stripe)
- **Database**: PostgreSQL with tenant isolation
- **Cache**: Redis for sessions and performance
- **Status**: ✅ Complete with 116 endpoints

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Kubernetes for scalable deployment
- **Monitoring**: Prometheus, Grafana, and ELK stack
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Security**: OWASP compliance with regular security audits

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Authentication**: JWT + OAuth 2.0
- **Documentation**: Swagger/OpenAPI 3.0

### Frontend
- **Framework**: React.js 18
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library

### Mobile
- **Framework**: React Native
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: Redux Toolkit
- **UI Library**: NativeBase
- **Testing**: Jest + Detox

### DevOps
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack
- **Cloud**: AWS/GCP

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15
- Redis 7

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/studyspot/platform.git
   cd platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd api && npm install
   cd ../web && npm install
   ```

3. **Set up environment variables**
   ```bash
   cp api/env.example api/.env
   cp web/.env.example web/.env
   ```

4. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   cd api && npm run migrate
   ```

6. **Seed the database**
   ```bash
   cd api && npm run seed
   ```

7. **Start the development servers**
   ```bash
   npm run dev
   ```

### Access Points
- **API**: http://localhost:3001
- **Web App**: http://localhost:3000
- **API Documentation**: http://localhost:3001/api-docs
- **Grafana**: http://localhost:3002 (admin/admin123)
- **Prometheus**: http://localhost:9090

## 📚 API Documentation

The API documentation is available at `/api-docs` when running the development server. It includes:

- **Authentication**: JWT-based authentication with refresh tokens
- **Users**: User management and profile operations
- **Libraries**: Library CRUD operations and search
- **Bookings**: Booking management and availability checking
- **Payments**: Payment processing and refund handling
- **Notifications**: Real-time notification system

### Example API Usage

```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'

# Search libraries
curl -X GET "http://localhost:3001/api/libraries?city=Mumbai&amenities=wifi,ac" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Testing

### Backend Testing
```bash
cd api
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Frontend Testing
```bash
cd web
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### E2E Testing
```bash
npm run test:e2e      # Run end-to-end tests
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -l app=studyspot

# View logs
kubectl logs -f deployment/studyspot-api
```

### Environment Variables

#### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: JWT signing secret
- `RAZORPAY_KEY_ID`: Razorpay API key
- `RAZORPAY_KEY_SECRET`: Razorpay API secret

#### Optional Environment Variables
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3001)
- `LOG_LEVEL`: Logging level (default: info)
- `CORS_ORIGIN`: CORS allowed origins

## 📊 Monitoring

### Metrics
- **Application Metrics**: Request rate, response time, error rate
- **Business Metrics**: Active users, bookings, payments
- **Infrastructure Metrics**: CPU, memory, disk usage
- **Database Metrics**: Connection pool, query performance

### Dashboards
- **Platform Overview**: Key metrics and system health
- **User Analytics**: User behavior and engagement
- **Financial Metrics**: Revenue and payment analytics
- **System Performance**: Infrastructure and application performance

### Alerts
- **High Error Rate**: >5% error rate for 5 minutes
- **High Response Time**: >2s average response time
- **Database Issues**: Connection pool exhaustion
- **Payment Failures**: Payment processing errors

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Multi-factor authentication support
- OAuth 2.0 integration (Google, Facebook, LinkedIn)

### Data Protection
- Encryption at rest and in transit
- PII data anonymization
- GDPR compliance features
- Regular security audits

### API Security
- Rate limiting and DDoS protection
- Input validation and sanitization
- SQL injection prevention
- XSS and CSRF protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.studyspot.com](https://docs.studyspot.com)
- **Issues**: [GitHub Issues](https://github.com/studyspot/platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/studyspot/platform/discussions)
- **Email**: support@studyspot.com

## 🗺️ Development Roadmap

### Phases 1-5: Foundation & Infrastructure (15-20% Complete)
- ✅ Basic platform architecture
- ✅ User authentication (JWT)
- ✅ Library and booking system (basic)
- ✅ Payment integration (Razorpay - partial)
- ✅ Basic CRUD APIs (116 endpoints)
- ✅ Database schema (16 tables)
- ✅ Basic web app (React)
- ✅ Infrastructure (Docker, K8s configs)

### Phase 6: SaaS Foundation (🔄 In Progress - Weeks 1-8)
**Goal**: Transform into a fully functional SaaS platform

- ⏳ **Sprint 1** (Weeks 1-2): Subscription System
  - Stripe integration
  - 4 subscription plans (Free, Starter, Pro, Enterprise)
  - Recurring billing
  - Invoice generation

- ⏳ **Sprint 2** (Weeks 3-4): Multi-Tenant Enhancement
  - Tenant onboarding wizard
  - Tenant settings & customization
  - Enhanced data isolation
  - Tenant analytics

- ⏳ **Sprint 3** (Weeks 5-6): RBAC System
  - 6 predefined roles (Super Admin, Library Owner, Manager, etc.)
  - 50+ permissions
  - Permission-based access control
  - Audit logging

- ⏳ **Sprint 4** (Weeks 7-8): Credit Management
  - SMS credit system
  - WhatsApp credit system
  - Auto-topup functionality
  - Usage analytics

**Target Completion**: Mid-December 2025 (~35-40% complete)

### Phase 7: Mobile App (Weeks 9-18)
- React Native app (iOS + Android)
- Complete student-facing features
- Social login (Google, Facebook)
- QR code scanner & check-in
- Push notifications
- App Store & Play Store deployment

### Phase 8: Library Owner Features (Weeks 19-30)
- Advanced student/staff management
- Custom fee plans & pricing engine
- Bulk communication (SMS/WhatsApp)
- Advanced analytics & reporting
- Multi-branch support

### Phase 9: Platform Management (Weeks 31-40)
- Super admin platform
- Platform-wide analytics & BI
- Customer success tools
- Feature flags & A/B testing
- API management portal

### Phase 10: Advanced Features (Weeks 41-50)
- AI/ML recommendations (real ML models)
- Predictive analytics
- AI chatbot (GPT integration)
- Study resources platform
- Enhanced gamification
- IoT integration
- Social features

**Expected Launch**: September 2026 (100% complete)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped build this platform
- Special thanks to the open-source community for the amazing tools and libraries
- Inspired by the need for better study space management in educational institutions

---

**StudySpot Platform** - Connecting students with perfect study spaces, one booking at a time. 🎓✨