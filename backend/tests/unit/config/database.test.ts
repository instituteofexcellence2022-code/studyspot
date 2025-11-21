/**
 * UNIT TESTS - DATABASE CONFIGURATION
 */

import { Pool } from 'pg';
import { coreDb, tenantDbManager } from '../../../src/config/database';

// Mock pg
jest.mock('pg', () => ({
  Pool: jest.fn(),
}));

describe('Database Configuration', () => {
  describe('coreDb', () => {
    it('should be defined', () => {
      expect(coreDb).toBeDefined();
    });

    it('should be a Pool instance', () => {
      expect(coreDb).toBeInstanceOf(Pool);
    });
  });

  describe('tenantDbManager', () => {
    it('should be defined', () => {
      expect(tenantDbManager).toBeDefined();
    });

    it('should have getTenantConnection method', () => {
      expect(tenantDbManager.getTenantConnection).toBeDefined();
      expect(typeof tenantDbManager.getTenantConnection).toBe('function');
    });

    it('should get tenant connection', async () => {
      const mockPool = {
        query: jest.fn(),
      };
      (Pool as jest.MockedClass<typeof Pool>).mockImplementation(() => mockPool as any);

      const connection = await tenantDbManager.getTenantConnection('tenant-123');
      
      expect(connection).toBeDefined();
    });

    it('should handle connection errors gracefully', async () => {
      (Pool as jest.MockedClass<typeof Pool>).mockImplementation(() => {
        throw new Error('Connection failed');
      });

      await expect(tenantDbManager.getTenantConnection('tenant-123')).rejects.toThrow();
    });
  });
});
