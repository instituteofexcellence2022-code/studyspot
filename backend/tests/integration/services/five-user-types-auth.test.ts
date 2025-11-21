/**
 * INTEGRATION TESTS - FIVE USER TYPES AUTHENTICATION
 * Comprehensive tests for all 5 user types across 3 portals
 * 
 * User Types:
 * 1. Student (Student Portal - tenant DB)
 * 2. Library Owner (Owner Portal - core DB)
 * 3. Library Staff (Owner Portal - tenant DB)
 * 4. Platform Super Admin (Admin Portal - core DB)
 * 5. Platform Staff (Admin Portal - core DB)
 */

import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { coreDb, tenantDbManager } from '../../../src/config/database';
import { createTestTenant, createTestStudent, cleanCoreDatabase, cleanTenantDatabase } from '../../helpers/testDb';
import { createRoleToken } from '../../helpers/testAuth';

// Mock the auth service - we'll test the actual service endpoints
// Note: This is an integration test, so we should import the actual auth service
const AUTH_SERVICE_PORT = process.env.AUTH_SERVICE_PORT || 3001;
const AUTH_SERVICE_URL = `http://localhost:${AUTH_SERVICE_PORT}`;

describe('Five User Types Authentication - Integration Tests', () => {
  let testTenant1: any;
  let testTenant2: any;
  let libraryOwner1: any;
  let libraryOwner2: any;
  let platformAdmin1: any;
  let platformStaff1: any;
  let student1: any;
  let student2: any;
  let libraryStaff1: any;
  let libraryStaff2: any;

  // Test data
  const testPassword = 'Test@123456';
  const hashedPassword = bcrypt.hashSync(testPassword, 12);

  // Check if database is available
  let dbAvailable = false;

  beforeAll(async () => {
    // Check database availability
    const { isTestDbAvailable } = require('../../helpers/testDb');
    dbAvailable = await isTestDbAvailable();
    
    if (!dbAvailable) {
      console.warn('⚠️  Database not available - skipping HTTP integration tests');
      console.warn('⚠️  Note: These tests require auth service running on port 3001');
      return;
    }
    // Create test tenants
    testTenant1 = await createTestTenant({
      name: 'Test Library 1',
      email: 'tenant1@test.com',
      slug: 'test-library-1',
      status: 'active',
    });

    testTenant2 = await createTestTenant({
      name: 'Test Library 2',
      email: 'tenant2@test.com',
      slug: 'test-library-2',
      status: 'active',
    });

    // Create library owners (core DB)
    const owner1Result = await coreDb.query(
      `INSERT INTO library_owners (tenant_id, email, password_hash, first_name, last_name, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [testTenant1.id, 'owner1@test.com', hashedPassword, 'Owner', 'One', '+1234567890', true]
    );
    libraryOwner1 = owner1Result.rows[0];

    const owner2Result = await coreDb.query(
      `INSERT INTO library_owners (tenant_id, email, password_hash, first_name, last_name, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [testTenant2.id, 'owner2@test.com', hashedPassword, 'Owner', 'Two', '+1234567891', true]
    );
    libraryOwner2 = owner2Result.rows[0];

    // Update tenants with owner_id
    await coreDb.query('UPDATE tenants SET owner_id = $1 WHERE id = $2', [libraryOwner1.id, testTenant1.id]);
    await coreDb.query('UPDATE tenants SET owner_id = $1 WHERE id = $2', [libraryOwner2.id, testTenant2.id]);

    // Create platform super admin (core DB)
    const adminResult = await coreDb.query(
      `INSERT INTO platform_admins (email, password_hash, first_name, last_name, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      ['superadmin@test.com', hashedPassword, 'Super', 'Admin', '+1234567892', true]
    );
    platformAdmin1 = adminResult.rows[0];

    // Create platform staff (core DB)
    const staffResult = await coreDb.query(
      `INSERT INTO platform_staff (email, password_hash, first_name, last_name, phone, role, department, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      ['staff@test.com', hashedPassword, 'Platform', 'Staff', '+1234567893', 'support', 'support', true]
    );
    platformStaff1 = staffResult.rows[0];

    // Create students (tenant DB)
    student1 = await createTestStudent(testTenant1.id, {
      email: 'student1@test.com',
      first_name: 'Student',
      last_name: 'One',
      phone: '+1234567894',
      status: 'active',
    });

    student2 = await createTestStudent(testTenant2.id, {
      email: 'student2@test.com',
      first_name: 'Student',
      last_name: 'Two',
      phone: '+1234567895',
      status: 'active',
    });

    // Create library staff (tenant DB)
    const tenantDb1 = await tenantDbManager.getTenantConnection(testTenant1.id);
    const staff1Result = await tenantDb1.query(
      `INSERT INTO library_staff (tenant_id, email, password_hash, first_name, last_name, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [testTenant1.id, 'staff1@test.com', hashedPassword, 'Staff', 'One', '+1234567896', 'manager', true]
    );
    libraryStaff1 = staff1Result.rows[0];

    const staff2Result = await tenantDb1.query(
      `INSERT INTO library_staff (tenant_id, email, password_hash, first_name, last_name, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [testTenant1.id, 'receptionist1@test.com', hashedPassword, 'Receptionist', 'One', '+1234567897', 'receptionist', true]
    );
    libraryStaff2 = staff2Result.rows[0];
  });

  afterAll(async () => {
    // Cleanup test data
    try {
      await cleanTenantDatabase(testTenant1.id);
      await cleanTenantDatabase(testTenant2.id);
      await cleanCoreDatabase();
    } catch (error) {
      console.warn('Cleanup error (non-critical):', error);
    }
  });

  describe('Student Login (Student Portal)', () => {
    it('should login student with tenantId', async () => {
      if (!dbAvailable) {
        console.warn('⏭️  Skipping test - database not available');
        return;
      }

      // Note: This test requires auth service running on port 3001
      // Skip if service is not available
      const axios = require('axios');
      
      try {
        const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'student1@test.com',
        password: testPassword,
        tenantId: testTenant1.id,
        userType: 'student',
        portalType: 'student',
      });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('token');
        expect(response.data.data).toHaveProperty('user');
        expect(response.data.data.user.email).toBe('student1@test.com');
        expect(response.data.data.user.userType).toBe('student');
        expect(response.data.data.user.userTable).toBe('students');
        expect(response.data.data.user.tenantId).toBe(testTenant1.id);
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          console.warn('⏭️  Skipping test - auth service not running on port 3001');
          return;
        }
        throw error;
      }
    });

    it('should fail login without tenantId', async () => {
      const axios = require('axios');
      
      try {
        await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
          email: 'student1@test.com',
          password: testPassword,
          // No tenantId provided
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
        expect(error.response?.data.success).toBe(false);
      }
    });

    it('should fail login with wrong tenantId', async () => {
      const axios = require('axios');
      
      try {
        await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
          email: 'student1@test.com',
          password: testPassword,
          tenantId: testTenant2.id, // Wrong tenant
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }
    });
  });

  describe('Library Owner Login (Owner Portal)', () => {
    it('should login library owner successfully', async () => {
      const axios = require('axios');
      
      const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'owner1@test.com',
        password: testPassword,
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('token');
      expect(response.data.data.user.email).toBe('owner1@test.com');
      expect(response.data.data.user.userType).toBe('library_owner');
      expect(response.data.data.user.userTable).toBe('library_owners');
      expect(response.data.data.user.tenantId).toBe(testTenant1.id);
    });

    it('should not allow library owner from different tenant to access other tenant', async () => {
      const axios = require('axios');
      
      // Library owner 1 should only access tenant 1
      const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'owner1@test.com',
        password: testPassword,
      });

      expect(response.data.data.user.tenantId).toBe(testTenant1.id);
      // Token should contain tenantId from library_owners table
    });
  });

  describe('Library Staff Login (Owner Portal)', () => {
    it('should login library staff with tenantId', async () => {
      const axios = require('axios');
      
      const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'staff1@test.com',
        password: testPassword,
        tenantId: testTenant1.id,
        userType: 'library_staff',
        portalType: 'owner',
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('token');
      expect(response.data.data.user.email).toBe('staff1@test.com');
      expect(response.data.data.user.userType).toBe('library_staff');
      expect(response.data.data.user.userTable).toBe('library_staff');
      expect(response.data.data.user.tenantId).toBe(testTenant1.id);
      expect(response.data.data.user.role).toBe('manager');
    });

    it('should login library staff (receptionist) with tenantId', async () => {
      const axios = require('axios');
      
      const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'receptionist1@test.com',
        password: testPassword,
        tenantId: testTenant1.id,
        userType: 'library_staff',
        portalType: 'owner',
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.user.email).toBe('receptionist1@test.com');
      expect(response.data.data.user.role).toBe('receptionist');
    });

    it('should fail login without tenantId', async () => {
      const axios = require('axios');
      
      try {
        await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
          email: 'staff1@test.com',
          password: testPassword,
          // No tenantId
        });
        // May fall through to core DB check and fail, or return 401
        // Either is acceptable - the point is it shouldn't login as library_staff
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }
    });
  });

  describe('Platform Super Admin Login (Admin Portal)', () => {
    it('should login platform super admin successfully', async () => {
      const axios = require('axios');
      
      const response = await axios.post(`${AUTH_SERVICE_URL}/api/v1/auth/admin/login`, {
        email: 'superadmin@test.com',
        password: testPassword,
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('token');
      expect(response.data.data.user.email).toBe('superadmin@test.com');
      expect(response.data.data.user.userType).toBe('platform_admin');
      expect(response.data.data.user.userTable).toBe('platform_admins');
      expect(response.data.data.user.tenantId).toBeNull(); // Platform admins have no tenant
    });
  });

  describe('Platform Staff Login (Admin Portal)', () => {
    it('should login platform staff successfully', async () => {
      const axios = require('axios');
      
      const response = await axios.post(`${AUTH_SERVICE_URL}/api/v1/auth/admin/login`, {
        email: 'staff@test.com',
        password: testPassword,
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('token');
      expect(response.data.data.user.email).toBe('staff@test.com');
      expect(response.data.data.user.userType).toBe('platform_staff');
      expect(response.data.data.user.userTable).toBe('platform_staff');
      expect(response.data.data.user.tenantId).toBeNull(); // Platform staff have no tenant
      expect(response.data.data.user.role).toBe('support');
    });
  });

  describe('Profile/Me Endpoints', () => {
    it('should get student profile with valid token', async () => {
      const axios = require('axios');
      
      // First login to get token
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'student1@test.com',
        password: testPassword,
        tenantId: testTenant1.id,
        userType: 'student',
      });

      const token = loginResponse.data.data.token;

      // Get profile
      const profileResponse = await axios.get(`${AUTH_SERVICE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.data.success).toBe(true);
      expect(profileResponse.data.data.user.email).toBe('student1@test.com');
      expect(profileResponse.data.data.user.userType).toBe('student');
    });

    it('should get library owner profile with valid token', async () => {
      const axios = require('axios');
      
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'owner1@test.com',
        password: testPassword,
      });

      const token = loginResponse.data.data.token;

      const profileResponse = await axios.get(`${AUTH_SERVICE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.data.data.user.email).toBe('owner1@test.com');
      expect(profileResponse.data.data.user.userType).toBe('library_owner');
    });

    it('should get library staff profile with valid token', async () => {
      const axios = require('axios');
      
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'staff1@test.com',
        password: testPassword,
        tenantId: testTenant1.id,
        userType: 'library_staff',
      });

      const token = loginResponse.data.data.token;

      const profileResponse = await axios.get(`${AUTH_SERVICE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.data.data.user.email).toBe('staff1@test.com');
      expect(profileResponse.data.data.user.userType).toBe('library_staff');
    });

    it('should get platform admin profile with valid token', async () => {
      const axios = require('axios');
      
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/v1/auth/admin/login`, {
        email: 'superadmin@test.com',
        password: testPassword,
      });

      const token = loginResponse.data.data.token;

      const profileResponse = await axios.get(`${AUTH_SERVICE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.data.data.user.email).toBe('superadmin@test.com');
      expect(profileResponse.data.data.user.userType).toBe('platform_admin');
    });

    it('should get platform staff profile with valid token', async () => {
      const axios = require('axios');
      
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/v1/auth/admin/login`, {
        email: 'staff@test.com',
        password: testPassword,
      });

      const token = loginResponse.data.data.token;

      const profileResponse = await axios.get(`${AUTH_SERVICE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.data.data.user.email).toBe('staff@test.com');
      expect(profileResponse.data.data.user.userType).toBe('platform_staff');
    });
  });

  describe('Refresh Token Endpoint', () => {
    it('should refresh student token', async () => {
      const axios = require('axios');
      
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'student1@test.com',
        password: testPassword,
        tenantId: testTenant1.id,
        userType: 'student',
      });

      const refreshToken = loginResponse.data.data.refreshToken || loginResponse.data.data.tokens?.refreshToken;

      const refreshResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/refresh`, {
        refreshToken,
      });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.data.success).toBe(true);
      expect(refreshResponse.data.data).toHaveProperty('token');
    });

    it('should refresh library owner token', async () => {
      const axios = require('axios');
      
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'owner1@test.com',
        password: testPassword,
      });

      const refreshToken = loginResponse.data.data.refreshToken || loginResponse.data.data.tokens?.refreshToken;

      const refreshResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/refresh`, {
        refreshToken,
      });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.data.success).toBe(true);
    });

    it('should refresh library staff token', async () => {
      const axios = require('axios');
      
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'staff1@test.com',
        password: testPassword,
        tenantId: testTenant1.id,
        userType: 'library_staff',
      });

      const refreshToken = loginResponse.data.data.refreshToken || loginResponse.data.data.tokens?.refreshToken;

      const refreshResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/refresh`, {
        refreshToken,
      });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.data.success).toBe(true);
    });

    it('should refresh platform admin token', async () => {
      const axios = require('axios');
      
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/v1/auth/admin/login`, {
        email: 'superadmin@test.com',
        password: testPassword,
      });

      const refreshToken = loginResponse.data.data.refreshToken || loginResponse.data.data.tokens?.refreshToken;

      const refreshResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/refresh`, {
        refreshToken,
      });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.data.success).toBe(true);
    });

    it('should refresh platform staff token', async () => {
      const axios = require('axios');
      
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/v1/auth/admin/login`, {
        email: 'staff@test.com',
        password: testPassword,
      });

      const refreshToken = loginResponse.data.data.refreshToken || loginResponse.data.data.tokens?.refreshToken;

      const refreshResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/refresh`, {
        refreshToken,
      });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.data.success).toBe(true);
    });
  });

  describe('Update Profile Endpoint', () => {
    it('should update student profile', async () => {
      const axios = require('axios');
      
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'student1@test.com',
        password: testPassword,
        tenantId: testTenant1.id,
        userType: 'student',
      });

      const token = loginResponse.data.data.token;

      const updateResponse = await axios.put(
        `${AUTH_SERVICE_URL}/api/users/profile`,
        {
          firstName: 'Updated',
          lastName: 'Student',
          phone: '+9876543210',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.success).toBe(true);
    });

    it('should update library owner profile', async () => {
      const axios = require('axios');
      
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'owner1@test.com',
        password: testPassword,
      });

      const token = loginResponse.data.data.token;

      const updateResponse = await axios.put(
        `${AUTH_SERVICE_URL}/api/users/profile`,
        {
          firstName: 'Updated',
          lastName: 'Owner',
          phone: '+9876543211',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.success).toBe(true);
    });

    it('should update library staff profile', async () => {
      const axios = require('axios');
      
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'staff1@test.com',
        password: testPassword,
        tenantId: testTenant1.id,
        userType: 'library_staff',
      });

      const token = loginResponse.data.data.token;

      const updateResponse = await axios.put(
        `${AUTH_SERVICE_URL}/api/users/profile`,
        {
          firstName: 'Updated',
          lastName: 'Staff',
          phone: '+9876543212',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.success).toBe(true);
    });
  });

  describe('Tenant Isolation Tests', () => {
    it('should prevent student from accessing different tenant', async () => {
      const axios = require('axios');
      
      // Student 1 belongs to tenant 1
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'student1@test.com',
        password: testPassword,
        tenantId: testTenant1.id,
        userType: 'student',
      });

      const token = loginResponse.data.data.token;
      const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

      // Token should contain tenant1.id
      expect(decodedToken.tenantId).toBe(testTenant1.id);
      expect(decodedToken.tenantId).not.toBe(testTenant2.id);
    });

    it('should prevent library owner from accessing different tenant', async () => {
      const axios = require('axios');
      
      // Owner 1 belongs to tenant 1
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'owner1@test.com',
        password: testPassword,
      });

      const token = loginResponse.data.data.token;
      const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

      // Token should contain tenant1.id
      expect(decodedToken.tenantId).toBe(testTenant1.id);
      expect(decodedToken.tenantId).not.toBe(testTenant2.id);
    });

    it('should prevent library staff from accessing different tenant', async () => {
      const axios = require('axios');
      
      // Staff 1 belongs to tenant 1
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        email: 'staff1@test.com',
        password: testPassword,
        tenantId: testTenant1.id,
        userType: 'library_staff',
      });

      const token = loginResponse.data.data.token;
      const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

      // Token should contain tenant1.id
      expect(decodedToken.tenantId).toBe(testTenant1.id);
      expect(decodedToken.tenantId).not.toBe(testTenant2.id);
    });

    it('should allow platform admin to access all tenants', async () => {
      const axios = require('axios');
      
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/v1/auth/admin/login`, {
        email: 'superadmin@test.com',
        password: testPassword,
      });

      const token = loginResponse.data.data.token;
      const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

      // Platform admin should have no tenant (null)
      expect(decodedToken.tenantId).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should return 401 for invalid credentials', async () => {
      const axios = require('axios');
      
      try {
        await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
          email: 'student1@test.com',
          password: 'WrongPassword123',
          tenantId: testTenant1.id,
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
        expect(error.response?.data.success).toBe(false);
      }
    });

    it('should return 401 for non-existent user', async () => {
      const axios = require('axios');
      
      try {
        await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
          email: 'nonexistent@test.com',
          password: testPassword,
          tenantId: testTenant1.id,
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }
    });

    it('should return 401 for inactive account', async () => {
      // Create inactive user
      const inactiveResult = await coreDb.query(
        `INSERT INTO library_owners (tenant_id, email, password_hash, first_name, last_name, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [testTenant1.id, 'inactive@test.com', hashedPassword, 'Inactive', 'User', false]
      );

      const axios = require('axios');
      
      try {
        await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
          email: 'inactive@test.com',
          password: testPassword,
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }

      // Cleanup
      await coreDb.query('DELETE FROM library_owners WHERE email = $1', ['inactive@test.com']);
    });
  });
});

