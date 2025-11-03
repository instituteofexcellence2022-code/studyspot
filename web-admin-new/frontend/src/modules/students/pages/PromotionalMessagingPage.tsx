// ============================================
// PROMOTIONAL MESSAGING - BULK STUDENT OUTREACH
// Platform-wide marketing campaigns
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Checkbox,
  FormGroup,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Send,
  Sms,
  WhatsApp,
  Email as EmailIcon,
  People,
  FilterList,
  Schedule,
  SaveAlt,
  Visibility,
  Edit,
  Delete,
  PlayArrow,
} from '@mui/icons-material';

const PromotionalMessagingPage: React.FC = () => {
  const [channel, setChannel] = useState('whatsapp');
  const [segmentType, setSegmentType] = useState('all');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  // Audience Segments
  const segments = {
    all: { count: 12847, cost: 12847 * 0.25 },
    active: { count: 11234, cost: 11234 * 0.25 },
    inactive: { count: 1613, cost: 1613 * 0.25 },
    highValue: { count: 2567, cost: 2567 * 0.25 },
    churnRisk: { count: 456, cost: 456 * 0.25 },
    newUsers: { count: 845, cost: 845 * 0.25 },
    byCity: {
      mumbai: { count: 3567, cost: 3567 * 0.25 },
      delhi: { count: 2845, cost: 2845 * 0.25 },
      bangalore: { count: 2234, cost: 2234 * 0.25 },
    },
    byMembership: {
      annual: { count: 4856, cost: 4856 * 0.25 },
      quarterly: { count: 3589, cost: 3589 * 0.25 },
      monthly: { count: 3214, cost: 3214 * 0.25 },
      trial: { count: 1188, cost: 1188 * 0.25 },
    },
  };

  // Campaign Templates
  const templates = [
    {
      id: 1,
      name: 'New Feature Announcement',
      channel: 'whatsapp',
      message: 'Hi {name}, Exciting news! We\'ve just launched face recognition attendance. Book your seat and enjoy hassle-free check-ins! 🎉',
      category: 'promotional',
    },
    {
      id: 2,
      name: 'Referral Program',
      channel: 'sms',
      message: 'Refer a friend & earn ₹500! Share your code: {referral_code}. Your friend gets 20% off too! 🎁',
      category: 'promotional',
    },
    {
      id: 3,
      name: 'Upgrade Promotion',
      channel: 'email',
      subject: 'Upgrade to Annual Plan & Save 30%',
      message: 'Dear {name}, Upgrade to our Annual plan and save ₹3000! Limited time offer. Click here to upgrade.',
      category: 'promotional',
    },
    {
      id: 4,
      name: 'Re-engagement',
      channel: 'whatsapp',
      message: 'Hi {name}, We miss you! Your library is waiting. Book now and get 2 hours free! 📚',
      category: 'reengagement',
    },
  ];

  // Past Campaigns
  const pastCampaigns = [
    { id: 1, name: 'Diwali Offer', date: '2025-10-20', channel: 'WhatsApp', sent: 12000, delivered: 11800, clicked: 3200, converted: 450, revenue: 234000 },
    { id: 2, name: 'Weekend Special', date: '2025-10-15', channel: 'SMS', sent: 8500, delivered: 8400, clicked: 1200, converted: 180, revenue: 89000 },
    { id: 3, name: 'Referral Campaign', date: '2025-10-10', channel: 'Email', sent: 12847, delivered: 12500, clicked: 4500, converted: 890, revenue: 445000 },
  ];

  const getChannelCost = (ch: string, count: number) => {
    const costs = { sms: 0.15, whatsapp: 0.25, email: 0.05 };
    return count * (costs[ch as keyof typeof costs] || 0);
  };

  const getAudienceCount = () => {
    if (segmentType === 'all') return segments.all.count;
    if (segmentType === 'active') return segments.active.count;
    if (segmentType === 'inactive') return segments.inactive.count;
    if (segmentType === 'highValue') return segments.highValue.count;
    if (segmentType === 'churnRisk') return segments.churnRisk.count;
    if (segmentType === 'newUsers') return segments.newUsers.count;
    return 0;
  };

  const estimatedCost = getChannelCost(channel, getAudienceCount());

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          📢 Promotional Messaging
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Send bulk promotional messages to students across all libraries
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Left: Campaign Builder */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Create Campaign
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* Channel Selection */}
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">Select Channel</FormLabel>
                <RadioGroup row value={channel} onChange={(e) => setChannel(e.target.value)}>
                  <FormControlLabel
                    value="sms"
                    control={<Radio />}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Sms />
                        <span>SMS</span>
                        <Chip label="₹0.15/msg" size="small" />
                      </Stack>
                    }
                  />
                  <FormControlLabel
                    value="whatsapp"
                    control={<Radio />}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <WhatsApp />
                        <span>WhatsApp</span>
                        <Chip label="₹0.25/msg" size="small" color="success" />
                      </Stack>
                    }
                  />
                  <FormControlLabel
                    value="email"
                    control={<Radio />}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EmailIcon />
                        <span>Email</span>
                        <Chip label="₹0.05/msg" size="small" color="primary" />
                      </Stack>
                    }
                  />
                </RadioGroup>
              </FormControl>

              {/* Audience Segmentation */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Target Audience</InputLabel>
                <Select
                  value={segmentType}
                  onChange={(e) => setSegmentType(e.target.value)}
                  label="Target Audience"
                  startAdornment={<People sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="all">All Students ({segments.all.count.toLocaleString()})</MenuItem>
                  <MenuItem value="active">Active Students ({segments.active.count.toLocaleString()})</MenuItem>
                  <MenuItem value="inactive">Inactive Students ({segments.inactive.count.toLocaleString()})</MenuItem>
                  <MenuItem value="highValue">High Value ({segments.highValue.count.toLocaleString()})</MenuItem>
                  <MenuItem value="churnRisk">Churn Risk ({segments.churnRisk.count.toLocaleString()})</MenuItem>
                  <MenuItem value="newUsers">New Users ({segments.newUsers.count.toLocaleString()})</MenuItem>
                </Select>
              </FormControl>

              {/* Advanced Filters */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FilterList />
                  <Typography variant="body2">
                    <strong>Advanced Filters:</strong> City, Library, Membership Type, Payment Status, Last Active Date
                  </Typography>
                </Stack>
              </Alert>

              {/* Subject (Email only) */}
              {channel === 'email' && (
                <TextField
                  fullWidth
                  label="Email Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Exclusive Offer: Save 30% on Annual Plans"
                  sx={{ mb: 3 }}
                />
              )}

              {/* Message */}
              <TextField
                fullWidth
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                multiline
                rows={6}
                placeholder="Write your promotional message here...&#10;&#10;Use {name}, {library}, {referral_code} for personalization"
                sx={{ mb: 3 }}
                helperText={`${message.length} characters • Estimated ${getAudienceCount().toLocaleString()} messages`}
              />

              {/* Schedule */}
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <TextField
                  label="Schedule Date & Time"
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  InputProps={{
                    startAdornment: <Schedule sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <Button variant="outlined" startIcon={<SaveAlt />}>
                  Save Draft
                </Button>
              </Stack>

              {/* Cost Estimate */}
              <Paper sx={{ p: 2, bgcolor: '#FFF3E0', mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Estimated Cost
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      ₹{estimatedCost.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getAudienceCount().toLocaleString()} messages × ₹{channel === 'sms' ? '0.15' : channel === 'whatsapp' ? '0.25' : '0.05'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Credit Balance
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      ₹45,000
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Remaining after send: ₹{(45000 - estimatedCost).toFixed(2)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Send />}
                  fullWidth
                  disabled={!message}
                >
                  {scheduledDate ? 'Schedule Campaign' : 'Send Now'}
                </Button>
                <Button variant="outlined" startIcon={<Visibility />}>
                  Preview
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Past Campaigns */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Campaign Performance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell><strong>Campaign</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Channel</strong></TableCell>
                      <TableCell align="right"><strong>Sent</strong></TableCell>
                      <TableCell align="right"><strong>Delivered</strong></TableCell>
                      <TableCell align="right"><strong>Clicked</strong></TableCell>
                      <TableCell align="right"><strong>Converted</strong></TableCell>
                      <TableCell align="right"><strong>Revenue</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pastCampaigns.map((campaign) => (
                      <TableRow key={campaign.id} hover>
                        <TableCell>{campaign.name}</TableCell>
                        <TableCell>{campaign.date}</TableCell>
                        <TableCell>
                          <Chip label={campaign.channel} size="small" />
                        </TableCell>
                        <TableCell align="right">{campaign.sent.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          {campaign.delivered.toLocaleString()} ({((campaign.delivered / campaign.sent) * 100).toFixed(1)}%)
                        </TableCell>
                        <TableCell align="right">
                          {campaign.clicked.toLocaleString()} ({((campaign.clicked / campaign.delivered) * 100).toFixed(1)}%)
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {campaign.converted} ({((campaign.converted / campaign.clicked) * 100).toFixed(1)}%)
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            ₹{(campaign.revenue / 1000).toFixed(0)}K
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Right: Templates & Quick Actions */}
      <Box>
          {/* Quick Stats */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Campaign Stats (This Month)
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Total Sent
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      33,347
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Delivery Rate
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      97.8%
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Click Rate
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      27.2%
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Conversion Rate
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="warning.main">
                      5.1%
                    </Typography>
                  </Stack>
                </Box>
                <Divider />
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      ₹7.68L
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    ROI: 1,540% (₹15.40 per ₹1 spent)
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Message Templates */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Message Templates
              </Typography>
              <Typography variant="caption" color="text.secondary" paragraph>
                Pre-approved promotional templates
              </Typography>
              <Stack spacing={2}>
                {templates.map((template) => (
                  <Paper key={template.id} sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {template.name}
                      </Typography>
                      <Chip
                        label={template.channel.toUpperCase()}
                        size="small"
                        color={template.channel === 'whatsapp' ? 'success' : 'primary'}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {template.message.substring(0, 80)}...
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Use Template">
                        <IconButton size="small" color="primary">
                          <PlayArrow fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default PromotionalMessagingPage;

