# 🧪 STUDYSPOT Platform - Testing Strategy

## 📋 Table of Contents

1. [Testing Overview](#testing-overview)
2. [Testing Pyramid](#testing-pyramid)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Mobile Testing](#mobile-testing)
9. [API Testing](#api-testing)
10. [Test Automation](#test-automation)
11. [Test Data Management](#test-data-management)
12. [Quality Gates](#quality-gates)

## 🎯 Testing Overview

### Testing Philosophy
- **Test-Driven Development (TDD)**: Write tests before implementation
- **Behavior-Driven Development (BDD)**: Focus on user behavior and requirements
- **Continuous Testing**: Automated testing in CI/CD pipeline
- **Quality First**: No code deployment without adequate test coverage
- **Risk-Based Testing**: Prioritize testing based on business risk

### Testing Objectives
- **Functional Correctness**: Ensure all features work as expected
- **Performance**: Meet response time and throughput requirements
- **Security**: Protect against vulnerabilities and attacks
- **Reliability**: Ensure system stability and availability
- **Usability**: Provide excellent user experience
- **Compatibility**: Work across different devices and browsers

### Testing Metrics
- **Code Coverage**: Minimum 80% for critical paths
- **Test Execution Time**: Complete test suite under 15 minutes
- **Bug Detection Rate**: Catch 95% of bugs before production
- **Test Reliability**: Less than 5% flaky tests
- **Performance Benchmarks**: Response times within SLA

---

## 🏗️ Testing Pyramid

### Testing Strategy Distribution
```
                    /\
                   /  \
                  / E2E \    10% - End-to-End Tests
                 /______\
                /        \
               /Integration\  20% - Integration Tests
              /____________\
             /              \
            /   Unit Tests   \  70% - Unit Tests
           /__________________\
```

### Test Types by Layer

#### Unit Tests (70%)
- **Purpose**: Test individual functions and components
- **Scope**: Single function, class, or component
- **Speed**: Very fast (< 1ms per test)
- **Isolation**: Mock all dependencies
- **Coverage**: All business logic and edge cases

#### Integration Tests (20%)
- **Purpose**: Test interaction between components
- **Scope**: Multiple components working together
- **Speed**: Fast (< 100ms per test)
- **Dependencies**: Real databases, external services mocked
- **Coverage**: API endpoints, database operations

#### End-to-End Tests (10%)
- **Purpose**: Test complete user workflows
- **Scope**: Full application stack
- **Speed**: Slow (< 30s per test)
- **Dependencies**: Real environment, real data
- **Coverage**: Critical user journeys

---

## 🔬 Unit Testing

### Backend Unit Testing

#### Test Framework Setup (Jest)
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js']
};
```

#### User Service Tests
```javascript
// src/services/__tests__/userService.test.js
const UserService = require('../userService');
const UserRepository = require('../../repositories/userRepository');
const EmailService = require('../../services/emailService');

jest.mock('../../repositories/userRepository');
jest.mock('../../services/emailService');

describe('UserService', () => {
  let userService;
  let mockUserRepository;
  let mockEmailService;

  beforeEach(() => {
    mockUserRepository = new UserRepository();
    mockEmailService = new EmailService();
    userService = new UserService(mockUserRepository, mockEmailService);
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };
      
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: 'user_123',
        ...userData,
        createdAt: new Date()
      });
      mockEmailService.sendWelcomeEmail.mockResolvedValue(true);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toMatchObject({
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw error if user already exists', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };
      
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'existing_user',
        email: 'existing@example.com'
      });

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects
        .toThrow('User already exists');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };
      
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects
        .toThrow('Database connection failed');
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user with valid credentials', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user_123',
        email: 'test@example.com',
        password: hashedPassword
      });

      // Act
      const result = await userService.authenticateUser(credentials);

      // Assert
      expect(result).toMatchObject({
        id: 'user_123',
        email: 'test@example.com'
      });
      expect(result.password).toBeUndefined();
    });

    it('should throw error for invalid credentials', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user_123',
        email: 'test@example.com',
        password: hashedPassword
      });

      // Act & Assert
      await expect(userService.authenticateUser(credentials))
        .rejects
        .toThrow('Invalid credentials');
    });
  });
});
```

### Frontend Unit Testing

#### React Component Tests
```javascript
// src/components/__tests__/BookingForm.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingForm from '../BookingForm';
import { BookingService } from '../../services/bookingService';

