# StudySpot Backend Services

Professional multi-tenant SaaS backend for library management.

## Architecture

- **API Gateway** - Routes requests to microservices
- **Auth Service** - Authentication and authorization
- **Student Service** - Student management
- **Library Service** - Library management
- **Booking Service** - Seat booking management
- **Payment Service** - Payment processing

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

### Installation

```bash
npm install
```

### Configuration

1. Copy `.env.example` to `.env`
2. Fill in database credentials and other settings
3. Ensure `JWT_SECRET` is at least 32 characters

### Database Setup

```bash
# Run migrations
npm run migrate
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Documentation

See `/docs/api` for detailed API documentation.

## Testing

```bash
npm test
```

## Logging

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- `logs/exceptions.log` - Unhandled exceptions
- `logs/rejections.log` - Unhandled promise rejections

## Security

- JWT authentication
- Password hashing (bcrypt)
- Input validation (Zod)
- SQL injection prevention
- CORS configuration
- Rate limiting
- Security headers (Helmet)

## License

Proprietary - StudySpot India Pvt. Ltd.
