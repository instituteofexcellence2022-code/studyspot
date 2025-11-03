# 🚀 StudySpot Web Admin Portal v2.0

> Comprehensive SaaS Admin Portal for StudySpot Platform - Fresh Rebuild

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/MUI-7.0-blue.svg)](https://mui.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Building](#building)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## 🎯 Overview

StudySpot Web Admin Portal is a comprehensive SaaS management platform designed for managing a multi-tenant B2B2C library management system. This is a complete rebuild (v2.0) with clean architecture, modern tech stack, and best practices.

### Key Capabilities

- **Multi-Tenant Management**: Manage hundreds of library tenants
- **Revenue & Billing**: Track MRR, ARR, subscriptions, invoices
- **Credit System**: Manage SMS/WhatsApp/Email credits (B2B2C model)
- **Payment Processing**: Handle transactions, settlements, fee configuration
- **CRM & Messaging**: Leads, contacts, campaigns
- **Analytics & Reports**: Comprehensive dashboards and insights
- **System Monitoring**: Health checks, performance metrics

---

## ✨ Features

### Core Modules

- ✅ **Dashboard**: Overview metrics, quick actions, activity feed
- ✅ **Tenant Management**: CRUD operations, onboarding wizard, settings
- ✅ **User Management**: Platform users, roles, permissions
- ✅ **Revenue & Billing**: MRR/ARR tracking, invoices, analytics
- ✅ **Credit Management**: Master wallet, tenant wallets, packages
- ✅ **Subscription Management**: Plans, changes, analytics
- ✅ **Payment Management**: Transactions, settlements, automation
- ✅ **CRM**: Leads and contacts management
- ✅ **Messaging**: Inbox, campaigns, templates
- ✅ **Notifications**: System and user alerts
- ✅ **Analytics & BI**: Custom reports, data visualization
- ✅ **Reports**: Pre-built and custom reports
- ✅ **System Health**: Service monitoring, logs
- ✅ **API Documentation**: Reference, guides, examples
- ✅ **Settings**: General, security, integrations

---

## 🛠️ Tech Stack

### Frontend

- **React 18.3** - UI library
- **TypeScript 5.6** - Type safety
- **Vite 5.4** - Build tool
- **Material-UI v7** - Component library
- **Emotion** - CSS-in-JS styling

### State Management

- **Redux Toolkit** - Global state
- **Redux Persist** - State persistence
- **React Query** - Server state

### Data & Forms

- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Yup** - Validation
- **Recharts** - Data visualization
- **MUI X Data Grid** - Advanced tables

### Development

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **React Testing Library** - Component testing

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0

### Installation

```bash
# Navigate to project directory
cd web-admin-new

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.development

# Start development server
npm run dev
```

The application will open at `http://localhost:3001`

### Default Credentials

```
Email: admin@studyspot.com
Password: Admin@123
```

---

## 📁 Project Structure

```
web-admin-new/
├── public/                  # Static assets
├── src/
│   ├── main.tsx            # Entry point
│   ├── App.tsx             # Root component
│   ├── api/                # API layer
│   ├── components/         # Shared components
│   ├── config/             # Configuration
│   ├── hooks/              # Custom hooks
│   ├── modules/            # Feature modules
│   ├── routes/             # Routing
│   ├── store/              # Redux store
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── .env.example            # Environment template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for detailed structure.

---

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Type check
npm run type-check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run tests
npm test

# Run tests with UI
npm test:ui

# Generate coverage report
npm test:coverage
```

### Development Workflow

1. **Create a feature branch**: `git checkout -b feature/my-feature`
2. **Make changes**: Write code, tests, documentation
3. **Run tests**: `npm test`
4. **Lint & format**: `npm run lint:fix && npm run format`
5. **Commit**: `git commit -m "feat: add my feature"`
6. **Push**: `git push origin feature/my-feature`
7. **Create PR**: Open pull request for review

### Code Style

- **TypeScript**: Strict mode enabled
- **Components**: Functional components with hooks
- **State**: Redux Toolkit for global, React Query for server
- **Styling**: Emotion (CSS-in-JS) via MUI `sx` prop
- **Formatting**: Prettier with 2-space indentation

---

## 🏗️ Building

```bash
# Production build
npm run build

# Preview build
npm run preview
```

Build output will be in the `dist/` directory.

### Build Optimization

- **Code Splitting**: Route-based lazy loading
- **Tree Shaking**: Unused code elimination
- **Minification**: Terser for JS, cssnano for CSS
- **Compression**: Brotli + Gzip
- **Caching**: Hashed filenames for cache busting

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test:coverage

# Run tests with UI
npm test:ui
```

### Testing Strategy

- **Unit Tests**: Utility functions, hooks, Redux slices
- **Integration Tests**: Component interactions, API calls
- **E2E Tests**: Critical user flows (login, CRUD operations)

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting provider
```

### Environment Variables

Required environment variables:

```env
VITE_API_BASE_URL=https://api.studyspot.com
VITE_APP_NAME=StudySpot Admin Portal
VITE_APP_VERSION=2.0.0
VITE_ENABLE_MOCK=false
```

---

## 📚 Documentation

- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)**: Comprehensive project plan
- **[API.md](./docs/API.md)**: API integration guide
- **[CONTRIBUTING.md](./docs/CONTRIBUTING.md)**: Contribution guidelines
- **[CHANGELOG.md](./CHANGELOG.md)**: Version history

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for details.

### Contribution Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add new feature
fix(scope): fix bug
docs(scope): update documentation
style(scope): format code
refactor(scope): refactor code
test(scope): add tests
chore(scope): update build scripts
```

---

## 📄 License

Copyright © 2025 StudySpot. All rights reserved.

---

## 👥 Team

- **Product Owner**: StudySpot Team
- **Development**: Full Stack Development Team
- **Design**: UI/UX Design Team

---

## 📞 Support

- **Email**: support@studyspot.com
- **Documentation**: https://docs.studyspot.com
- **Issue Tracker**: GitHub Issues

---

## 🙏 Acknowledgments

- Material-UI team for excellent component library
- React team for amazing framework
- Vite team for blazing fast build tool
- All open-source contributors

---

**Built with ❤️ by the StudySpot Team**

**Last Updated**: October 31, 2025  
**Version**: 2.0.0  
**Status**: Ready for Development 🚀


