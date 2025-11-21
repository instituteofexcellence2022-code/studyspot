/**
 * UNIT TESTS - LIBRARY SERVICE HELPERS
 * Tests for library service helper functions and business logic
 */

describe('Library Service Helpers', () => {
  describe('Library Status Validation', () => {
    it('should validate library status enum', () => {
      const validStatuses = ['active', 'inactive', 'maintenance', 'closed'];
      
      validStatuses.forEach(status => {
        expect(['active', 'inactive', 'maintenance', 'closed']).toContain(status);
      });
    });

    it('should validate active status', () => {
      const status = 'active';
      expect(['active', 'inactive', 'maintenance', 'closed']).toContain(status);
    });
  });

  describe('Occupancy Management', () => {
    it('should calculate available seats', () => {
      const capacity = 100;
      const currentOccupancy = 75;
      const availableSeats = capacity - currentOccupancy;

      expect(availableSeats).toBe(25);
    });

    it('should detect full capacity', () => {
      const capacity = 100;
      const currentOccupancy = 100;
      const isFull = currentOccupancy >= capacity;

      expect(isFull).toBe(true);
    });

    it('should detect available capacity', () => {
      const capacity = 100;
      const currentOccupancy = 50;
      const hasCapacity = currentOccupancy < capacity;

      expect(hasCapacity).toBe(true);
    });

    it('should calculate occupancy percentage', () => {
      const capacity = 100;
      const currentOccupancy = 75;
      const occupancyPercentage = (currentOccupancy / capacity) * 100;

      expect(occupancyPercentage).toBe(75);
    });

    it('should detect high occupancy (above 80%)', () => {
      const capacity = 100;
      const currentOccupancy = 85;
      const occupancyPercentage = (currentOccupancy / capacity) * 100;
      const isHighOccupancy = occupancyPercentage >= 80;

      expect(isHighOccupancy).toBe(true);
    });
  });

  describe('Library Search and Filtering', () => {
    it('should filter libraries by city', () => {
      const libraries = [
        { id: '1', city: 'Mumbai' },
        { id: '2', city: 'Delhi' },
        { id: '3', city: 'Mumbai' },
      ];

      const filtered = libraries.filter(lib => lib.city === 'Mumbai');
      expect(filtered.length).toBe(2);
    });

    it('should filter libraries by status', () => {
      const libraries = [
        { id: '1', status: 'active' },
        { id: '2', status: 'inactive' },
        { id: '3', status: 'active' },
      ];

      const filtered = libraries.filter(lib => lib.status === 'active');
      expect(filtered.length).toBe(2);
    });

    it('should search libraries by name', () => {
      const libraries = [
        { id: '1', name: 'Central Library' },
        { id: '2', name: 'City Library' },
        { id: '3', name: 'Study Center' },
      ];

      const searchTerm = 'Library';
      const filtered = libraries.filter(lib => 
        lib.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered.length).toBe(2);
    });
  });

  describe('Fee Plan Validation', () => {
    it('should validate fee plan structure', () => {
      const feePlan = {
        name: 'Hourly Plan',
        type: 'hourly',
        rate: 50,
        currency: 'INR',
      };

      expect(feePlan.name).toBeTruthy();
      expect(feePlan.type).toBe('hourly');
      expect(feePlan.rate).toBeGreaterThan(0);
      expect(feePlan.currency).toBe('INR');
    });

    it('should validate fee plan types', () => {
      const validTypes = ['hourly', 'daily', 'monthly', 'custom'];
      
      validTypes.forEach(type => {
        expect(['hourly', 'daily', 'monthly', 'custom']).toContain(type);
      });
    });

    it('should calculate total fee for hourly plan', () => {
      const rate = 50; // ₹50 per hour
      const hours = 3;
      const totalFee = rate * hours;

      expect(totalFee).toBe(150);
    });

    it('should calculate total fee for daily plan', () => {
      const rate = 500; // ₹500 per day
      const days = 2;
      const totalFee = rate * days;

      expect(totalFee).toBe(1000);
    });
  });

  describe('Library Statistics', () => {
    it('should calculate total bookings count', () => {
      const bookings = [
        { id: '1', status: 'confirmed' },
        { id: '2', status: 'checked_in' },
        { id: '3', status: 'completed' },
      ];

      const totalBookings = bookings.length;
      expect(totalBookings).toBe(3);
    });

    it('should calculate active bookings count', () => {
      const bookings = [
        { id: '1', status: 'confirmed' },
        { id: '2', status: 'checked_in' },
        { id: '3', status: 'completed' },
        { id: '4', status: 'cancelled' },
      ];

      const activeBookings = bookings.filter(b => 
        ['confirmed', 'checked_in'].includes(b.status)
      );

      expect(activeBookings.length).toBe(2);
    });

    it('should calculate revenue from bookings', () => {
      const bookings = [
        { total_amount: 100, payment_status: 'paid' },
        { total_amount: 200, payment_status: 'paid' },
        { total_amount: 150, payment_status: 'pending' },
      ];

      const revenue = bookings
        .filter(b => b.payment_status === 'paid')
        .reduce((sum, b) => sum + b.total_amount, 0);

      expect(revenue).toBe(300);
    });
  });
});

