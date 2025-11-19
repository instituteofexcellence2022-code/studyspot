# Contributing to StudySpot Platform

Thank you for your interest in contributing to StudySpot!

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studyspot-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your values
   ```

4. **Run database migrations**
   ```bash
   cd backend
   npm run migrate
   ```

5. **Start development servers**
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend (in separate terminals)
   cd web-owner
   npm start

   cd studyspot-student-pwa
   npm start
   ```

## Code Style

- Use TypeScript
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Update documentation
5. Submit pull request
6. Address review comments

## Testing

Run tests before submitting:
```bash
npm test
```

## Questions?

Contact the development team.

