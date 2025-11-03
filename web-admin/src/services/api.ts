/**
 * API Service Layer
 * Centralized API management for all microservices
 * 
 * Features:
 * - Service discovery
 * - Health monitoring
 * - Real-time data fetching
 * - Service control operations
 * - Error handling
 * - Authentication
 */

import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../constants';

interface ServiceHealthStatus {
  status: 'healthy' | 'unhealthy';
  responseTime?: string;
  uptime?: string;
  version?: string;
  error?: string;
  timestamp: string;
}

// Service configurations
const SERVICES = {
  AI_SERVICE: { port: 3001, path: '/api/ai' },
  ANALYTICS_SERVICE: { port: 3002, path: '/api/analytics' },
  AUTOMATION_SERVICE: { port: 3003, path: '/api/automation' },
  COMMUNICATION_SERVICE: { port: 3004, path: '/api/communication' },
  CRM_SERVICE: { port: 3005, path: '/api/crm' },
  DATA_PIPELINE_SERVICE: { port: 3006, path: '/api/data-pipeline' },
  FACE_RECOGNITION_SERVICE: { port: 3007, path: '/api/face-recognition' },
  ML_SERVICE: { port: 3008, path: '/api/ml' },
  NOTIFICATION_SERVICE: { port: 3009, path: '/api/notification' },
  PAYMENT_SERVICE: { port: 3010, path: '/api/payment' },
  I18N_SERVICE: { port: 3011, path: '/api/i18n' },
  API_GATEWAY: { port: 3000, path: '/api' },
};

