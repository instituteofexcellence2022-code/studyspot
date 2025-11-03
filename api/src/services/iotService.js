const { query } = require('../config/database');
const { logger } = require('../utils/logger');

class IoTService {
  constructor() {
    // In production, this would connect to MQTT broker
    this.mqttClient = null;
    this.deviceStates = new Map(); // In-memory device states
    this.automationEngine = new Map(); // Active automation rules
  }

  // Initialize IoT service
  async initialize() {
    // In production: Connect to MQTT broker (AWS IoT Core, Azure IoT Hub, etc.)
    logger.info('IoT Service initialized');
  }

  // Register a new IoT device
  async registerDevice(libraryId, deviceData) {
    try {
      const { deviceName, deviceType, deviceId, location, configuration = {} } = deviceData;

      const result = await query(`
        INSERT INTO iot_devices (
          library_id, device_name, device_type, device_id, 
          location, status, is_online, configuration
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        libraryId,
        deviceName,
        deviceType,
        deviceId,
        location,
        'active',
        false,
        JSON.stringify(configuration)
      ]);

      const device = result.rows[0];

      logger.info('IoT device registered', {
        libraryId: libraryId,
        deviceId: device.id,
        deviceType: deviceType
      });

      return { success: true, data: device };
    } catch (error) {
      logger.error('Failed to register IoT device', error);
      return { success: false, error: error.message };
    }
  }

  // Get all devices for a library
  async getLibraryDevices(libraryId, options = {}) {
    try {
      const { deviceType, status } = options;

      let whereClause = 'WHERE library_id = $1';
      const queryParams = [libraryId];
      let paramCount = 1;

      if (deviceType) {
        whereClause += ` AND device_type = $${++paramCount}`;
        queryParams.push(deviceType);
      }

      if (status) {
        whereClause += ` AND status = $${++paramCount}`;
        queryParams.push(status);
      }

      const devicesQuery = `
        SELECT 
          id, device_name, device_type, device_id, location,
          status, is_online, last_heartbeat, configuration,
          created_at, updated_at
        FROM iot_devices
        ${whereClause}
        ORDER BY device_type, device_name
      `;

      const result = await query(devicesQuery, queryParams);

      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Failed to get library devices', error);
      return { success: false, error: error.message };
    }
  }

  // Update device status
  async updateDeviceStatus(deviceId, statusData) {
    try {
      const { isOnline, state, metadata = {} } = statusData;

      const result = await query(`
        UPDATE iot_devices 
        SET 
          is_online = $1,
          last_heartbeat = NOW(),
          configuration = jsonb_set(
            COALESCE(configuration, '{}'::jsonb),
            '{state}',
            $2::jsonb
          ),
          updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `, [isOnline, JSON.stringify(state), deviceId]);

      if (result.rows.length === 0) {
        return { success: false, error: 'Device not found' };
      }

      const device = result.rows[0];

      // Update in-memory state
      this.deviceStates.set(deviceId, {
        isOnline: isOnline,
        state: state,
        lastUpdate: new Date()
      });

      // Record telemetry if state includes metrics
      if (state && typeof state === 'object') {
        await this.recordTelemetry(deviceId, state);
      }

      return { success: true, data: device };
    } catch (error) {
      logger.error('Failed to update device status', error);
      return { success: false, error: error.message };
    }
  }

  // Control device (turn on/off, adjust settings)
  async controlDevice(deviceId, command) {
    try {
      const { action, parameters = {} } = command;

      // Get device info
      const deviceResult = await query(`
        SELECT id, device_type, device_id, library_id, is_online
        FROM iot_devices
        WHERE id = $1
      `, [deviceId]);

      if (deviceResult.rows.length === 0) {
        return { success: false, error: 'Device not found' };
      }

      const device = deviceResult.rows[0];

      if (!device.is_online) {
        return { success: false, error: 'Device is offline' };
      }

      // In production: Send MQTT command to device
      const commandPayload = {
        deviceId: device.device_id,
        action: action,
        parameters: parameters,
        timestamp: new Date().toISOString()
      };

      logger.info('Device control command sent', {
        deviceId: deviceId,
        action: action
      });

      // Simulate command execution and update state
      const newState = await this.executeDeviceCommand(device, action, parameters);

      // Update device configuration with new state
      await this.updateDeviceStatus(deviceId, {
        isOnline: true,
        state: newState
      });

      return {
        success: true,
        data: {
          deviceId: deviceId,
          action: action,
          state: newState,
          message: 'Command executed successfully'
        }
      };
    } catch (error) {
      logger.error('Failed to control device', error);
      return { success: false, error: error.message };
    }
  }

  // Execute device command (simulate for different device types)
  async executeDeviceCommand(device, action, parameters) {
    const state = {};

    switch (device.device_type) {
      case 'light':
        if (action === 'turn_on') {
          state.power = 'on';
          state.brightness = parameters.brightness || 100;
        } else if (action === 'turn_off') {
          state.power = 'off';
          state.brightness = 0;
        } else if (action === 'set_brightness') {
          state.power = 'on';
          state.brightness = parameters.brightness;
        }
        break;

      case 'ac':
        if (action === 'turn_on') {
          state.power = 'on';
          state.temperature = parameters.temperature || 24;
          state.mode = parameters.mode || 'cool';
        } else if (action === 'turn_off') {
          state.power = 'off';
        } else if (action === 'set_temperature') {
          state.power = 'on';
          state.temperature = parameters.temperature;
        }
        break;

      case 'lock':
        if (action === 'lock') {
          state.locked = true;
        } else if (action === 'unlock') {
          state.locked = false;
        }
        break;

      case 'sensor':
        // Sensors are read-only, no control commands
        state.reading_only = true;
        break;

      default:
        state.action_executed = action;
    }

    return state;
  }

  // Record device telemetry
  async recordTelemetry(deviceId, metrics) {
    try {
      const telemetryPromises = [];

      // Record each metric
      for (const [metricType, metricValue] of Object.entries(metrics)) {
        if (typeof metricValue === 'number') {
          telemetryPromises.push(
            query(`
              INSERT INTO device_telemetry (
                device_id, metric_type, metric_value, unit, recorded_at
              )
              VALUES ($1, $2, $3, $4, NOW())
            `, [deviceId, metricType, metricValue, this.getMetricUnit(metricType)])
          );
        }
      }

      await Promise.all(telemetryPromises);

      return { success: true };
    } catch (error) {
      logger.error('Failed to record telemetry', error);
      return { success: false, error: error.message };
    }
  }

  // Get metric unit
  getMetricUnit(metricType) {
    const units = {
      temperature: '°C',
      humidity: '%',
      energy: 'kWh',
      brightness: '%',
      occupancy: 'count',
      co2: 'ppm',
      noise: 'dB'
    };

    return units[metricType] || 'unit';
  }

  // Get device telemetry history
  async getDeviceTelemetry(deviceId, options = {}) {
    try {
      const { metricType, dateFrom, dateTo, limit = 100 } = options;

      let whereClause = 'WHERE device_id = $1';
      const queryParams = [deviceId];
      let paramCount = 1;

      if (metricType) {
        whereClause += ` AND metric_type = $${++paramCount}`;
        queryParams.push(metricType);
      }

      if (dateFrom) {
        whereClause += ` AND recorded_at >= $${++paramCount}`;
        queryParams.push(dateFrom);
      }

      if (dateTo) {
        whereClause += ` AND recorded_at <= $${++paramCount}`;
        queryParams.push(dateTo);
      }

      const telemetryQuery = `
        SELECT 
          metric_type, metric_value, unit, recorded_at
        FROM device_telemetry
        ${whereClause}
        ORDER BY recorded_at DESC
        LIMIT $${++paramCount}
      `;

      queryParams.push(limit);

      const result = await query(telemetryQuery, queryParams);

      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Failed to get device telemetry', error);
      return { success: false, error: error.message };
    }
  }

  // Create automation rule
  async createAutomationRule(libraryId, ruleData) {
    try {
      const { name, description, triggerType, triggerConditions, actions, createdBy } = ruleData;

      const result = await query(`
        INSERT INTO automation_rules (
          library_id, name, description, trigger_type,
          trigger_conditions, actions, is_active, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        libraryId,
        name,
        description,
        triggerType,
        JSON.stringify(triggerConditions),
        JSON.stringify(actions),
        true,
        createdBy
      ]);

      const rule = result.rows[0];

      // Activate rule in automation engine
      this.activateAutomationRule(rule);

      logger.info('Automation rule created', {
        libraryId: libraryId,
        ruleId: rule.id,
        triggerType: triggerType
      });

      return { success: true, data: rule };
    } catch (error) {
      logger.error('Failed to create automation rule', error);
      return { success: false, error: error.message };
    }
  }

