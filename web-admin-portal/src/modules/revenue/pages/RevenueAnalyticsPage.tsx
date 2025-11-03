import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  FileDownload,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  People,
  Assessment,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppDispatch } from '../../../hooks/redux';
import { showError, showSuccess } from '../../../store/slices/uiSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock cohort data
const COHORT_DATA = [
  {
    cohort: 'Jan 2024',
    month0: 100,
    month1: 95,
    month2: 92,
    month3: 88,
    month4: 85,
    month5: 82,
  },
  {
    cohort: 'Feb 2024',
    month0: 100,
    month1: 96,
    month2: 93,
    month3: 90,
    month4: 87,
    month5: 0,
  },
  {
    cohort: 'Mar 2024',
    month0: 100,
    month1: 97,
    month2: 94,
    month3: 91,
    month4: 0,
    month5: 0,
  },
  {
    cohort: 'Apr 2024',
    month0: 100,
    month1: 96,
    month2: 93,
    month3: 0,
    month4: 0,
    month5: 0,
  },
  {
    cohort: 'May 2024',
    month0: 100,
    month1: 98,
    month2: 0,
    month3: 0,
    month4: 0,
    month5: 0,
  },
  {
    cohort: 'Jun 2024',
    month0: 100,
    month1: 0,
    month2: 0,
    month3: 0,
    month4: 0,
    month5: 0,
  },
];

// Mock forecast data
const FORECAST_DATA = [
  { month: 'Oct 2024', actual: 4850000, forecast: 4850000 },
  { month: 'Nov 2024', actual: 0, forecast: 5100000 },
  { month: 'Dec 2024', actual: 0, forecast: 5400000 },
  { month: 'Jan 2025', actual: 0, forecast: 5700000 },
  { month: 'Feb 2025', actual: 0, forecast: 6000000 },
  { month: 'Mar 2025', actual: 0, forecast: 6300000 },
];

// Mock customer segments
const SEGMENT_DATA = [
  { segment: 'Free Tier', customers: 125, mrr: 0, arpu: 0, ltv: 0 },
  { segment: 'Starter', customers: 85, mrr: 254915, arpu: 2999, ltv: 71976 },
  { segment: 'Professional', customers: 45, mrr: 449955, arpu: 9999, ltv: 239976 },
  { segment: 'Enterprise', customers: 12, mrr: 299988, arpu: 24999, ltv: 599976 },
];

const RevenueAnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Data is mocked above
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred.';
      setError(errorMsg);
      dispatch(showError(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    dispatch(showSuccess(`Exporting analytics as ${format.toUpperCase()}...`));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCohortColor = (value: number) => {
    if (value === 0) return '#f5f5f5';
    if (value >= 95) return '#4caf50';
    if (value >= 90) return '#8bc34a';
    if (value >= 85) return '#ffeb3b';
    if (value >= 80) return '#ff9800';
    return '#f44336';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Revenue Analytics...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        <Typography variant="h6">Error Loading Analytics</Typography>
        <Typography>{error}</Typography>
      </Alert>
    );
  }

  const totalCustomers = SEGMENT_DATA.reduce((sum, s) => sum + s.customers, 0);
  const totalMRR = SEGMENT_DATA.reduce((sum, s) => sum + s.mrr, 0);
  const avgARPU =
    SEGMENT_DATA.reduce((sum, s) => sum + s.arpu * s.customers, 0) / totalCustomers;
  const avgLTV = SEGMENT_DATA.reduce((sum, s) => sum + s.ltv * s.customers, 0) / totalCustomers;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Revenue Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Advanced metrics, forecasting, and cohort analysis
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={() => handleExport('pdf')}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 4,
        }}
      >
        <Paper elevation={1} sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <People sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Total Customers
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={600}>
            {totalCustomers}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <AttachMoney sx={{ fontSize: 20, color: 'success.main', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Total MRR
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={600}>
            {formatCurrency(totalMRR)}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <TrendingUp sx={{ fontSize: 20, color: 'info.main', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Avg ARPU
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={600}>
            {formatCurrency(avgARPU)}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <Assessment sx={{ fontSize: 20, color: 'warning.main', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Avg LTV
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={600}>
            {formatCurrency(45000)}
          </Typography>
        </Paper>
      </Box>

      {/* Charts Section */}
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Revenue Forecast
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Advanced analytics and forecasting coming soon...
        </Typography>
      </Paper>
    </Box>
  );
};

export default RevenueAnalyticsPage;
