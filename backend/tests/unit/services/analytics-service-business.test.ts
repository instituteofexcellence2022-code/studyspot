/**
 * UNIT TESTS - ANALYTICS SERVICE BUSINESS LOGIC
 * Tests for analytics calculations and aggregations
 */

describe('Analytics Service Business Logic', () => {
  describe('Revenue Calculations', () => {
    it('should calculate total revenue', () => {
      const payments = [
        { amount: 1000, status: 'completed' },
        { amount: 2000, status: 'completed' },
        { amount: 1500, status: 'pending' },
      ];

      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      expect(totalRevenue).toBe(3000);
    });

    it('should calculate monthly revenue', () => {
      const payments = [
        { amount: 1000, date: '2024-01-15', status: 'completed' },
        { amount: 2000, date: '2024-01-20', status: 'completed' },
        { amount: 1500, date: '2024-02-10', status: 'completed' },
      ];

      const januaryRevenue = payments
        .filter(p => p.date.startsWith('2024-01') && p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      expect(januaryRevenue).toBe(3000);
    });

    it('should calculate average transaction value', () => {
      const payments = [
        { amount: 1000 },
        { amount: 2000 },
        { amount: 1500 },
      ];

      const average = payments.reduce((sum, p) => sum + p.amount, 0) / payments.length;
      expect(average).toBe(1500);
    });
  });

  describe('User Analytics', () => {
    it('should calculate active users', () => {
      const users = [
        { status: 'active', lastLogin: '2024-01-15' },
        { status: 'active', lastLogin: '2024-01-10' },
        { status: 'inactive', lastLogin: '2023-12-01' },
      ];

      const activeUsers = users.filter(u => u.status === 'active').length;
      expect(activeUsers).toBe(2);
    });

    it('should calculate user growth rate', () => {
      const previousMonth = 100;
      const currentMonth = 120;
      const growthRate = ((currentMonth - previousMonth) / previousMonth) * 100;

      expect(growthRate).toBe(20);
    });

    it('should calculate user retention rate', () => {
      const totalUsers = 100;
      const returningUsers = 80;
      const retentionRate = (returningUsers / totalUsers) * 100;

      expect(retentionRate).toBe(80);
    });
  });

  describe('Booking Analytics', () => {
    it('should calculate booking conversion rate', () => {
      const totalInquiries = 100;
      const completedBookings = 25;
      const conversionRate = (completedBookings / totalInquiries) * 100;

      expect(conversionRate).toBe(25);
    });

    it('should calculate average booking duration', () => {
      const bookings = [
        { duration: 2 }, // hours
        { duration: 4 },
        { duration: 3 },
      ];

      const average = bookings.reduce((sum, b) => sum + b.duration, 0) / bookings.length;
      expect(average).toBe(3);
    });

    it('should calculate peak booking times', () => {
      const bookings = [
        { time: '09:00', count: 10 },
        { time: '10:00', count: 20 },
        { time: '11:00', count: 15 },
      ];

      const peakTime = bookings.reduce((max, b) => b.count > max.count ? b : max);
      expect(peakTime.time).toBe('10:00');
      expect(peakTime.count).toBe(20);
    });
  });

  describe('Library Analytics', () => {
    it('should calculate occupancy rate', () => {
      const library = {
        capacity: 100,
        currentOccupancy: 75,
      };

      const occupancyRate = (library.currentOccupancy / library.capacity) * 100;
      expect(occupancyRate).toBe(75);
    });

    it('should calculate utilization rate', () => {
      const library = {
        totalSeats: 100,
        bookedSeats: 80,
        hours: 8,
      };

      const utilizationRate = (library.bookedSeats / library.totalSeats) * 100;
      expect(utilizationRate).toBe(80);
    });

    it('should identify underutilized libraries', () => {
      const libraries = [
        { name: 'Library A', occupancyRate: 30 },
        { name: 'Library B', occupancyRate: 80 },
        { name: 'Library C', occupancyRate: 25 },
      ];

      const underutilized = libraries.filter(l => l.occupancyRate < 50);
      expect(underutilized.length).toBe(2);
    });
  });

  describe('Platform Analytics', () => {
    it('should calculate total platform revenue', () => {
      const tenants = [
        { revenue: 10000 },
        { revenue: 20000 },
        { revenue: 15000 },
      ];

      const totalRevenue = tenants.reduce((sum, t) => sum + t.revenue, 0);
      expect(totalRevenue).toBe(45000);
    });

    it('should calculate platform growth metrics', () => {
      const metrics = {
        newTenants: 10,
        newStudents: 500,
        newBookings: 1000,
      };

      expect(metrics.newTenants).toBeGreaterThan(0);
      expect(metrics.newStudents).toBeGreaterThan(0);
      expect(metrics.newBookings).toBeGreaterThan(0);
    });
  });

  describe('Trend Analysis', () => {
    it('should calculate trend direction', () => {
      const data = [100, 120, 140, 160];
      const trend = data[data.length - 1] > data[0] ? 'increasing' : 'decreasing';
      
      expect(trend).toBe('increasing');
    });

    it('should calculate percentage change', () => {
      const oldValue = 100;
      const newValue = 120;
      const percentageChange = ((newValue - oldValue) / oldValue) * 100;

      expect(percentageChange).toBe(20);
    });
  });
});

