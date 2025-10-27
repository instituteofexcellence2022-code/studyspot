import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { PythonShell } from 'python-shell';
import cron from 'node-cron';
import multer from 'multer';
import csv from 'csv-parser';
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';
import _ from 'lodash';
import { evaluate } from 'mathjs';
import { mean, median, mode, standardDeviation, variance } from 'simple-statistics';
import { SimpleLinearRegression } from 'ml-regression-simple-linear';
import { KMeans } from 'ml-kmeans';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'analytics-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Database connection
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgresql://localhost:5432/studyspot_analytics',
  {
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// File upload configuration
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Analytics Models and Interfaces
interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  filters: DashboardFilter[];
  isPublic: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'kpi' | 'gauge' | 'map' | 'text';
  title: string;
  dataSource: string;
  configuration: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
  refreshInterval?: number;
}

interface DashboardLayout {
  columns: number;
  rows: number;
  gridSize: number;
}

interface DashboardFilter {
  id: string;
  name: string;
  type: 'date' | 'select' | 'multiselect' | 'text' | 'number';
  field: string;
  options?: string[];
  defaultValue?: any;
}

interface AnalyticsReport {
  id: string;
  name: string;
  description: string;
  type: 'scheduled' | 'on-demand' | 'real-time';
  query: string;
  parameters: Record<string, any>;
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  schedule?: string;
  lastRun?: Date;
  nextRun?: Date;
  status: 'active' | 'inactive' | 'paused';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AnalyticsMetric {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'operational' | 'financial' | 'user' | 'technical';
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  target?: number;
  threshold?: { min: number; max: number };
  tenantId: string;
  calculatedAt: Date;
}

interface DataVisualization {
  id: string;
  name: string;
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'treemap' | 'sankey';
  data: any[];
  configuration: Record<string, any>;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for demo (replace with database in production)
const dashboards: AnalyticsDashboard[] = [];
const reports: AnalyticsReport[] = [];
const metrics: AnalyticsMetric[] = [];
const visualizations: DataVisualization[] = [];

// Authentication middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Validation middleware
const validateDashboard = [
  body('name').notEmpty().withMessage('Dashboard name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('widgets').isArray().withMessage('Widgets must be an array'),
  body('layout').isObject().withMessage('Layout must be an object')
];

const validateReport = [
  body('name').notEmpty().withMessage('Report name is required'),
  body('type').isIn(['scheduled', 'on-demand', 'real-time']).withMessage('Invalid report type'),
  body('query').notEmpty().withMessage('Query is required'),
  body('format').isIn(['json', 'csv', 'xlsx', 'pdf']).withMessage('Invalid format')
];

// Rate limiting
const rateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(rateLimitConfig);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Analytics Service is healthy',
    timestamp: new Date().toISOString(),
    dashboards: dashboards.length,
    reports: reports.length,
    metrics: metrics.length,
    visualizations: visualizations.length
  });
});

// ============================================
// DASHBOARD MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/analytics/dashboards
 * @desc    Create a new analytics dashboard
 * @access  Private
 */