jest.mock('../../services/bookingService');

describe('BookingForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render booking form with all fields', () => {
    render(
      <BookingForm
        libraryId="lib_123"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/select date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book seat/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    
    BookingService.createBooking.mockResolvedValue({
      bookingId: 'booking_123',
      status: 'confirmed'
    });

    render(
      <BookingForm
        libraryId="lib_123"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill form
    await user.type(screen.getByLabelText(/select date/i), '2024-01-15');
    await user.selectOptions(screen.getByLabelText(/start time/i), '09:00');
    await user.selectOptions(screen.getByLabelText(/end time/i), '17:00');

    // Submit form
    await user.click(screen.getByRole('button', { name: /book seat/i }));

    await waitFor(() => {
      expect(BookingService.createBooking).toHaveBeenCalledWith({
        libraryId: 'lib_123',
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '17:00'
      });
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      bookingId: 'booking_123',
      status: 'confirmed'
    });
  });

  it('should show validation errors for invalid data', async () => {
    const user = userEvent.setup();

    render(
      <BookingForm
        libraryId="lib_123"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Submit form without filling required fields
    await user.click(screen.getByRole('button', { name: /book seat/i }));

    await waitFor(() => {
      expect(screen.getByText(/date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/start time is required/i)).toBeInTheDocument();
      expect(screen.getByText(/end time is required/i)).toBeInTheDocument();
    });

    expect(BookingService.createBooking).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();
    
    BookingService.createBooking.mockRejectedValue(
      new Error('Seat not available')
    );

    render(
      <BookingForm
        libraryId="lib_123"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill and submit form
    await user.type(screen.getByLabelText(/select date/i), '2024-01-15');
    await user.selectOptions(screen.getByLabelText(/start time/i), '09:00');
    await user.selectOptions(screen.getByLabelText(/end time/i), '17:00');
    await user.click(screen.getByRole('button', { name: /book seat/i }));

    await waitFor(() => {
      expect(screen.getByText(/seat not available/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
```

### Mobile Unit Testing

#### React Native Component Tests
```javascript
// src/components/__tests__/SeatMap.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SeatMap from '../SeatMap';

describe('SeatMap', () => {
  const mockSeats = [
    { id: 'seat_1', number: 'A1', isAvailable: true, zone: 'quiet' },
    { id: 'seat_2', number: 'A2', isAvailable: false, zone: 'quiet' },
    { id: 'seat_3', number: 'B1', isAvailable: true, zone: 'group' }
  ];

  const mockOnSeatSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all seats correctly', () => {
    const { getByTestId } = render(
      <SeatMap
        seats={mockSeats}
        onSeatSelect={mockOnSeatSelect}
        selectedSeatId={null}
      />
    );

    expect(getByTestId('seat-A1')).toBeTruthy();
    expect(getByTestId('seat-A2')).toBeTruthy();
    expect(getByTestId('seat-B1')).toBeTruthy();
  });

  it('should call onSeatSelect when available seat is tapped', () => {
    const { getByTestId } = render(
      <SeatMap
        seats={mockSeats}
        onSeatSelect={mockOnSeatSelect}
        selectedSeatId={null}
      />
    );

    fireEvent.press(getByTestId('seat-A1'));

    expect(mockOnSeatSelect).toHaveBeenCalledWith('seat_1');
  });

  it('should not call onSeatSelect when unavailable seat is tapped', () => {
    const { getByTestId } = render(
      <SeatMap
        seats={mockSeats}
        onSeatSelect={mockOnSeatSelect}
        selectedSeatId={null}
      />
    );

    fireEvent.press(getByTestId('seat-A2'));

    expect(mockOnSeatSelect).not.toHaveBeenCalled();
  });

  it('should highlight selected seat', () => {
    const { getByTestId } = render(
      <SeatMap
        seats={mockSeats}
        onSeatSelect={mockOnSeatSelect}
        selectedSeatId="seat_1"
      />
    );

    const selectedSeat = getByTestId('seat-A1');
    expect(selectedSeat.props.style.backgroundColor).toBe('#4CAF50');
  });
});
```

---

## 🔗 Integration Testing

### API Integration Tests

#### API Test Suite (Supertest)
```javascript
// tests/integration/api.test.js
const request = require('supertest');
const app = require('../../src/app');
const { setupTestDatabase, cleanupTestDatabase } = require('../helpers/database');
const { createTestUser, createTestLibrary } = require('../helpers/factory');

describe('API Integration Tests', () => {
  let testUser;
  let testLibrary;
  let authToken;

  beforeAll(async () => {
    await setupTestDatabase();
    testUser = await createTestUser();
    testLibrary = await createTestLibrary();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Login and get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'password123'
      });
    
    authToken = response.body.data.tokens.accessToken;
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking successfully', async () => {
      const bookingData = {
        libraryId: testLibrary.id,
        seatId: 'seat_123',
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '17:00'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookingId).toBeDefined();
      expect(response.body.data.status).toBe('confirmed');
    });

    it('should return 400 for invalid booking data', async () => {
      const invalidBookingData = {
        libraryId: 'invalid_id',
        date: 'invalid_date'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidBookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0].code).toBe('VALIDATION_ERROR');
    });

    it('should return 401 for unauthenticated request', async () => {
      const bookingData = {
        libraryId: testLibrary.id,
        seatId: 'seat_123',
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '17:00'
      };

      await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(401);
    });
  });

  describe('GET /api/libraries', () => {
    it('should return list of libraries with pagination', async () => {
      const response = await request(app)
        .get('/api/libraries')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta.pagination).toBeDefined();
      expect(response.body.meta.pagination.page).toBe(1);
      expect(response.body.meta.pagination.limit).toBe(10);
    });

    it('should filter libraries by city', async () => {
      const response = await request(app)
        .get('/api/libraries')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ city: 'Mumbai' })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(library => {
        expect(library.address).toContain('Mumbai');
      });
    });
  });

  describe('Database Integration', () => {
    it('should handle database transactions correctly', async () => {
      const bookingData = {
        libraryId: testLibrary.id,
        seatId: 'seat_123',
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '17:00'
      };

      // Create booking
      const bookingResponse = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201);

      const bookingId = bookingResponse.body.data.bookingId;

      // Verify booking exists in database
      const dbBooking = await Booking.findById(bookingId);
      expect(dbBooking).toBeTruthy();
      expect(dbBooking.userId).toBe(testUser.id);
      expect(dbBooking.libraryId).toBe(testLibrary.id);
    });
  });
});
```

### Database Integration Tests

#### Database Test Helpers
```javascript
// tests/helpers/database.js
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const testDbConfig = {
  host: process.env.TEST_DB_HOST || 'localhost',
  port: process.env.TEST_DB_PORT || 5432,
  database: process.env.TEST_DB_NAME || 'studyspot_test',
  user: process.env.TEST_DB_USER || 'postgres',
  password: process.env.TEST_DB_PASSWORD || 'password'
};