  // Activate automation rule
  activateAutomationRule(rule) {
    this.automationEngine.set(rule.id, {
      ...rule,
      lastTriggered: null
    });

    // In production: Set up actual triggers (cron jobs, event listeners, etc.)
    logger.info('Automation rule activated', { ruleId: rule.id });
  }

  // Get automation rules for library
  async getAutomationRules(libraryId) {
    try {
      const result = await query(`
        SELECT * FROM automation_rules
        WHERE library_id = $1
        ORDER BY created_at DESC
      `, [libraryId]);

      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Failed to get automation rules', error);
      return { success: false, error: error.message };
    }
  }

  // Record energy consumption
  async recordEnergyConsumption(libraryId, consumptionData) {
    try {
      const { deviceId = null, consumptionKwh, costAmount, currency = 'INR', readingDate, readingTime, metadata = {} } = consumptionData;

      const result = await query(`
        INSERT INTO energy_consumption (
          library_id, device_id, consumption_kwh, cost_amount,
          currency, reading_date, reading_time, metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        libraryId,
        deviceId,
        consumptionKwh,
        costAmount,
        currency,
        readingDate,
        readingTime,
        JSON.stringify(metadata)
      ]);

      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to record energy consumption', error);
      return { success: false, error: error.message };
    }
  }

  // Get energy consumption statistics
  async getEnergyStatistics(libraryId, period = '30days') {
    try {
      let dateFilter = "reading_date >= CURRENT_DATE - INTERVAL '30 days'";

      if (period === '7days') {
        dateFilter = "reading_date >= CURRENT_DATE - INTERVAL '7 days'";
      } else if (period === '90days') {
        dateFilter = "reading_date >= CURRENT_DATE - INTERVAL '90 days'";
      }

      // Overall statistics
      const statsResult = await query(`
        SELECT 
          SUM(consumption_kwh) as total_consumption,
          AVG(consumption_kwh) as avg_daily_consumption,
          SUM(cost_amount) as total_cost,
          MAX(consumption_kwh) as peak_consumption,
          MIN(consumption_kwh) as min_consumption
        FROM energy_consumption
        WHERE library_id = $1 AND ${dateFilter}
      `, [libraryId]);

      // Daily breakdown
      const dailyResult = await query(`
        SELECT 
          reading_date,
          SUM(consumption_kwh) as daily_consumption,
          SUM(cost_amount) as daily_cost
        FROM energy_consumption
        WHERE library_id = $1 AND ${dateFilter}
        GROUP BY reading_date
        ORDER BY reading_date DESC
      `, [libraryId]);

      // Device breakdown
      const deviceResult = await query(`
        SELECT 
          d.device_name,
          d.device_type,
          SUM(ec.consumption_kwh) as device_consumption,
          SUM(ec.cost_amount) as device_cost
        FROM energy_consumption ec
        JOIN iot_devices d ON ec.device_id = d.id
        WHERE ec.library_id = $1 AND ${dateFilter}
        GROUP BY d.id, d.device_name, d.device_type
        ORDER BY device_consumption DESC
      `, [libraryId]);

      const stats = statsResult.rows[0];

      return {
        success: true,
        data: {
          summary: {
            totalConsumption: parseFloat(stats.total_consumption) || 0,
            avgDailyConsumption: parseFloat(stats.avg_daily_consumption) || 0,
            totalCost: parseFloat(stats.total_cost) || 0,
            peakConsumption: parseFloat(stats.peak_consumption) || 0,
            minConsumption: parseFloat(stats.min_consumption) || 0
          },
          daily: dailyResult.rows.map(row => ({
            date: row.reading_date,
            consumption: parseFloat(row.daily_consumption) || 0,
            cost: parseFloat(row.daily_cost) || 0
          })),
          byDevice: deviceResult.rows.map(row => ({
            deviceName: row.device_name,
            deviceType: row.device_type,
            consumption: parseFloat(row.device_consumption) || 0,
            cost: parseFloat(row.device_cost) || 0
          }))
        }
      };
    } catch (error) {
      logger.error('Failed to get energy statistics', error);
      return { success: false, error: error.message };
    }
  }

  // Get library dashboard summary
  async getLibraryDashboard(libraryId) {
    try {
      // Get device count by type and status
      const devicesResult = await query(`
        SELECT 
          device_type,
          COUNT(*) as total,
          COUNT(CASE WHEN is_online THEN 1 END) as online,
          COUNT(CASE WHEN NOT is_online THEN 1 END) as offline
        FROM iot_devices
        WHERE library_id = $1 AND status = 'active'
        GROUP BY device_type
      `, [libraryId]);

      // Get today's energy consumption
      const energyResult = await query(`
        SELECT 
          SUM(consumption_kwh) as today_consumption,
          SUM(cost_amount) as today_cost
        FROM energy_consumption
        WHERE library_id = $1 AND reading_date = CURRENT_DATE
      `, [libraryId]);

      // Get active automation rules
      const rulesResult = await query(`
        SELECT COUNT(*) as active_rules
        FROM automation_rules
        WHERE library_id = $1 AND is_active = true
      `, [libraryId]);

      const energy = energyResult.rows[0];
      const rules = rulesResult.rows[0];

      return {
        success: true,
        data: {
          devices: devicesResult.rows.map(row => ({
            type: row.device_type,
            total: parseInt(row.total),
            online: parseInt(row.online),
            offline: parseInt(row.offline)
          })),
          energy: {
            todayConsumption: parseFloat(energy.today_consumption) || 0,
            todayCost: parseFloat(energy.today_cost) || 0
          },
          automation: {
            activeRules: parseInt(rules.active_rules)
          }
        }
      };
    } catch (error) {
      logger.error('Failed to get library dashboard', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new IoTService();