// Base API configuration
const createApiInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ''}`,
    },
  });
};
// Merge auth header into config
const withAuth = (config?: any) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return {
    ...config,
    headers: {
      ...(config?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

// Service URLs
const getServiceUrl = (service: keyof typeof SERVICES): string => {
  const config = SERVICES[service];
  return `${API_CONFIG.BASE_URL}${config.path}`;
};

// API Service Class
class ApiService {
  private instances: Map<string, any> = new Map();

  constructor() {
    // Initialize API instances for each service
    Object.keys(SERVICES).forEach(service => {
      const serviceKey = service as keyof typeof SERVICES;
      const url = getServiceUrl(serviceKey);
      this.instances.set(service, createApiInstance(url));
    });
  }

  // Get service instance
  private getInstance(service: keyof typeof SERVICES) {
    const instance = this.instances.get(service);
    if (!instance) {
      throw new Error(`Service ${service} not initialized`);
    }
    return instance;
  }

  // Generic HTTP methods for backward compatibility
  async get<T = unknown>(url: string, config?: any): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;
    const response = await axios.get<T>(fullUrl, withAuth(config));
    return response.data;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: any): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;
    const response = await axios.post<T>(fullUrl, data, withAuth(config));
    return response.data;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: any): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;
    const response = await axios.put<T>(fullUrl, data, withAuth(config));
    return response.data;
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: any): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;
    const response = await axios.patch<T>(fullUrl, data, withAuth(config));
    return response.data;
  }

  async delete<T = unknown>(url: string, config?: any): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;
    const response = await axios.delete<T>(fullUrl, withAuth(config));
    return response.data;
  }

  async upload<T = unknown>(url: string, data: FormData, config?: any): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;
    const response = await axios.post<T>(fullUrl, data, {
      ...withAuth(config),
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
    return response.data;
  }

  // Auth methods for backward compatibility
  async login(credentials: { email: string; password: string }): Promise<{ user: unknown; token: string; refreshToken: string; expiresIn: number }> {
    const response = await this.post('/auth/login', credentials);
    return {
      ...response,
      expiresIn: response.expiresIn || 3600 // Default to 1 hour
    };
  }

  async register(userData: { email: string; password: string; firstName: string; lastName: string; role?: string }): Promise<unknown> {
    return this.post('/auth/register', userData);
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    return this.post('/auth/refresh', { refreshToken });
  }

  async logout(): Promise<void> {
    return this.post('/auth/logout');
  }

  async getProfile(): Promise<unknown> {
    return this.get('/auth/profile');
  }

  // Health check for all services
  async checkAllServicesHealth(): Promise<Record<string, ServiceHealthStatus>> {
    const healthChecks: Record<string, ServiceHealthStatus> = {};
    
    for (const [serviceName, serviceConfig] of Object.entries(SERVICES)) {
      try {
        const response = await axios.get(`http://localhost:${serviceConfig.port}/health`, {
          timeout: 5000,
        });
        healthChecks[serviceName] = {
          status: 'healthy',
          responseTime: response.headers['x-response-time'] || 'N/A',
          uptime: (response.data as { uptime?: string })?.uptime || 'N/A',
          version: (response.data as { version?: string })?.version || 'N/A',
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        healthChecks[serviceName] = {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
      }
    }
    
    return healthChecks;
  }

  // AI Service API
  ai = {
    // Get AI models
    getModels: async () => {
      const response = await this.getInstance('AI_SERVICE').get('/models');
      return response.data;
    },

    // Create AI model
    createModel: async (modelData: any) => {
      const response = await this.getInstance('AI_SERVICE').post('/models', modelData);
      return response.data;
    },

    // Update AI model
    updateModel: async (id: string, modelData: any) => {
      const response = await this.getInstance('AI_SERVICE').put(`/models/${id}`, modelData);
      return response.data;
    },

    // Delete AI model
    deleteModel: async (id: string) => {
      const response = await this.getInstance('AI_SERVICE').delete(`/models/${id}`);
      return response.data;
    },

    // Process NLP request
    processNLP: async (text: string, options: any = {}) => {
      const response = await this.getInstance('AI_SERVICE').post('/nlp/analyze', {
        text,
        ...options,
      });
      return response.data;
    },

    // Process image
    processImage: async (imageData: any, options: any = {}) => {
      const response = await this.getInstance('AI_SERVICE').post('/vision/analyze', {
        image: imageData,
        ...options,
      });
      return response.data;
    },

    // Generate text
    generateText: async (prompt: string, options: any = {}) => {
      const response = await this.getInstance('AI_SERVICE').post('/text/generate', {
        prompt,
        ...options,
      });
      return response.data;
    },

    // Chat with AI
    chat: async (message: string, sessionId?: string) => {
      const response = await this.getInstance('AI_SERVICE').post('/chat', {
        message,
        sessionId,
      });
      return response.data;
    },

    // Get AI insights
    getInsights: async () => {
      const response = await this.getInstance('AI_SERVICE').get('/insights');
      return response.data;
    },
  };

  // Analytics Service API
  analytics = {
    // Get dashboards
    getDashboards: async () => {
      const response = await this.getInstance('ANALYTICS_SERVICE').get('/dashboards');
      return response.data;
    },

    // Create dashboard
    createDashboard: async (dashboardData: any) => {
      const response = await this.getInstance('ANALYTICS_SERVICE').post('/dashboards', dashboardData);
      return response.data;
    },

    // Update dashboard
    updateDashboard: async (id: string, dashboardData: any) => {
      const response = await this.getInstance('ANALYTICS_SERVICE').put(`/dashboards/${id}`, dashboardData);
      return response.data;
    },

    // Delete dashboard
    deleteDashboard: async (id: string) => {
      const response = await this.getInstance('ANALYTICS_SERVICE').delete(`/dashboards/${id}`);
      return response.data;
    },

    // Get reports
    getReports: async () => {
      const response = await this.getInstance('ANALYTICS_SERVICE').get('/reports');
      return response.data;
    },

    // Generate report
    generateReport: async (reportConfig: any) => {
      const response = await this.getInstance('ANALYTICS_SERVICE').post('/reports/generate', reportConfig);
      return response.data;
    },

    // Get metrics
    getMetrics: async (metricType?: string) => {
      const response = await this.getInstance('ANALYTICS_SERVICE').get('/metrics', {
        params: { type: metricType },
      });
      return response.data;
    },

    // Create visualization
    createVisualization: async (vizData: any) => {
      const response = await this.getInstance('ANALYTICS_SERVICE').post('/visualizations', vizData);
      return response.data;
    },

    // Export data
    exportData: async (format: string, filters: any = {}) => {
      const response = await this.getInstance('ANALYTICS_SERVICE').post('/export', {
        format,
        filters,
      });
      return response.data;
    },
  };

  // Automation Service API
  automation = {
    // Get workflows
    getWorkflows: async () => {
      const response = await this.getInstance('AUTOMATION_SERVICE').get('/workflows');
      return response.data;
    },

    // Create workflow
    createWorkflow: async (workflowData: any) => {
      const response = await this.getInstance('AUTOMATION_SERVICE').post('/workflows', workflowData);
      return response.data;
    },

    // Update workflow
    updateWorkflow: async (id: string, workflowData: any) => {
      const response = await this.getInstance('AUTOMATION_SERVICE').put(`/workflows/${id}`, workflowData);
      return response.data;
    },

    // Delete workflow
    deleteWorkflow: async (id: string) => {
      const response = await this.getInstance('AUTOMATION_SERVICE').delete(`/workflows/${id}`);
      return response.data;
    },

    // Execute workflow
    executeWorkflow: async (id: string, inputData: any = {}) => {
      const response = await this.getInstance('AUTOMATION_SERVICE').post(`/workflows/${id}/execute`, inputData);
      return response.data;
    },

    // Get tasks
    getTasks: async () => {
      const response = await this.getInstance('AUTOMATION_SERVICE').get('/tasks');
      return response.data;
    },

    // Create task
    createTask: async (taskData: any) => {
      const response = await this.getInstance('AUTOMATION_SERVICE').post('/tasks', taskData);
      return response.data;
    },

    // Update task
    updateTask: async (id: string, taskData: any) => {
      const response = await this.getInstance('AUTOMATION_SERVICE').put(`/tasks/${id}`, taskData);
      return response.data;
    },

    // Delete task
    deleteTask: async (id: string) => {
      const response = await this.getInstance('AUTOMATION_SERVICE').delete(`/tasks/${id}`);
      return response.data;
    },

    // Get schedules
    getSchedules: async () => {
      const response = await this.getInstance('AUTOMATION_SERVICE').get('/schedules');
      return response.data;
    },

    // Create schedule
    createSchedule: async (scheduleData: any) => {
      const response = await this.getInstance('AUTOMATION_SERVICE').post('/schedules', scheduleData);
      return response.data;
    },

    // Update schedule
    updateSchedule: async (id: string, scheduleData: any) => {
      const response = await this.getInstance('AUTOMATION_SERVICE').put(`/schedules/${id}`, scheduleData);
      return response.data;
    },

    // Delete schedule
    deleteSchedule: async (id: string) => {
      const response = await this.getInstance('AUTOMATION_SERVICE').delete(`/schedules/${id}`);
      return response.data;
    },

    // Get integrations
    getIntegrations: async () => {
      const response = await this.getInstance('AUTOMATION_SERVICE').get('/integrations');
      return response.data;
    },

    // Create integration
    createIntegration: async (integrationData: any) => {
      const response = await this.getInstance('AUTOMATION_SERVICE').post('/integrations', integrationData);
      return response.data;
    },

    // Update integration
    updateIntegration: async (id: string, integrationData: any) => {
      const response = await this.getInstance('AUTOMATION_SERVICE').put(`/integrations/${id}`, integrationData);
      return response.data;
    },

    // Delete integration
    deleteIntegration: async (id: string) => {
      const response = await this.getInstance('AUTOMATION_SERVICE').delete(`/integrations/${id}`);
      return response.data;
    },
  };

  // Communication Service API
  communication = {
    // Send email
    sendEmail: async (emailData: any) => {
      const response = await this.getInstance('COMMUNICATION_SERVICE').post('/email/send', emailData);
      return response.data;
    },

    // Send SMS
    sendSMS: async (smsData: any) => {
      const response = await this.getInstance('COMMUNICATION_SERVICE').post('/sms/send', smsData);
      return response.data;
    },

    // Send WhatsApp message
    sendWhatsApp: async (whatsappData: any) => {
      const response = await this.getInstance('COMMUNICATION_SERVICE').post('/whatsapp/send', whatsappData);
      return response.data;
    },

    // Send push notification
    sendPushNotification: async (pushData: any) => {
      const response = await this.getInstance('COMMUNICATION_SERVICE').post('/push/send', pushData);
      return response.data;
    },

    // Get message templates
    getTemplates: async () => {
      const response = await this.getInstance('COMMUNICATION_SERVICE').get('/templates');
      return response.data;
    },

    // Create template
    createTemplate: async (templateData: any) => {
      const response = await this.getInstance('COMMUNICATION_SERVICE').post('/templates', templateData);
      return response.data;
    },

    // Update template
    updateTemplate: async (id: string, templateData: any) => {
      const response = await this.getInstance('COMMUNICATION_SERVICE').put(`/templates/${id}`, templateData);
      return response.data;
    },

    // Delete template
    deleteTemplate: async (id: string) => {
      const response = await this.getInstance('COMMUNICATION_SERVICE').delete(`/templates/${id}`);
      return response.data;
    },

    // Get campaigns
    getCampaigns: async () => {
      const response = await this.getInstance('COMMUNICATION_SERVICE').get('/campaigns');
      return response.data;
    },

    // Create campaign
    createCampaign: async (campaignData: any) => {
      const response = await this.getInstance('COMMUNICATION_SERVICE').post('/campaigns', campaignData);
      return response.data;
    },

    // Update campaign
    updateCampaign: async (id: string, campaignData: any) => {
      const response = await this.getInstance('COMMUNICATION_SERVICE').put(`/campaigns/${id}`, campaignData);
      return response.data;
    },

    // Delete campaign
    deleteCampaign: async (id: string) => {
      const response = await this.getInstance('COMMUNICATION_SERVICE').delete(`/campaigns/${id}`);
      return response.data;
    },

    // Get message history
    getMessageHistory: async (filters: any = {}) => {
      const response = await this.getInstance('COMMUNICATION_SERVICE').get('/messages', {
        params: filters,
      });
      return response.data;
    },
  };

  // CRM Service API
  crm = {
    // Get leads
    getLeads: async () => {
      const response = await this.getInstance('CRM_SERVICE').get('/leads');
      return response.data;
    },

    // Create lead
    createLead: async (leadData: any) => {
      const response = await this.getInstance('CRM_SERVICE').post('/leads', leadData);
      return response.data;
    },

    // Update lead
    updateLead: async (id: string, leadData: any) => {
      const response = await this.getInstance('CRM_SERVICE').put(`/leads/${id}`, leadData);
      return response.data;
    },

    // Delete lead
    deleteLead: async (id: string) => {
      const response = await this.getInstance('CRM_SERVICE').delete(`/leads/${id}`);
      return response.data;
    },

    // Get contacts
    getContacts: async () => {
      const response = await this.getInstance('CRM_SERVICE').get('/contacts');
      return response.data;
    },

    // Create contact
    createContact: async (contactData: any) => {
      const response = await this.getInstance('CRM_SERVICE').post('/contacts', contactData);
      return response.data;
    },

    // Update contact
    updateContact: async (id: string, contactData: any) => {
      const response = await this.getInstance('CRM_SERVICE').put(`/contacts/${id}`, contactData);
      return response.data;
    },

    // Delete contact
    deleteContact: async (id: string) => {
      const response = await this.getInstance('CRM_SERVICE').delete(`/contacts/${id}`);
      return response.data;
    },

    // Get deals
    getDeals: async () => {
      const response = await this.getInstance('CRM_SERVICE').get('/deals');
      return response.data;
    },

    // Create deal
    createDeal: async (dealData: any) => {
      const response = await this.getInstance('CRM_SERVICE').post('/deals', dealData);
      return response.data;
    },

    // Update deal
    updateDeal: async (id: string, dealData: any) => {
      const response = await this.getInstance('CRM_SERVICE').put(`/deals/${id}`, dealData);
      return response.data;
    },

    // Delete deal
    deleteDeal: async (id: string) => {
      const response = await this.getInstance('CRM_SERVICE').delete(`/deals/${id}`);
      return response.data;
    },

    // Get customers
    getCustomers: async () => {
      const response = await this.getInstance('CRM_SERVICE').get('/customers');
      return response.data;
    },

    // Create customer
    createCustomer: async (customerData: any) => {
      const response = await this.getInstance('CRM_SERVICE').post('/customers', customerData);
      return response.data;
    },

    // Update customer
    updateCustomer: async (id: string, customerData: any) => {
      const response = await this.getInstance('CRM_SERVICE').put(`/customers/${id}`, customerData);
      return response.data;
    },

    // Delete customer
    deleteCustomer: async (id: string) => {
      const response = await this.getInstance('CRM_SERVICE').delete(`/customers/${id}`);
      return response.data;
    },

    // Get analytics
    getAnalytics: async () => {
      const response = await this.getInstance('CRM_SERVICE').get('/analytics');
      return response.data;
    },
  };

  // Data Pipeline Service API
  dataPipeline = {
    // Get data jobs
    getDataJobs: async () => {
      const response = await this.getInstance('DATA_PIPELINE_SERVICE').get('/jobs');
      return response.data;
    },

    // Create data job
    createDataJob: async (jobData: any) => {
      const response = await this.getInstance('DATA_PIPELINE_SERVICE').post('/jobs', jobData);
      return response.data;
    },

    // Update data job
    updateDataJob: async (id: string, jobData: any) => {
      const response = await this.getInstance('DATA_PIPELINE_SERVICE').put(`/jobs/${id}`, jobData);
      return response.data;
    },

    // Delete data job
    deleteDataJob: async (id: string) => {
      const response = await this.getInstance('DATA_PIPELINE_SERVICE').delete(`/jobs/${id}`);
      return response.data;
    },

    // Execute data job
    executeDataJob: async (id: string, inputData: any = {}) => {
      const response = await this.getInstance('DATA_PIPELINE_SERVICE').post(`/jobs/${id}/execute`, inputData);
      return response.data;
    },

    // Get data schemas
    getDataSchemas: async () => {
      const response = await this.getInstance('DATA_PIPELINE_SERVICE').get('/schemas');
      return response.data;
    },

    // Create data schema
    createDataSchema: async (schemaData: any) => {
      const response = await this.getInstance('DATA_PIPELINE_SERVICE').post('/schemas', schemaData);
      return response.data;
    },

    // Update data schema
    updateDataSchema: async (id: string, schemaData: any) => {
      const response = await this.getInstance('DATA_PIPELINE_SERVICE').put(`/schemas/${id}`, schemaData);
      return response.data;
    },

    // Delete data schema
    deleteDataSchema: async (id: string) => {
      const response = await this.getInstance('DATA_PIPELINE_SERVICE').delete(`/schemas/${id}`);
      return response.data;
    },

    // Get data records
    getDataRecords: async (filters: any = {}) => {
      const response = await this.getInstance('DATA_PIPELINE_SERVICE').get('/records', {
        params: filters,
      });
      return response.data;
    },

    // Validate data
    validateData: async (data: any, schema: any) => {
      const response = await this.getInstance('DATA_PIPELINE_SERVICE').post('/validate', {
        data,
        schema,
      });
      return response.data;
    },

    // Transform data
    transformData: async (data: any, transformation: any) => {
      const response = await this.getInstance('DATA_PIPELINE_SERVICE').post('/transform', {
        data,
        transformation,
      });
      return response.data;
    },

    // Export data
    exportData: async (format: string, filters: any = {}) => {
      const response = await this.getInstance('DATA_PIPELINE_SERVICE').post('/export', {
        format,
        filters,
      });
      return response.data;
    },
  };

  // Face Recognition Service API
  faceRecognition = {
    // Get face enrollments
    getFaceEnrollments: async () => {
      const response = await this.getInstance('FACE_RECOGNITION_SERVICE').get('/enrollments');
      return response.data;
    },

    // Create face enrollment
    createFaceEnrollment: async (enrollmentData: any) => {
      const response = await this.getInstance('FACE_RECOGNITION_SERVICE').post('/enrollments', enrollmentData);
      return response.data;
    },

    // Update face enrollment
    updateFaceEnrollment: async (id: string, enrollmentData: any) => {
      const response = await this.getInstance('FACE_RECOGNITION_SERVICE').put(`/enrollments/${id}`, enrollmentData);
      return response.data;
    },

    // Delete face enrollment
    deleteFaceEnrollment: async (id: string) => {
      const response = await this.getInstance('FACE_RECOGNITION_SERVICE').delete(`/enrollments/${id}`);
      return response.data;
    },

    // Detect faces
    detectFaces: async (imageData: any) => {
      const response = await this.getInstance('FACE_RECOGNITION_SERVICE').post('/detect', {
        image: imageData,
      });
      return response.data;
    },

    // Recognize faces
    recognizeFaces: async (imageData: any) => {
      const response = await this.getInstance('FACE_RECOGNITION_SERVICE').post('/recognize', {
        image: imageData,
      });
      return response.data;
    },

    // Liveness detection
    detectLiveness: async (imageData: any) => {
      const response = await this.getInstance('FACE_RECOGNITION_SERVICE').post('/liveness', {
        image: imageData,
      });
      return response.data;
    },

    // Get recognition history
    getRecognitionHistory: async (filters: any = {}) => {
      const response = await this.getInstance('FACE_RECOGNITION_SERVICE').get('/history', {
        params: filters,
      });
      return response.data;
    },

    // Get performance metrics
    getPerformanceMetrics: async () => {
      const response = await this.getInstance('FACE_RECOGNITION_SERVICE').get('/metrics');
      return response.data;
    },
  };

  // ML Service API
  ml = {
    // Get ML models
    getMLModels: async () => {
      const response = await this.getInstance('ML_SERVICE').get('/models');
      return response.data;
    },

    // Create ML model
    createMLModel: async (modelData: any) => {
      const response = await this.getInstance('ML_SERVICE').post('/models', modelData);
      return response.data;
    },

    // Update ML model
    updateMLModel: async (id: string, modelData: any) => {
      const response = await this.getInstance('ML_SERVICE').put(`/models/${id}`, modelData);
      return response.data;
    },

    // Delete ML model
    deleteMLModel: async (id: string) => {
      const response = await this.getInstance('ML_SERVICE').delete(`/models/${id}`);
      return response.data;
    },

    // Train model
    trainModel: async (id: string, trainingData: any) => {
      const response = await this.getInstance('ML_SERVICE').post(`/models/${id}/train`, trainingData);
      return response.data;
    },

    // Make prediction
    makePrediction: async (id: string, inputData: any) => {
      const response = await this.getInstance('ML_SERVICE').post(`/models/${id}/predict`, inputData);
      return response.data;
    },

    // Evaluate model
    evaluateModel: async (id: string, testData: any) => {
      const response = await this.getInstance('ML_SERVICE').post(`/models/${id}/evaluate`, testData);
      return response.data;
    },

    // Deploy model
    deployModel: async (id: string, deploymentConfig: any) => {
      const response = await this.getInstance('ML_SERVICE').post(`/models/${id}/deploy`, deploymentConfig);
      return response.data;
    },

    // Get training jobs
    getTrainingJobs: async () => {
      const response = await this.getInstance('ML_SERVICE').get('/training-jobs');
      return response.data;
    },

    // Create training job
    createTrainingJob: async (jobData: any) => {
      const response = await this.getInstance('ML_SERVICE').post('/training-jobs', jobData);
      return response.data;
    },

    // Update training job
    updateTrainingJob: async (id: string, jobData: any) => {
      const response = await this.getInstance('ML_SERVICE').put(`/training-jobs/${id}`, jobData);
      return response.data;
    },

    // Delete training job
    deleteTrainingJob: async (id: string) => {
      const response = await this.getInstance('ML_SERVICE').delete(`/training-jobs/${id}`);
      return response.data;
    },

    // Get predictions
    getPredictions: async (filters: any = {}) => {
      const response = await this.getInstance('ML_SERVICE').get('/predictions', {
        params: filters,
      });
      return response.data;
    },
  };

  // Notification Service API
  notification = {
    // Send notification
    sendNotification: async (notificationData: any) => {
      const response = await this.getInstance('NOTIFICATION_SERVICE').post('/send', notificationData);
      return response.data;
    },

    // Get notification templates
    getNotificationTemplates: async () => {
      const response = await this.getInstance('NOTIFICATION_SERVICE').get('/templates');
      return response.data;
    },

    // Create notification template
    createNotificationTemplate: async (templateData: any) => {
      const response = await this.getInstance('NOTIFICATION_SERVICE').post('/templates', templateData);
      return response.data;
    },

    // Update notification template
    updateNotificationTemplate: async (id: string, templateData: any) => {
      const response = await this.getInstance('NOTIFICATION_SERVICE').put(`/templates/${id}`, templateData);
      return response.data;
    },

    // Delete notification template
    deleteNotificationTemplate: async (id: string) => {
      const response = await this.getInstance('NOTIFICATION_SERVICE').delete(`/templates/${id}`);
      return response.data;
    },

    // Get recipients
    getRecipients: async () => {
      const response = await this.getInstance('NOTIFICATION_SERVICE').get('/recipients');
      return response.data;
    },

    // Create recipient
    createRecipient: async (recipientData: any) => {
      const response = await this.getInstance('NOTIFICATION_SERVICE').post('/recipients', recipientData);
      return response.data;
    },

    // Update recipient
    updateRecipient: async (id: string, recipientData: any) => {
      const response = await this.getInstance('NOTIFICATION_SERVICE').put(`/recipients/${id}`, recipientData);
      return response.data;
    },

    // Delete recipient
    deleteRecipient: async (id: string) => {
      const response = await this.getInstance('NOTIFICATION_SERVICE').delete(`/recipients/${id}`);
      return response.data;
    },

    // Schedule notification
    scheduleNotification: async (scheduleData: any) => {
      const response = await this.getInstance('NOTIFICATION_SERVICE').post('/schedule', scheduleData);
      return response.data;
    },

    // Get notification history
    getNotificationHistory: async (filters: any = {}) => {
      const response = await this.getInstance('NOTIFICATION_SERVICE').get('/history', {
        params: filters,
      });
      return response.data;
    },

    // Get delivery status
    getDeliveryStatus: async (notificationId: string) => {
      const response = await this.getInstance('NOTIFICATION_SERVICE').get(`/status/${notificationId}`);
      return response.data;
    },
  };

  // Payment Service API
  payment = {
    // Process payment
    processPayment: async (paymentData: any) => {
      const response = await this.getInstance('PAYMENT_SERVICE').post('/process', paymentData);
      return response.data;
    },

    // Get transactions
    getTransactions: async () => {
      const response = await this.getInstance('PAYMENT_SERVICE').get('/transactions');
      return response.data;
    },

    // Get transaction by ID
    getTransaction: async (id: string) => {
      const response = await this.getInstance('PAYMENT_SERVICE').get(`/transactions/${id}`);
      return response.data;
    },

    // Create transaction
    createTransaction: async (transactionData: any) => {
      const response = await this.getInstance('PAYMENT_SERVICE').post('/transactions', transactionData);
      return response.data;
    },

    // Update transaction
    updateTransaction: async (id: string, transactionData: any) => {
      const response = await this.getInstance('PAYMENT_SERVICE').put(`/transactions/${id}`, transactionData);
      return response.data;
    },

    // Delete transaction
    deleteTransaction: async (id: string) => {
      const response = await this.getInstance('PAYMENT_SERVICE').delete(`/transactions/${id}`);
      return response.data;
    },

    // Process refund
    processRefund: async (refundData: any) => {
      const response = await this.getInstance('PAYMENT_SERVICE').post('/refunds', refundData);
      return response.data;
    },

    // Get refunds
    getRefunds: async () => {
      const response = await this.getInstance('PAYMENT_SERVICE').get('/refunds');
      return response.data;
    },

    // Get refund by ID
    getRefund: async (id: string) => {
      const response = await this.getInstance('PAYMENT_SERVICE').get(`/refunds/${id}`);
      return response.data;
    },

    // Update refund
    updateRefund: async (id: string, refundData: any) => {
      const response = await this.getInstance('PAYMENT_SERVICE').put(`/refunds/${id}`, refundData);
      return response.data;
    },

    // Delete refund
    deleteRefund: async (id: string) => {
      const response = await this.getInstance('PAYMENT_SERVICE').delete(`/refunds/${id}`);
      return response.data;
    },

    // Get subscriptions
    getSubscriptions: async () => {
      const response = await this.getInstance('PAYMENT_SERVICE').get('/subscriptions');
      return response.data;
    },

    // Create subscription
    createSubscription: async (subscriptionData: any) => {
      const response = await this.getInstance('PAYMENT_SERVICE').post('/subscriptions', subscriptionData);
      return response.data;
    },

    // Update subscription
    updateSubscription: async (id: string, subscriptionData: any) => {
      const response = await this.getInstance('PAYMENT_SERVICE').put(`/subscriptions/${id}`, subscriptionData);
      return response.data;
    },

    // Delete subscription
    deleteSubscription: async (id: string) => {
      const response = await this.getInstance('PAYMENT_SERVICE').delete(`/subscriptions/${id}`);
      return response.data;
    },

    // Get payment gateways
    getPaymentGateways: async () => {
      const response = await this.getInstance('PAYMENT_SERVICE').get('/gateways');
      return response.data;
    },

    // Create payment gateway
    createPaymentGateway: async (gatewayData: any) => {
      const response = await this.getInstance('PAYMENT_SERVICE').post('/gateways', gatewayData);
      return response.data;
    },

    // Update payment gateway
    updatePaymentGateway: async (id: string, gatewayData: any) => {
      const response = await this.getInstance('PAYMENT_SERVICE').put(`/gateways/${id}`, gatewayData);
      return response.data;
    },

    // Delete payment gateway
    deletePaymentGateway: async (id: string) => {
      const response = await this.getInstance('PAYMENT_SERVICE').delete(`/gateways/${id}`);
      return response.data;
    },
  };

  // i18n Service API
  i18n = {
    // Get supported languages
    getSupportedLanguages: async () => {
      const response = await this.getInstance('I18N_SERVICE').get('/languages');
      return response.data;
    },

    // Get Indian languages
    getIndianLanguages: async (filters: any = {}) => {
      const response = await this.getInstance('I18N_SERVICE').get('/languages/indian', {
        params: filters,
      });
      return response.data;
    },

    // Translate text
    translateText: async (text: string, targetLanguage: string, sourceLanguage?: string) => {
      const response = await this.getInstance('I18N_SERVICE').post('/translate', {
        text,
        targetLanguage,
        sourceLanguage,
      });
      return response.data;
    },

    // Detect language
    detectLanguage: async (text: string) => {
      const response = await this.getInstance('I18N_SERVICE').post('/detect', {
        text,
      });
    return response.data;
    },

    // Get translations
    getTranslations: async (filters: any = {}) => {
      const response = await this.getInstance('I18N_SERVICE').get('/translations', {
        params: filters,
      });
      return response.data;
    },

    // Create translation
    createTranslation: async (translationData: any) => {
      const response = await this.getInstance('I18N_SERVICE').post('/translations', translationData);
      return response.data;
    },

    // Update translation
    updateTranslation: async (id: string, translationData: any) => {
      const response = await this.getInstance('I18N_SERVICE').put(`/translations/${id}`, translationData);
      return response.data;
    },

    // Delete translation
    deleteTranslation: async (id: string) => {
      const response = await this.getInstance('I18N_SERVICE').delete(`/translations/${id}`);
      return response.data;
    },

    // Get translation requests
    getTranslationRequests: async () => {
      const response = await this.getInstance('I18N_SERVICE').get('/requests');
      return response.data;
    },

    // Create translation request
    createTranslationRequest: async (requestData: any) => {
      const response = await this.getInstance('I18N_SERVICE').post('/requests', requestData);
      return response.data;
    },

    // Update translation request
    updateTranslationRequest: async (id: string, requestData: any) => {
      const response = await this.getInstance('I18N_SERVICE').put(`/requests/${id}`, requestData);
      return response.data;
    },

    // Delete translation request
    deleteTranslationRequest: async (id: string) => {
      const response = await this.getInstance('I18N_SERVICE').delete(`/requests/${id}`);
      return response.data;
    },

    // Get language detection history
    getLanguageDetectionHistory: async (filters: any = {}) => {
      const response = await this.getInstance('I18N_SERVICE').get('/detection-history', {
        params: filters,
      });
      return response.data;
    },

    // Get localization metrics
    getLocalizationMetrics: async () => {
      const response = await this.getInstance('I18N_SERVICE').get('/metrics');
      return response.data;
    },
  };
}

// Create and export API service instance
const apiService = new ApiService();
export default apiService;

// Export individual service APIs for convenience
export const {
  ai,
  analytics,
  automation,
  communication,
  crm,
  dataPipeline,
  faceRecognition,
  ml,
  notification,
  payment,
  i18n,
} = apiService;

// Export the main instance as apiService for backward compatibility
export { apiService };