/**
 * Usage Analytics Page
 * 
 * Detailed analytics and reports for credit usage
 * Phase 6 - Sprint 4: Credit Management
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  GridLegacy as Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchCreditAnalytics,
  fetchCreditUsageStats,
  generateCreditReport,
} from '../../store/slices/creditSlice';

const UsageAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [period, setPeriod] = useState<string>('month');
  const [generatingReport, setGeneratingReport] = useState(false);

  const { analytics, usage } = useAppSelector((state) => state.credit);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = () => {
    dispatch(fetchCreditAnalytics(period));
    dispatch(fetchCreditUsageStats({}));
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      await dispatch(
        generateCreditReport({
          reportType: period === 'month' ? 'monthly' : 'weekly',
        })
      ).unwrap();
      alert('Report generated successfully!');
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const getPercentageColor = (value: number) => {
    if (value > 0) return 'success.main';
    if (value < 0) return 'error.main';
    return 'text.secondary';
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/credits')} sx={{ mb: 2 }}>
            Back to Dashboard
          </Button>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📊 Usage Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Detailed insights into your credit usage
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Period</InputLabel>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)} label="Period">
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleGenerateReport}
            disabled={generatingReport}
          >
            {generatingReport ? 'Generating...' : 'Generate Report'}
          </Button>
        </Box>
      </Box>

      {analytics.loading ? (
        <LinearProgress />
      ) : analytics.data ? (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Purchases
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {analytics.data.purchases.total.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {analytics.data.purchases.count} transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Usage
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {usage.stats?.total.credits.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    credits consumed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Cost
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(analytics.data.purchases.amount)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    spent on credits
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Utilization Rate
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {analytics.data.efficiency.utilizationRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    credit efficiency
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Usage Breakdown */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📱 SMS Analytics
                  </Typography>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Credits Used</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {usage.stats?.sms.used.toLocaleString() || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Messages Sent</Typography>
                      <Typography variant="h6">{usage.stats?.sms.count.toLocaleString() || 0}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Total Cost</Typography>
                      <Typography variant="h6">{formatCurrency(usage.stats?.sms.cost || 0)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Avg Cost/SMS</Typography>
                      <Typography variant="h6">
                        {formatCurrency(usage.stats?.sms.avgCostPerSMS || 0)}
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      usage.stats
                        ? (usage.stats.sms.used /
                            (usage.stats.sms.used + usage.stats.whatsapp.used)) *
                          100
                        : 0
                    }
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    💬 WhatsApp Analytics
                  </Typography>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Credits Used</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {usage.stats?.whatsapp.used.toLocaleString() || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Messages Sent</Typography>
                      <Typography variant="h6">
                        {usage.stats?.whatsapp.count.toLocaleString() || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Total Cost</Typography>
                      <Typography variant="h6">
                        {formatCurrency(usage.stats?.whatsapp.cost || 0)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Avg Cost/Message</Typography>
                      <Typography variant="h6">
                        {formatCurrency(usage.stats?.whatsapp.avgCostPerMessage || 0)}
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      usage.stats
                        ? (usage.stats.whatsapp.used /
                            (usage.stats.sms.used + usage.stats.whatsapp.used)) *
                          100
                        : 0
                    }
                    sx={{ height: 8, borderRadius: 4 }}
                    color="secondary"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Projections */}
          {analytics.data.projections && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🔮 Projections & Recommendations
                </Typography>
                <Grid container spacing={2} mt={1}>
                  {analytics.data.projections.smsRunoutDate && (
                    <Grid item xs={12} md={4}>
                      <Box p={2} bgcolor="warning.50" borderRadius={1}>
                        <Typography variant="body2" color="text.secondary">
                          SMS Credits Run-out
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {new Date(analytics.data.projections.smsRunoutDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Estimated based on current usage
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {analytics.data.projections.whatsappRunoutDate && (
                    <Grid item xs={12} md={4}>
                      <Box p={2} bgcolor="warning.50" borderRadius={1}>
                        <Typography variant="body2" color="text.secondary">
                          WhatsApp Credits Run-out
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {new Date(
                            analytics.data.projections.whatsappRunoutDate
                          ).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Estimated based on current usage
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {analytics.data.projections.recommendedTopup && (
                    <Grid item xs={12} md={4}>
                      <Box p={2} bgcolor="info.50" borderRadius={1}>
                        <Typography variant="body2" color="text.secondary">
                          Recommended Top-up
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {analytics.data.projections.recommendedTopup.toLocaleString()} credits
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ mt: 1 }}
                          onClick={() => navigate('/credits/purchase')}
                        >
                          Buy Now
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Usage by Purpose */}
          {usage.stats?.byPurpose && usage.stats.byPurpose.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📈 Usage by Purpose
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Purpose</TableCell>
                        <TableCell align="right">SMS Count</TableCell>
                        <TableCell align="right">WhatsApp Count</TableCell>
                        <TableCell align="right">Total Credits</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usage.stats.byPurpose.map((purpose) => (
                        <TableRow key={purpose.purpose}>
                          <TableCell component="th" scope="row">
                            {purpose.purpose}
                          </TableCell>
                          <TableCell align="right">{purpose.smsCount.toLocaleString()}</TableCell>
                          <TableCell align="right">{purpose.whatsappCount.toLocaleString()}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {purpose.totalCredits.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={`${purpose.percentage.toFixed(1)}%`} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent>
            <Typography color="text.secondary" textAlign="center" py={4}>
              No analytics data available for the selected period
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default UsageAnalyticsPage;

