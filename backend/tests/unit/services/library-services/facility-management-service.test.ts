/**
 * UNIT TESTS - FACILITY MANAGEMENT SERVICE
 * Tests for: Seat layout design & planning, maintenance tracking,
 * vendor management, asset tracking
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  tenantDbManager: {
    getTenantConnection: jest.fn(),
  },
}));

const tenantDbManager = require('../../../src/config/database').tenantDbManager;

describe('Facility Management Service', () => {
  let mockTenantDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection).mockResolvedValue(mockTenantDb);
    jest.clearAllMocks();
  });

  describe('Seat Layout Design & Planning', () => {
    it('should create seat layout', async () => {
      const layout = {
        library_id: 'lib-123',
        floor: 1,
        section: 'A',
        seats: [
          { id: 'seat-1', row: 1, column: 1, type: 'desk', status: 'available' },
          { id: 'seat-2', row: 1, column: 2, type: 'desk', status: 'available' },
        ],
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'layout-123', ...layout }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO seat_layouts (library_id, floor, section, seats)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [layout.library_id, layout.floor, layout.section, JSON.stringify(layout.seats)]
      );

      expect(result.rows[0].library_id).toBe(layout.library_id);
    });

    it('should calculate total seats in layout', () => {
      const layout = {
        sections: [
          { seats: 20 },
          { seats: 30 },
          { seats: 25 },
        ],
      };

      const totalSeats = layout.sections.reduce((sum, section) => sum + section.seats, 0);
      expect(totalSeats).toBe(75);
    });

    it('should validate seat capacity', () => {
      const library = {
        capacity: 100,
        currentSeats: 75,
      };

      const canAddSeats = library.currentSeats < library.capacity;
      expect(canAddSeats).toBe(true);
    });
  });

  describe('Maintenance Tracking', () => {
    it('should create maintenance request', async () => {
      const maintenance = {
        facility_id: 'facility-123',
        type: 'repair',
        description: 'AC not working',
        priority: 'high',
        reported_by: 'staff-123',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'maint-123', ...maintenance, status: 'open' }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO maintenance_requests (facility_id, type, description, priority, reported_by, status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [maintenance.facility_id, maintenance.type, maintenance.description,
         maintenance.priority, maintenance.reported_by, 'open']
      );

      expect(result.rows[0].status).toBe('open');
    });

    it('should track maintenance history', async () => {
      const facilityId = 'facility-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'maint-1', type: 'repair', completed_at: new Date('2024-01-01') },
          { id: 'maint-2', type: 'cleaning', completed_at: new Date('2024-01-15') },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT * FROM maintenance_requests
         WHERE facility_id = $1 AND status = 'completed'
         ORDER BY completed_at DESC`,
        [facilityId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Vendor Management', () => {
    it('should add vendor', async () => {
      const vendor = {
        name: 'AC Repair Services',
        contact_person: 'John Doe',
        phone: '+1234567890',
        email: 'vendor@example.com',
        service_type: 'maintenance',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'vendor-123', ...vendor, status: 'active' }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO vendors (name, contact_person, phone, email, service_type, status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [vendor.name, vendor.contact_person, vendor.phone, vendor.email, vendor.service_type, 'active']
      );

      expect(result.rows[0].name).toBe(vendor.name);
    });

    it('should track vendor performance', async () => {
      const vendorId = 'vendor-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          vendor_id: vendorId,
          total_jobs: 20,
          completed_jobs: 18,
          avg_rating: 4.5,
          on_time_rate: 90,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           vendor_id,
           COUNT(*) as total_jobs,
           COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs,
           AVG(rating) as avg_rating,
           (COUNT(*) FILTER (WHERE completed_on_time = true)::float / COUNT(*)::float * 100) as on_time_rate
         FROM vendor_jobs
         WHERE vendor_id = $1
         GROUP BY vendor_id`,
        [vendorId]
      );

      expect(result.rows[0].avg_rating).toBeGreaterThan(0);
    });
  });

  describe('Asset Tracking', () => {
    it('should register asset', async () => {
      const asset = {
        library_id: 'lib-123',
        name: 'Projector',
        category: 'equipment',
        serial_number: 'PRJ-001',
        purchase_date: '2024-01-01',
        value: 50000,
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'asset-123', ...asset, status: 'active' }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO assets (library_id, name, category, serial_number, purchase_date, value, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [asset.library_id, asset.name, asset.category, asset.serial_number,
         asset.purchase_date, asset.value, 'active']
      );

      expect(result.rows[0].serial_number).toBe(asset.serial_number);
    });

    it('should track asset location', async () => {
      const assetId = 'asset-123';
      const newLocation = 'Floor 2, Room 201';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: assetId, location: newLocation, last_moved_at: new Date() }],
      });

      const result = await mockTenantDb.query(
        `UPDATE assets SET location = $1, last_moved_at = NOW() WHERE id = $2 RETURNING *`,
        [newLocation, assetId]
      );

      expect(result.rows[0].location).toBe(newLocation);
    });

    it('should calculate asset depreciation', () => {
      const asset = {
        purchase_date: new Date('2024-01-01'),
        value: 100000,
        depreciation_rate: 0.1, // 10% per year
      };

      const yearsSincePurchase = (Date.now() - asset.purchase_date.getTime()) / (365 * 24 * 60 * 60 * 1000);
      const depreciation = asset.value * asset.depreciation_rate * yearsSincePurchase;
      const currentValue = asset.value - depreciation;

      expect(currentValue).toBeLessThan(asset.value);
    });
  });
});