app.post('/api/analytics/dashboards', authenticateToken, validateDashboard, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const dashboard: AnalyticsDashboard = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description || '',
      widgets: req.body.widgets || [],
      layout: req.body.layout || { columns: 12, rows: 8, gridSize: 1 },
      filters: req.body.filters || [],
      isPublic: req.body.isPublic || false,
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    dashboards.push(dashboard);

    logger.info(`Analytics dashboard created: ${dashboard.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Dashboard created successfully',
      data: { dashboard }
    });
  } catch (error) {
    logger.error('Error creating dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create dashboard'
    });
  }
});

/**
 * @route   GET /api/analytics/dashboards
 * @desc    Get all dashboards for a tenant
 * @access  Private
 */
app.get('/api/analytics/dashboards', authenticateToken, async (req, res) => {
  try {
    const tenantDashboards = dashboards.filter(dashboard => dashboard.tenantId === req.user.tenantId);
    
    res.json({
      success: true,
      data: { dashboards: tenantDashboards },
      count: tenantDashboards.length
    });
  } catch (error) {
    logger.error('Error fetching dashboards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboards'
    });
  }
});

/**
 * @route   GET /api/analytics/dashboards/:id/data
 * @desc    Get dashboard data with real-time updates
 * @access  Private
 */
app.get('/api/analytics/dashboards/:id/data', authenticateToken, async (req, res) => {
  try {
    const dashboard = dashboards.find(
      d => d.id === req.params.id && d.tenantId === req.user.tenantId
    );
    
    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    // Generate real-time data for each widget
    const dashboardData = await generateDashboardData(dashboard);
    
    res.json({
      success: true,
      data: {
        dashboard,
        data: dashboardData,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// ============================================
// REPORT MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/analytics/reports
 * @desc    Create a new analytics report
 * @access  Private
 */
app.post('/api/analytics/reports', authenticateToken, validateReport, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const report: AnalyticsReport = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description || '',
      type: req.body.type,
      query: req.body.query,
      parameters: req.body.parameters || {},
      format: req.body.format,
      schedule: req.body.schedule,
      status: 'active',
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    reports.push(report);

    logger.info(`Analytics report created: ${report.id}`);
    
    res.json({
      success: true,
      message: 'Report created successfully',
      data: { report }
    });
  } catch (error) {
    logger.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report'
    });
  }
});

/**
 * @route   POST /api/analytics/reports/:id/run
 * @desc    Run an analytics report
 * @access  Private
 */
app.post('/api/analytics/reports/:id/run', authenticateToken, async (req, res) => {
  try {
    const report = reports.find(
      r => r.id === req.params.id && r.tenantId === req.user.tenantId
    );
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Execute report query
    const reportData = await executeReportQuery(report);
    
    // Update report status
    const reportIndex = reports.findIndex(r => r.id === report.id);
    if (reportIndex !== -1) {
      reports[reportIndex] = {
        ...reports[reportIndex],
        lastRun: new Date(),
        updatedAt: new Date()
      };
    }

    logger.info(`Report executed: ${report.id}`);
    
    res.json({
      success: true,
      message: 'Report executed successfully',
      data: {
        report: reports[reportIndex],
        data: reportData,
        format: report.format
      }
    });
  } catch (error) {
    logger.error('Error executing report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute report',
      error: error.message
    });
  }
});

// ============================================
// METRICS ROUTES
// ============================================

/**
 * @route   GET /api/analytics/metrics
 * @desc    Get analytics metrics
 * @access  Private
 */
app.get('/api/analytics/metrics', authenticateToken, async (req, res) => {
  try {
    const { category, limit = 50 } = req.query;
    
    let tenantMetrics = metrics.filter(metric => metric.tenantId === req.user.tenantId);
    
    if (category) {
      tenantMetrics = tenantMetrics.filter(metric => metric.category === category);
    }
    
    tenantMetrics = tenantMetrics
      .sort((a, b) => b.calculatedAt.getTime() - a.calculatedAt.getTime())
      .slice(0, parseInt(limit as string));
    
    res.json({
      success: true,
      data: { metrics: tenantMetrics },
      count: tenantMetrics.length
    });
  } catch (error) {
    logger.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metrics'
    });
  }
});

/**
 * @route   POST /api/analytics/metrics/calculate
 * @desc    Calculate analytics metrics
 * @access  Private
 */
app.post('/api/analytics/metrics/calculate', authenticateToken, async (req, res) => {
  try {
    const { data, metricType, parameters = {} } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: 'Data array is required'
      });
    }

    const calculatedMetrics = await calculateMetrics(data, metricType, parameters);
    
    res.json({
      success: true,
      message: 'Metrics calculated successfully',
      data: { metrics: calculatedMetrics }
    });
  } catch (error) {
    logger.error('Error calculating metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate metrics',
      error: error.message
    });
  }
});

// ============================================
// DATA VISUALIZATION ROUTES
// ============================================

/**
 * @route   POST /api/analytics/visualizations
 * @desc    Create a new data visualization
 * @access  Private
 */
app.post('/api/analytics/visualizations', authenticateToken, async (req, res) => {
  try {
    const { name, type, data, configuration = {} } = req.body;
    
    if (!name || !type || !data) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, and data are required'
      });
    }

    const visualization: DataVisualization = {
      id: uuidv4(),
      name,
      type,
      data,
      configuration,
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    visualizations.push(visualization);

    logger.info(`Data visualization created: ${visualization.id}`);
    
    res.json({
      success: true,
      message: 'Visualization created successfully',
      data: { visualization }
    });
  } catch (error) {
    logger.error('Error creating visualization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create visualization'
    });
  }
});

// ============================================
// DATA EXPORT ROUTES
// ============================================

/**
 * @route   POST /api/analytics/export
 * @desc    Export analytics data
 * @access  Private
 */
app.post('/api/analytics/export', authenticateToken, async (req, res) => {
  try {
    const { data, format = 'csv', filename } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: 'Data array is required'
      });
    }

    let exportData: Buffer;
    let contentType: string;
    let fileExtension: string;

    switch (format) {
      case 'csv':
        const parser = new Parser();
        exportData = Buffer.from(parser.parse(data));
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;
      case 'xlsx':
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        exportData = Buffer.from(XLSX.write(workbook, { type: 'buffer' }));
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
        break;
      case 'json':
        exportData = Buffer.from(JSON.stringify(data, null, 2));
        contentType = 'application/json';
        fileExtension = 'json';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported export format'
        });
    }

    const exportFilename = filename || `analytics_export_${Date.now()}.${fileExtension}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportFilename}"`);
    res.send(exportData);

    logger.info(`Data exported: ${exportFilename}`);
  } catch (error) {
    logger.error('Error exporting data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
});