let pool;

async function setupTestDatabase() {
  pool = new Pool(testDbConfig);
  
  // Create test database if it doesn't exist
  await pool.query('CREATE DATABASE studyspot_test');
  
  // Run migrations
  await runMigrations();
  
  // Seed test data
  await seedTestData();
}

async function cleanupTestDatabase() {
  if (pool) {
    // Clean up test data
    await pool.query('TRUNCATE TABLE bookings, users, libraries CASCADE');
    await pool.end();
  }
}

async function runMigrations() {
  const migrationFiles = fs.readdirSync('./migrations')
    .filter(file => file.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const migrationSQL = fs.readFileSync(`./migrations/${file}`, 'utf8');
    await pool.query(migrationSQL);
  }
}

async function seedTestData() {
  // Seed test users
  await pool.query(`
    INSERT INTO users (id, email, first_name, last_name, role, status)
    VALUES 
      ('test_user_1', 'test1@example.com', 'Test', 'User1', 'student', 'active'),
      ('test_user_2', 'test2@example.com', 'Test', 'User2', 'student', 'active')
  `);

  // Seed test libraries
  await pool.query(`
    INSERT INTO libraries (id, name, address, capacity, status)
    VALUES 
      ('test_lib_1', 'Test Library 1', 'Mumbai, India', 50, 'active'),
      ('test_lib_2', 'Test Library 2', 'Delhi, India', 30, 'active')
  `);
}

