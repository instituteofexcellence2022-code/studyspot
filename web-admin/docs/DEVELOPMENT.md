# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 8+
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd web-admin

# Install dependencies
npm install

# Start development server
npm start
```

### Development Scripts

```bash
# Start development server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run accessibility tests
npm run test:a11y

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check

# Format code
npm run format

# Check formatting
npm run format:check

# Security audit
npm run audit

# Build for production
npm run build

# Analyze bundle
npm run bundle:analyze
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components
│   ├── admin/          # Admin-specific components
│   └── tenant/         # Tenant management components
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   ├── auth/           # Authentication pages
│   └── tenant/         # Tenant pages
├── layouts/            # Layout components
├── services/           # API services
├── store/              # Redux store
│   └── slices/         # Redux slices
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── config/             # Configuration files
└── __tests__/          # Test files
    ├── components/     # Component tests
    ├── hooks/          # Hook tests
    ├── services/       # Service tests
    └── e2e/            # E2E tests
```

## Architecture

### Frontend Architecture

- **React 19** - UI library
- **TypeScript** - Type safety
- **Material-UI** - Component library
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **React Router** - Routing

### State Management

- **Redux Toolkit** for global state
- **React Query** for server state
- **React Hook Form** for form state
- **Redux Persist** for state persistence

### Testing Strategy

- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **Accessibility testing** - WCAG 2.1 AA compliance

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

### Component Guidelines

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Follow Material-UI patterns

### Testing Guidelines

- Write unit tests for all components
- Write integration tests for complex flows
- Write E2E tests for critical user journeys
- Maintain 80%+ test coverage

### Accessibility Guidelines

- Follow WCAG 2.1 AA guidelines
- Use semantic HTML
- Provide proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

## API Integration

### API Client

The application uses a centralized API client with:

- Automatic token management
- Request/response interceptors
- Error handling
- Retry logic

### Service Layer

Each domain has its own service:

- `authService` - Authentication
- `userService` - User management
- `tenantService` - Tenant management
- `subscriptionService` - Billing

## Performance

### Bundle Optimization

- Code splitting with lazy loading
- Tree shaking
- Bundle analysis
- Performance monitoring

### Monitoring

- Real-time performance metrics
- Error tracking
- User activity tracking
- System health monitoring

## Security

### Authentication

- JWT-based authentication
- Refresh token rotation
- Session management
- Multi-factor authentication support

### Authorization

- Role-based access control (RBAC)
- Permission-based authorization
- Route protection
- Component-level permissions

## Deployment

### Environments

- **Development** - Local development
- **Staging** - Pre-production testing
- **Production** - Live environment

### CI/CD Pipeline

- Automated testing
- Security scanning
- Accessibility testing
- Performance testing
- Automated deployment

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 3002
   npx kill-port 3002
   ```

2. **Memory issues**
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS=--max_old_space_size=4096 npm start
   ```

3. **TypeScript errors**
   ```bash
   # Run type check
   npm run type-check
   ```

### Debug Mode

Enable debug mode by setting:

```bash
REACT_APP_DEBUG=true npm start
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run the test suite
5. Submit a pull request

### Pull Request Checklist

- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Coverage is maintained
- [ ] Accessibility requirements met
- [ ] Performance impact assessed
- [ ] Documentation updated