// ============================================
// ANALYTICS DASHBOARD ROUTES
// ============================================

/**
 * @route   GET /api/analytics/dashboard/overview
 * @desc    Get analytics overview dashboard
 * @access  Private
 */
app.get('/api/analytics/dashboard/overview', authenticateToken, async (req, res) => {
  try {
    const tenantDashboards = dashboards.filter(dashboard => dashboard.tenantId === req.user.tenantId);
    const tenantReports = reports.filter(report => report.tenantId === req.user.tenantId);
    const tenantMetrics = metrics.filter(metric => metric.tenantId === req.user.tenantId);
    const tenantVisualizations = visualizations.filter(viz => viz.tenantId === req.user.tenantId);

    // Dashboard analytics
    const dashboardStats = {
      total: tenantDashboards.length,
      public: tenantDashboards.filter(dashboard => dashboard.isPublic).length,
      private: tenantDashboards.filter(dashboard => !dashboard.isPublic).length,
      totalWidgets: tenantDashboards.reduce((sum, dashboard) => sum + dashboard.widgets.length, 0)
    };

    // Report analytics
    const reportStats = {
      total: tenantReports.length,
      scheduled: tenantReports.filter(report => report.type === 'scheduled').length,
      onDemand: tenantReports.filter(report => report.type === 'on-demand').length,
      realTime: tenantReports.filter(report => report.type === 'real-time').length,
      active: tenantReports.filter(report => report.status === 'active').length,
      inactive: tenantReports.filter(report => report.status === 'inactive').length
    };

    // Metrics analytics
    const metricsStats = {
      total: tenantMetrics.length,
      business: tenantMetrics.filter(metric => metric.category === 'business').length,
      operational: tenantMetrics.filter(metric => metric.category === 'operational').length,
      financial: tenantMetrics.filter(metric => metric.category === 'financial').length,
      user: tenantMetrics.filter(metric => metric.category === 'user').length,
      technical: tenantMetrics.filter(metric => metric.category === 'technical').length,
      trendingUp: tenantMetrics.filter(metric => metric.trend === 'up').length,
      trendingDown: tenantMetrics.filter(metric => metric.trend === 'down').length,
      stable: tenantMetrics.filter(metric => metric.trend === 'stable').length
    };

    // Visualization analytics
    const visualizationStats = {
      total: tenantVisualizations.length,
      line: tenantVisualizations.filter(viz => viz.type === 'line').length,
      bar: tenantVisualizations.filter(viz => viz.type === 'bar').length,
      pie: tenantVisualizations.filter(viz => viz.type === 'pie').length,
      scatter: tenantVisualizations.filter(viz => viz.type === 'scatter').length,
      heatmap: tenantVisualizations.filter(viz => viz.type === 'heatmap').length,
      treemap: tenantVisualizations.filter(viz => viz.type === 'treemap').length,
      sankey: tenantVisualizations.filter(viz => viz.type === 'sankey').length
    };

    res.json({
      success: true,
      data: {
        dashboards: dashboardStats,
        reports: reportStats,
        metrics: metricsStats,
        visualizations: visualizationStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching analytics overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics overview'
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function generateDashboardData(dashboard: AnalyticsDashboard): Promise<Record<string, any>> {
  const data: Record<string, any> = {};
  
  for (const widget of dashboard.widgets) {
    try {
      switch (widget.type) {
        case 'chart':
          data[widget.id] = await generateChartData(widget);
          break;
        case 'table':
          data[widget.id] = await generateTableData(widget);
          break;
        case 'metric':
          data[widget.id] = await generateMetricData(widget);
          break;
        case 'kpi':
          data[widget.id] = await generateKPIData(widget);
          break;
        case 'gauge':
          data[widget.id] = await generateGaugeData(widget);
          break;
        default:
          data[widget.id] = { error: 'Unsupported widget type' };
      }
    } catch (error) {
      logger.error(`Error generating data for widget ${widget.id}:`, error);
      data[widget.id] = { error: error.message };
    }
  }
  
  return data;
}

async function generateChartData(widget: DashboardWidget): Promise<any> {
  // Simulate chart data generation
  const dataPoints = 30;
  const labels = Array.from({ length: dataPoints }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - dataPoints + i);
    return date.toISOString().split('T')[0];
  });
  
  const datasets = [
    {
      label: 'Bookings',
      data: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 100) + 20),
      borderColor: '#4A90E2',
      backgroundColor: 'rgba(74, 144, 226, 0.1)'
    },
    {
      label: 'Revenue',
      data: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 5000) + 1000),
      borderColor: '#7ED321',
      backgroundColor: 'rgba(126, 211, 33, 0.1)'
    }
  ];
  
  return {
    labels,
    datasets,
    type: widget.configuration.chartType || 'line'
  };
}