module.exports = {
  setupTestDatabase,
  cleanupTestDatabase,
  getPool: () => pool
};
```

---

## 🎭 End-to-End Testing

### Web Application E2E Tests

#### Cypress Test Suite
```javascript
// cypress/e2e/booking-flow.cy.js
describe('Booking Flow', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test@example.com', 'password123');
  });

  it('should complete full booking flow', () => {
    // Navigate to libraries page
    cy.visit('/libraries');
    
    // Search for libraries
    cy.get('[data-testid="search-input"]').type('Mumbai');
    cy.get('[data-testid="search-button"]').click();
    
    // Select a library
    cy.get('[data-testid="library-card"]').first().click();
    
    // Check seat availability
    cy.get('[data-testid="date-picker"]').click();
    cy.get('[data-testid="date-2024-01-15"]').click();
    
    // Select seat
    cy.get('[data-testid="seat-A1"]').click();
    cy.get('[data-testid="book-seat-button"]').click();
    
    // Fill booking form
    cy.get('[data-testid="start-time"]').select('09:00');
    cy.get('[data-testid="end-time"]').select('17:00');
    cy.get('[data-testid="confirm-booking"]').click();
    
    // Proceed to payment
    cy.get('[data-testid="payment-method"]').select('online');
    cy.get('[data-testid="proceed-payment"]').click();
    
    // Complete payment (mock)
    cy.get('[data-testid="payment-success"]').should('be.visible');
    
    // Verify booking confirmation
    cy.get('[data-testid="booking-confirmation"]').should('contain', 'Booking Confirmed');
    cy.get('[data-testid="booking-id"]').should('be.visible');
  });

  it('should handle booking errors gracefully', () => {
    // Navigate to libraries page
    cy.visit('/libraries');
    
    // Select a library
    cy.get('[data-testid="library-card"]').first().click();
    
    // Try to book unavailable seat
    cy.get('[data-testid="seat-A2"]').click(); // Unavailable seat
    cy.get('[data-testid="book-seat-button"]').click();
    
    // Should show error message
    cy.get('[data-testid="error-message"]').should('contain', 'Seat not available');
  });

  it('should allow booking cancellation', () => {
    // Navigate to bookings page
    cy.visit('/bookings');
    
    // Find an existing booking
    cy.get('[data-testid="booking-item"]').first().click();
    
    // Cancel booking
    cy.get('[data-testid="cancel-booking"]').click();
    cy.get('[data-testid="confirm-cancel"]').click();
    
    // Verify cancellation
    cy.get('[data-testid="cancellation-success"]').should('be.visible');
  });
});
```

#### Cypress Configuration
```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // Custom commands
      on('task', {
        'db:seed': () => {
          return seedTestDatabase();
        },
        'db:clean': () => {
          return cleanTestDatabase();
        }
      });
    },
    env: {
      apiUrl: 'http://localhost:3001/api',
      testUser: {
        email: 'test@example.com',
        password: 'password123'
      }
    }
  }
});
```

### Mobile E2E Tests

#### Detox Test Suite
```javascript
// e2e/bookingFlow.e2e.js
describe('Booking Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete booking flow on mobile', async () => {
    // Login
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Wait for home screen
    await expect(element(by.id('home-screen'))).toBeVisible();

    // Navigate to libraries
    await element(by.id('libraries-tab')).tap();
    await expect(element(by.id('libraries-screen'))).toBeVisible();

    // Search for libraries
    await element(by.id('search-input')).typeText('Mumbai');
    await element(by.id('search-button')).tap();

    // Select library
    await element(by.id('library-card-0')).tap();
    await expect(element(by.id('library-details'))).toBeVisible();

    // Select date
    await element(by.id('date-picker')).tap();
    await element(by.id('date-2024-01-15')).tap();

    // Select seat
    await element(by.id('seat-A1')).tap();
    await element(by.id('book-seat-button')).tap();

    // Fill booking form
    await element(by.id('start-time-picker')).tap();
    await element(by.id('time-09-00')).tap();
    
    await element(by.id('end-time-picker')).tap();
    await element(by.id('time-17-00')).tap();

    await element(by.id('confirm-booking')).tap();

    // Proceed to payment
    await element(by.id('payment-method-online')).tap();
    await element(by.id('proceed-payment')).tap();

    // Complete payment
    await element(by.id('payment-success')).tap();

    // Verify booking confirmation
    await expect(element(by.id('booking-confirmation'))).toBeVisible();
    await expect(element(by.id('booking-id'))).toBeVisible();
  });

  it('should handle QR code scanning', async () => {
    // Navigate to check-in
    await element(by.id('check-in-tab')).tap();
    
    // Open QR scanner
    await element(by.id('scan-qr-button')).tap();
    
    // Mock QR code scan
    await element(by.id('qr-scanner')).tap();
    
    // Verify check-in success
    await expect(element(by.id('check-in-success'))).toBeVisible();
  });
});
```

---

## ⚡ Performance Testing

### Load Testing with Artillery

#### Artillery Configuration
```yaml
# artillery/load-test.yml
config:
  target: 'https://api.studyspot.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up load"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load"
    - duration: 60
      arrivalRate: 200
      name: "Peak load"
  defaults:
    headers:
      Content-Type: 'application/json'
  plugins:
    metrics-by-endpoint: {}
  ensure:
    p95: 1000
    p99: 2000
    maxErrorRate: 1

