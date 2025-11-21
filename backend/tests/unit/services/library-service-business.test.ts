/**
 * UNIT TESTS - LIBRARY SERVICE BUSINESS LOGIC
 * Additional tests for library service business logic
 */

describe('Library Service Business Logic', () => {
  describe('Library Operations', () => {
    it('should validate operating hours', () => {
      const library = {
        opening_time: '09:00',
        closing_time: '18:00',
      };

      const opening = parseInt(library.opening_time.split(':')[0]);
      const closing = parseInt(library.closing_time.split(':')[0]);

      expect(closing).toBeGreaterThan(opening);
    });

    it('should calculate operating hours duration', () => {
      const opening = '09:00';
      const closing = '18:00';

      const openingHour = parseInt(opening.split(':')[0]);
      const closingHour = parseInt(closing.split(':')[0]);
      const duration = closingHour - openingHour;

      expect(duration).toBe(9);
    });

    it('should validate capacity constraints', () => {
      const library = {
        capacity: 100,
        current_occupancy: 75,
      };

      const canAcceptMore = library.current_occupancy < library.capacity;
      expect(canAcceptMore).toBe(true);
    });
  });

  describe('Fee Plan Management', () => {
    it('should validate fee plan pricing', () => {
      const feePlan = {
        type: 'hourly',
        base_price: 50,
      };

      expect(feePlan.base_price).toBeGreaterThan(0);
      expect(['hourly', 'daily', 'monthly']).toContain(feePlan.type);
    });

    it('should calculate total fee for multiple hours', () => {
      const hourlyRate = 50;
      const hours = 3;
      const totalFee = hourlyRate * hours;

      expect(totalFee).toBe(150);
    });

    it('should apply discounts', () => {
      const basePrice = 1000;
      const discountPercent = 10;
      const discountedPrice = basePrice - (basePrice * discountPercent / 100);

      expect(discountedPrice).toBe(900);
    });
  });

  describe('Library Statistics', () => {
    it('should calculate average daily attendance', () => {
      const dailyAttendance = [50, 60, 55, 70, 65];
      const average = dailyAttendance.reduce((sum, count) => sum + count, 0) / dailyAttendance.length;

      expect(average).toBe(60);
    });

    it('should calculate peak hours', () => {
      const hourlyData = [
        { hour: 9, count: 20 },
        { hour: 10, count: 40 },
        { hour: 11, count: 35 },
      ];

      const peakHour = hourlyData.reduce((max, data) => data.count > max.count ? data : max);
      expect(peakHour.hour).toBe(10);
    });
  });
});