async function generateTableData(widget: DashboardWidget): Promise<any> {
  // Simulate table data generation
  return {
    columns: ['Date', 'Library', 'Bookings', 'Revenue', 'Occupancy'],
    rows: Array.from({ length: 10 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      library: `Library ${i + 1}`,
      bookings: Math.floor(Math.random() * 100) + 20,
      revenue: Math.floor(Math.random() * 5000) + 1000,
      occupancy: Math.floor(Math.random() * 40) + 60
    }))
  };
}

async function generateMetricData(widget: DashboardWidget): Promise<any> {
  // Simulate metric data generation
  const value = Math.floor(Math.random() * 1000) + 100;
  const previousValue = Math.floor(Math.random() * 1000) + 100;
  const changePercent = ((value - previousValue) / previousValue) * 100;
  
  return {
    value,
    unit: widget.configuration.unit || '',
    changePercent: Math.round(changePercent * 100) / 100,
    trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'stable',
    target: widget.configuration.target || null
  };
}

async function generateKPIData(widget: DashboardWidget): Promise<any> {
  // Simulate KPI data generation
  const current = Math.floor(Math.random() * 1000) + 100;
  const target = Math.floor(Math.random() * 1000) + 200;
  const achievement = (current / target) * 100;
  
  return {
    current,
    target,
    achievement: Math.round(achievement * 100) / 100,
    status: achievement >= 100 ? 'achieved' : achievement >= 80 ? 'on-track' : 'behind',
    trend: Math.random() > 0.5 ? 'up' : 'down'
  };
}

async function generateGaugeData(widget: DashboardWidget): Promise<any> {
  // Simulate gauge data generation
  const value = Math.floor(Math.random() * 100);
  const max = widget.configuration.max || 100;
  const min = widget.configuration.min || 0;
  
  return {
    value,
    min,
    max,
    percentage: (value / max) * 100,
    status: value >= max * 0.8 ? 'high' : value >= max * 0.5 ? 'medium' : 'low'
  };
}

async function executeReportQuery(report: AnalyticsReport): Promise<any> {
  // Simulate report query execution
  const data = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    library: `Library ${(i % 5) + 1}`,
    bookings: Math.floor(Math.random() * 100) + 20,
    revenue: Math.floor(Math.random() * 5000) + 1000,
    occupancy: Math.floor(Math.random() * 40) + 60,
    satisfaction: Math.floor(Math.random() * 2) + 4 // 4-5 rating
  }));
  
  return {
    query: report.query,
    parameters: report.parameters,
    data,
    totalRows: data.length,
    executionTime: Math.floor(Math.random() * 1000) + 100
  };
}