scenarios:
  - name: "User Authentication Flow"
    weight: 30
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.data.tokens.accessToken"
              as: "authToken"
      - get:
          url: "/api/users/profile"
          headers:
            Authorization: "Bearer {{ authToken }}"
      - get:
          url: "/api/libraries"
          headers:
            Authorization: "Bearer {{ authToken }}"

  - name: "Booking Flow"
    weight: 40
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.data.tokens.accessToken"
              as: "authToken"
      - get:
          url: "/api/bookings/availability"
          headers:
            Authorization: "Bearer {{ authToken }}"
          qs:
            libraryId: "lib_123"
            date: "2024-01-15"
      - post:
          url: "/api/bookings"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            libraryId: "lib_123"
            seatId: "seat_456"
            date: "2024-01-15"
            startTime: "09:00"
            endTime: "17:00"

  - name: "Library Search"
    weight: 30
    flow:
      - get:
          url: "/api/libraries"
          qs:
            search: "Mumbai"
            page: 1
            limit: 20
```

#### Performance Test Script
```bash
#!/bin/bash
# scripts/performance-test.sh

echo "Starting performance tests..."

# Run load test
artillery run artillery/load-test.yml --output performance-report.json

# Generate HTML report
artillery report performance-report.json --output performance-report.html

# Check performance thresholds
artillery run artillery/load-test.yml --config artillery/thresholds.yml

echo "Performance tests completed. Check performance-report.html for results."
```

### Stress Testing

#### Stress Test Configuration
```yaml
# artillery/stress-test.yml
config:
  target: 'https://api.studyspot.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 100
      name: "Ramp up"
    - duration: 300
      arrivalRate: 500
      name: "High load"
    - duration: 180
      arrivalRate: 1000
      name: "Stress test"
    - duration: 60
      arrivalRate: 2000
      name: "Peak stress"
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "High Volume Booking"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.data.tokens.accessToken"
              as: "authToken"
      - loop:
          - post:
              url: "/api/bookings"
              headers:
                Authorization: "Bearer {{ authToken }}"
              json:
                libraryId: "lib_123"
                seatId: "seat_{{ $randomInt(1, 100) }}"
                date: "2024-01-15"
                startTime: "09:00"
                endTime: "17:00"
        count: 5
```

---

## 🔒 Security Testing

### Security Test Suite

#### OWASP ZAP Integration
```javascript
// tests/security/security.test.js
const zaproxy = require('zaproxy');

