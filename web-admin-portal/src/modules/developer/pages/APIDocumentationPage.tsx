// ============================================
// API DOCUMENTATION & DEVELOPER TOOLS PAGE
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Stack,
  Chip,
  Tabs,
  Tab,
  TextField,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import {
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Key as KeyIcon,
  Description as DescriptionIcon,
  Api as ApiIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  auth: boolean;
  parameters?: Array<{ name: string; type: string; required: boolean; description: string }>;
  response: string;
}

const APIDocumentationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [apiKey] = useState('sk_live_51H7xYJKlm9QwerTyUi');
  const [webhookSecret] = useState('whsec_abc123xyz789');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // Mock API endpoints
  const endpoints: Record<string, APIEndpoint[]> = {
    Authentication: [
      {
        method: 'POST',
        path: '/api/v1/auth/login',
        description: 'Authenticate user and receive JWT token',
        auth: false,
        parameters: [
          { name: 'email', type: 'string', required: true, description: 'User email address' },
          { name: 'password', type: 'string', required: true, description: 'User password' },
        ],
        response: '{ "token": "jwt_token", "user": { ... } }',
      },
      {
        method: 'POST',
        path: '/api/v1/auth/refresh',
        description: 'Refresh expired JWT token',
        auth: true,
        parameters: [
          { name: 'refresh_token', type: 'string', required: true, description: 'Refresh token' },
        ],
        response: '{ "token": "new_jwt_token" }',
      },
    ],
    Tenants: [
      {
        method: 'GET',
        path: '/api/v1/tenants',
        description: 'List all tenants',
        auth: true,
        parameters: [
          { name: 'page', type: 'number', required: false, description: 'Page number' },
          { name: 'limit', type: 'number', required: false, description: 'Items per page' },
        ],
        response: '{ "data": [...], "total": 50, "page": 1 }',
      },
      {
        method: 'POST',
        path: '/api/v1/tenants',
        description: 'Create new tenant',
        auth: true,
        parameters: [
          { name: 'name', type: 'string', required: true, description: 'Tenant name' },
          { name: 'plan', type: 'string', required: true, description: 'Subscription plan' },
        ],
        response: '{ "id": "tenant_123", "name": "...", ... }',
      },
      {
        method: 'GET',
        path: '/api/v1/tenants/:id',
        description: 'Get tenant by ID',
        auth: true,
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Tenant ID' },
        ],
        response: '{ "id": "tenant_123", "name": "...", ... }',
      },
    ],
    Users: [
      {
        method: 'GET',
        path: '/api/v1/users',
        description: 'List all users',
        auth: true,
        response: '{ "data": [...], "total": 100 }',
      },
      {
        method: 'POST',
        path: '/api/v1/users',
        description: 'Create new user',
        auth: true,
        parameters: [
          { name: 'email', type: 'string', required: true, description: 'User email' },
          { name: 'name', type: 'string', required: true, description: 'User name' },
          { name: 'role', type: 'string', required: true, description: 'User role' },
        ],
        response: '{ "id": "user_123", "email": "...", ... }',
      },
    ],
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'info';
      case 'POST':
        return 'success';
      case 'PUT':
      case 'PATCH':
        return 'warning';
      case 'DELETE':
        return 'error';
      default:
        return 'default';
    }
  };

  const codeExamples = {
    javascript: `// JavaScript Example
const response = await fetch('https://api.studyspot.com/v1/tenants', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
    
    python: `# Python Example
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.studyspot.com/v1/tenants',
    headers=headers
)

data = response.json()
print(data)`,
    
    curl: `# cURL Example
curl -X GET https://api.studyspot.com/v1/tenants \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            API Documentation & Developer Tools
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete API reference and integration guides
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => toast.info('OpenAPI spec download coming soon')}
          >
            Download OpenAPI
          </Button>
          <Button
            variant="contained"
            startIcon={<CodeIcon />}
            onClick={() => window.open('https://postman.com', '_blank')}
          >
            Postman Collection
          </Button>
        </Stack>
      </Box>

      {/* Quick Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <ApiIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                API Endpoints
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              48
            </Typography>
          </Box>
        </Card>
        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <SpeedIcon color="success" />
              <Typography variant="body2" color="text.secondary">
                Avg Response
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              45ms
            </Typography>
          </Box>
        </Card>
        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <CheckCircleIcon color="info" />
              <Typography variant="body2" color="text.secondary">
                Uptime
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              99.98%
            </Typography>
          </Box>
        </Card>
        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <SecurityIcon color="warning" />
              <Typography variant="body2" color="text.secondary">
                Rate Limit
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              1000/hr
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* Main Content */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_e, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="API Reference" />
          <Tab label="Authentication" />
          <Tab label="Code Examples" />
          <Tab label="Webhooks" />
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                API Reference
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Complete API documentation with all available endpoints.
              </Typography>
              {/* Add API reference content here */}
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Authentication
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Learn how to authenticate your API requests.
              </Typography>
              {/* Add authentication docs here */}
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Code Examples
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Sample code snippets in various programming languages.
              </Typography>
              {/* Add code examples here */}
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Webhooks
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Configure webhooks to receive real-time notifications.
              </Typography>
              {/* Add webhook docs here */}
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default APIDocumentationPage;