async function calculateMetrics(data: any[], metricType: string, parameters: Record<string, any>): Promise<any[]> {
  const calculatedMetrics: any[] = [];
  
  try {
    switch (metricType) {
      case 'statistical':
        const numericData = data.map(d => d[parameters.field]).filter(val => typeof val === 'number');
        calculatedMetrics.push(
          { name: 'Mean', value: mean(numericData), unit: parameters.unit || '' },
          { name: 'Median', value: median(numericData), unit: parameters.unit || '' },
          { name: 'Mode', value: mode(numericData), unit: parameters.unit || '' },
          { name: 'Standard Deviation', value: standardDeviation(numericData), unit: parameters.unit || '' },
          { name: 'Variance', value: variance(numericData), unit: parameters.unit || '' }
        );
        break;
        
      case 'regression':
        const xData = data.map(d => d[parameters.xField]);
        const yData = data.map(d => d[parameters.yField]);
        const regression = new SimpleLinearRegression(xData, yData);
        calculatedMetrics.push(
          { name: 'Slope', value: regression.slope, unit: '' },
          { name: 'Intercept', value: regression.intercept, unit: '' },
          { name: 'R²', value: regression.score(xData, yData), unit: '' }
        );
        break;
        
      case 'clustering':
        const clusterData = data.map(d => [d[parameters.xField], d[parameters.yField]]);
        const kmeans = new KMeans({ k: parameters.k || 3 });
        const clusters = kmeans.fit(clusterData);
        calculatedMetrics.push(
          { name: 'Clusters', value: clusters.length, unit: '' },
          { name: 'Inertia', value: clusters.reduce((sum, cluster) => sum + cluster.inertia, 0), unit: '' }
        );
        break;
        
      default:
        throw new Error('Unsupported metric type');
    }
  } catch (error) {
    logger.error('Error calculating metrics:', error);
    throw error;
  }
  
  return calculatedMetrics;
}

// ============================================
// CRON JOBS
// ============================================

// Generate metrics daily
cron.schedule('0 1 * * *', async () => {
  logger.info('Generating daily analytics metrics...');
  
  const dailyMetrics = [
    {
      id: uuidv4(),
      name: 'Daily Bookings',
      description: 'Total bookings for the day',
      category: 'business' as const,
      value: Math.floor(Math.random() * 500) + 100,
      unit: 'bookings',
      trend: 'up' as const,
      changePercent: Math.floor(Math.random() * 20) - 10,
      tenantId: 'default',
      calculatedAt: new Date()
    },
    {
      id: uuidv4(),
      name: 'Daily Revenue',
      description: 'Total revenue for the day',
      category: 'financial' as const,
      value: Math.floor(Math.random() * 50000) + 10000,
      unit: '₹',
      trend: 'up' as const,
      changePercent: Math.floor(Math.random() * 15) - 5,
      tenantId: 'default',
      calculatedAt: new Date()
    },
    {
      id: uuidv4(),
      name: 'Average Occupancy',
      description: 'Average library occupancy rate',
      category: 'operational' as const,
      value: Math.floor(Math.random() * 30) + 60,
      unit: '%',
      trend: 'stable' as const,
      changePercent: Math.floor(Math.random() * 10) - 5,
      tenantId: 'default',
      calculatedAt: new Date()
    }
  ];

  metrics.push(...dailyMetrics);
  logger.info(`Generated ${dailyMetrics.length} daily metrics`);
});

// Clean up old data weekly
cron.schedule('0 3 * * 0', async () => {
  logger.info('Cleaning up old analytics data...');
  
  const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
  
  // Clean up old metrics
  const initialMetricsCount = metrics.length;
  const filteredMetrics = metrics.filter(metric => metric.calculatedAt > cutoffDate);
  metrics.length = 0;
  metrics.push(...filteredMetrics);
  
  logger.info(`Cleaned up ${initialMetricsCount - metrics.length} old metrics`);
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = process.env.PORT || 3008;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Analytics Service running on port ${PORT}`);
      logger.info(`📊 Dashboard Management: Active`);
      logger.info(`📈 Report Generation: Active`);
      logger.info(`📋 Metrics Calculation: Active`);
      logger.info(`📊 Data Visualization: Active`);
      logger.info(`📤 Data Export: Active`);
      logger.info(`📈 Real-time Analytics: Active`);
      logger.info(`⏰ Scheduled Reports: Active`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;