describe('Security Tests', () => {
  let zap;

  beforeAll(async () => {
    zap = new zaproxy('http://localhost:8080');
    await zap.spider.scan('https://api.studyspot.com');
    await zap.activeScan.scan('https://api.studyspot.com');
  });

  afterAll(async () => {
    await zap.core.shutdown();
  });

  it('should not have SQL injection vulnerabilities', async () => {
    const alerts = await zap.core.alerts();
    const sqlInjectionAlerts = alerts.filter(alert => 
      alert.risk === 'High' && alert.name.includes('SQL Injection')
    );
    
    expect(sqlInjectionAlerts).toHaveLength(0);
  });

  it('should not have XSS vulnerabilities', async () => {
    const alerts = await zap.core.alerts();
    const xssAlerts = alerts.filter(alert => 
      alert.risk === 'High' && alert.name.includes('Cross Site Scripting')
    );
    
    expect(xssAlerts).toHaveLength(0);
  });

  it('should have proper authentication', async () => {
    const alerts = await zap.core.alerts();
    const authAlerts = alerts.filter(alert => 
      alert.name.includes('Authentication') && alert.risk === 'Medium'
    );
    
    expect(authAlerts).toHaveLength(0);
  });
});
```

#### Authentication Security Tests
```javascript
// tests/security/auth.test.js
describe('Authentication Security', () => {
  it('should require authentication for protected endpoints', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .expect(401);

    expect(response.body.errors[0].code).toBe('AUTHENTICATION_ERROR');
  });

  it('should reject invalid JWT tokens', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer invalid_token')
      .expect(401);

    expect(response.body.errors[0].code).toBe('AUTHENTICATION_ERROR');
  });

  it('should rate limit authentication attempts', async () => {
    const promises = Array(10).fill().map(() =>
      request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
    );

    const responses = await Promise.all(promises);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });

  it('should hash passwords securely', async () => {
    const userData = {
      email: 'security@example.com',
      password: 'password123',
      firstName: 'Security',
      lastName: 'Test'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    // Verify password is hashed in database
    const user = await User.findByEmail('security@example.com');
    expect(user.password).not.toBe('password123');
    expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
  });
});
```

---

## 📱 Mobile Testing

### Mobile Test Automation

#### Appium Configuration
```javascript
// tests/mobile/appium.config.js
const { Builder, By, until } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');

const config = {
  android: {
    platformName: 'Android',
    deviceName: 'Android Emulator',
    app: './android/app/build/outputs/apk/debug/app-debug.apk',
    automationName: 'UiAutomator2'
  },
  ios: {
    platformName: 'iOS',
    deviceName: 'iPhone 14',
    app: './ios/build/Build/Products/Debug-iphonesimulator/StudySpot.app',
    automationName: 'XCUITest'
  }
};

module.exports = config;
```

#### Mobile Test Suite
```javascript
// tests/mobile/booking.test.js
const { Builder, By, until } = require('selenium-webdriver');
const config = require('./appium.config');

describe('Mobile Booking Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new Options().addArguments('--headless'))
      .build();
  });

  afterAll(async () => {
    await driver.quit();
  });

  it('should complete booking flow on mobile', async () => {
    // Navigate to app
    await driver.get('http://localhost:3000');

    // Login
    await driver.findElement(By.id('email-input')).sendKeys('test@example.com');
    await driver.findElement(By.id('password-input')).sendKeys('password123');
    await driver.findElement(By.id('login-button')).click();

    // Wait for home screen
    await driver.wait(until.elementLocated(By.id('home-screen')), 10000);

    // Navigate to libraries
    await driver.findElement(By.id('libraries-tab')).click();

    // Search for libraries
    await driver.findElement(By.id('search-input')).sendKeys('Mumbai');
    await driver.findElement(By.id('search-button')).click();

    // Select library
    await driver.findElement(By.id('library-card-0')).click();

    // Select seat and book
    await driver.findElement(By.id('seat-A1')).click();
    await driver.findElement(By.id('book-seat-button')).click();

    // Verify booking success
    await driver.wait(until.elementLocated(By.id('booking-confirmation')), 10000);
    const confirmationText = await driver.findElement(By.id('booking-confirmation')).getText();
    expect(confirmationText).toContain('Booking Confirmed');
  });
});
```

---

## 🤖 Test Automation

### CI/CD Integration

#### GitHub Actions Test Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: studyspot_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run database migrations
        run: npm run migrate:test
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/studyspot_test
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/studyspot_test
          REDIS_URL: redis://localhost:6379

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start application
        run: |
          npm run build
          npm start &
          sleep 30
        env:
          NODE_ENV: test
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/studyspot_test
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: cypress-results
          path: cypress/results

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run performance tests
        run: npm run test:performance
      
      - name: Upload performance report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: performance-report.html

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run security audit
        run: npm audit --audit-level=high
      
      - name: Run security tests
        run: npm run test:security
```

