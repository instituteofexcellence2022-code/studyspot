const express = require('express');
const router = express.Router();

// Mock database - replace with actual DB queries
let seats = [];
let zones = [];
let layouts = [];

/**
 * @swagger
 * /api/seat-management/layouts:
 *   get:
 *     summary: Get all seat layouts
 *     tags: [Seat Management]
 *     responses:
 *       200:
 *         description: List of all layouts
 */
router.get('/layouts', async (req, res) => {
  try {
    res.json({
      success: true,
      data: layouts,
      total: layouts.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/seat-management/layouts:
 *   post:
 *     summary: Create or update a seat layout
 *     tags: [Seat Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               libraryId:
 *                 type: string
 *               config:
 *                 type: object
 *               seats:
 *                 type: array
 *     responses:
 *       201:
 *         description: Layout created successfully
 */
router.post('/layouts', async (req, res) => {
  try {
    const { name, libraryId, config, seats: layoutSeats } = req.body;

    const newLayout = {
      id: `layout-${Date.now()}`,
      name,
      libraryId,
      config,
      seats: layoutSeats,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    layouts.push(newLayout);

    res.status(201).json({
      success: true,
      message: 'Layout saved successfully',
      data: newLayout,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/seat-management/layouts/{id}:
 *   get:
 *     summary: Get layout by ID
 *     tags: [Seat Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Layout details
 */
router.get('/layouts/:id', async (req, res) => {
  try {
    const layout = layouts.find((l) => l.id === req.params.id);
    
    if (!layout) {
      return res.status(404).json({ success: false, error: 'Layout not found' });
    }

    res.json({ success: true, data: layout });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/seat-management/zones:
 *   get:
 *     summary: Get all zones
 *     tags: [Seat Management]
 *     responses:
 *       200:
 *         description: List of all zones
 */
router.get('/zones', async (req, res) => {
  try {
    res.json({
      success: true,
      data: zones,
      total: zones.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/seat-management/zones:
 *   post:
 *     summary: Create a new zone
 *     tags: [Seat Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [ac, non-ac, quiet, group, premium, vip]
 *               capacity:
 *                 type: number
 *               color:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               priceMultiplier:
 *                 type: number
 *     responses:
 *       201:
 *         description: Zone created successfully
 */
router.post('/zones', async (req, res) => {
  try {
    const { name, type, capacity, color, features, priceMultiplier, shiftTimings } = req.body;

    const newZone = {
      id: `zone-${Date.now()}`,
      name,
      type,
      capacity,
      currentOccupancy: 0,
      color,
      features: features || [],
      priceMultiplier: priceMultiplier || 1.0,
      isActive: true,
      shiftTimings: shiftTimings || {
        morning: true,
        afternoon: true,
        evening: true,
        night: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    zones.push(newZone);

    res.status(201).json({
      success: true,
      message: 'Zone created successfully',
      data: newZone,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/seat-management/zones/{id}:
 *   put:
 *     summary: Update a zone
 *     tags: [Seat Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Zone updated successfully
 */
router.put('/zones/:id', async (req, res) => {
  try {
    const zoneIndex = zones.findIndex((z) => z.id === req.params.id);

    if (zoneIndex === -1) {
      return res.status(404).json({ success: false, error: 'Zone not found' });
    }

    zones[zoneIndex] = {
      ...zones[zoneIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: 'Zone updated successfully',
      data: zones[zoneIndex],
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/seat-management/zones/{id}:
 *   delete:
 *     summary: Delete a zone
 *     tags: [Seat Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Zone deleted successfully
 */
router.delete('/zones/:id', async (req, res) => {
  try {
    const zoneIndex = zones.findIndex((z) => z.id === req.params.id);

    if (zoneIndex === -1) {
      return res.status(404).json({ success: false, error: 'Zone not found' });
    }

    zones.splice(zoneIndex, 1);

    res.json({
      success: true,
      message: 'Zone deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/seat-management/seats:
 *   get:
 *     summary: Get all seats
 *     tags: [Seat Management]
 *     responses:
 *       200:
 *         description: List of all seats
 */
router.get('/seats', async (req, res) => {
  try {
    res.json({
      success: true,
      data: seats,
      total: seats.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/seat-management/seats/bulk:
 *   post:
 *     summary: Create multiple seats
 *     tags: [Seat Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seats:
 *                 type: array
 *     responses:
 *       201:
 *         description: Seats created successfully
 */
router.post('/seats/bulk', async (req, res) => {
  try {
    const { seats: newSeats } = req.body;

    const createdSeats = newSeats.map((seat) => ({
      ...seat,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    seats.push(...createdSeats);

    res.status(201).json({
      success: true,
      message: `${createdSeats.length} seats created successfully`,
      data: createdSeats,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/seat-management/capacity/stats:
 *   get:
 *     summary: Get capacity statistics
 *     tags: [Seat Management]
 *     responses:
 *       200:
 *         description: Capacity statistics
 */
router.get('/capacity/stats', async (req, res) => {
  try {
    const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
    const totalOccupancy = zones.reduce((sum, z) => sum + z.currentOccupancy, 0);
    const utilizationRate = totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalZones: zones.length,
        totalCapacity,
        totalOccupancy,
        available: totalCapacity - totalOccupancy,
        utilizationRate: utilizationRate.toFixed(1),
        zoneBreakdown: zones.map((z) => ({
          zone: z.name,
          capacity: z.capacity,
          occupied: z.currentOccupancy,
          utilization: ((z.currentOccupancy / z.capacity) * 100).toFixed(1),
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/seat-management/rules:
 *   get:
 *     summary: Get all booking rules
 *     tags: [Seat Management]
 *     responses:
 *       200:
 *         description: List of all booking rules
 */
router.get('/rules', async (req, res) => {
  try {
    // Mock rules - replace with DB query
    const rules = [
      {
        id: '1',
        name: 'Advance Booking Window',
        category: 'timing',
        description: 'How far in advance students can book seats',
        isActive: true,
        config: { maxDays: 30, minHours: 2 },
      },
      {
        id: '2',
        name: 'Cancellation Policy',
        category: 'cancellation',
        description: 'Refund rules for cancellations',
        isActive: true,
        config: {
          before24Hours: 100,
          before12Hours: 75,
          before6Hours: 50,
          before2Hours: 25,
          after: 0,
        },
      },
    ];

    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;