### Test Data Management

#### Test Data Factory
```javascript
// tests/helpers/factory.js
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

class TestDataFactory {
  static async createUser(overrides = {}) {
    const defaultUser = {
      id: uuidv4(),
      email: `test-${uuidv4()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      status: 'active',
      tenantId: 'default-tenant'
    };

    const user = { ...defaultUser, ...overrides };
    
    const query = `
      INSERT INTO users (id, email, first_name, last_name, password, role, status, tenant_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      user.id, user.email, user.firstName, user.lastName,
      user.password, user.role, user.status, user.tenantId
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async createLibrary(overrides = {}) {
    const defaultLibrary = {
      id: uuidv4(),
      name: `Test Library ${uuidv4()}`,
      address: 'Test Address, Mumbai, India',
      latitude: 19.0760,
      longitude: 72.8777,
      capacity: 50,
      amenities: ['wifi', 'ac'],
      pricing: {
        hourly: 50,
        daily: 300,
        monthly: 5000
      },
      status: 'active',
      tenantId: 'default-tenant'
    };

    const library = { ...defaultLibrary, ...overrides };
    
    const query = `
      INSERT INTO libraries (id, name, address, latitude, longitude, capacity, amenities, pricing, status, tenant_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      library.id, library.name, library.address, library.latitude,
      library.longitude, library.capacity, JSON.stringify(library.amenities),
      JSON.stringify(library.pricing), library.status, library.tenantId
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async createBooking(overrides = {}) {
    const defaultBooking = {
      id: uuidv4(),
      userId: 'test_user_1',
      libraryId: 'test_lib_1',
      seatId: 'seat_123',
      date: '2024-01-15',
      startTime: '09:00',
      endTime: '17:00',
      status: 'confirmed',
      paymentStatus: 'completed'
    };

    const booking = { ...defaultBooking, ...overrides };
    
    const query = `
      INSERT INTO bookings (id, user_id, library_id, seat_id, date, start_time, end_time, status, payment_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      booking.id, booking.userId, booking.libraryId, booking.seatId,
      booking.date, booking.startTime, booking.endTime, booking.status, booking.paymentStatus
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = TestDataFactory;
```

---

## 🚦 Quality Gates

### Quality Metrics

#### Code Coverage Requirements
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/test/**',
    '!src/migrations/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/controllers/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};
```

#### Performance Benchmarks
```yaml
# performance-thresholds.yml
config:
  target: 'https://api.studyspot.com'
  ensure:
    p95: 500    # 95th percentile response time < 500ms
    p99: 1000   # 99th percentile response time < 1000ms
    maxErrorRate: 0.1  # Error rate < 0.1%
    maxRPS: 1000       # Max requests per second > 1000
```

### Quality Gates in CI/CD

#### Pre-deployment Checks
```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates

on:
  pull_request:
    branches: [main]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests with coverage
        run: npm run test:unit -- --coverage
      
      - name: Check coverage threshold
        run: npm run test:coverage:check
      
      - name: Run security audit
        run: npm audit --audit-level=high
      
      - name: Run performance tests
        run: npm run test:performance
      
      - name: Quality gate check
        run: |
          if [ $? -ne 0 ]; then
            echo "Quality gates failed. Deployment blocked."
            exit 1
          fi
          echo "All quality gates passed. Ready for deployment."
```

---

**Document Version**: 1.0.0  
**Last Updated**: [Current Date]  
**Next Review**: [Next Review Date]  
**Testing Framework Version**: v1.0







































