import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  GridLegacy as Grid,
  Switch,
  Slider,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Tooltip,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Lightbulb as LightIcon,
  AcUnit as AcIcon,
  Power as PowerIcon,
  Wifi as WifiIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingIcon,
  Nature as EcoIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Thermostat as ThermostatIcon,
  ElectricBolt as ElectricIcon,
  SmartToy as SmartIcon,
  Home as HomeIcon,
  PhoneAndroid as PhoneIcon,
  CloudSync as CloudIcon,
  Rule as RuleIcon,
  Analytics as AnalyticsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-toastify';

// Types and Interfaces
interface IoTDevice {
  id: string;
  name: string;
  type: 'light' | 'ac' | 'fan' | 'plug' | 'sensor' | 'camera' | 'lock';
  status: 'online' | 'offline' | 'error';
  zone: string;
  powerConsumption: number;
  lastSeen: string;
  settings: {
    brightness?: number;
    temperature?: number;
    speed?: number;
    isOn: boolean;
  };
  automationRules: string[];
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: 'occupancy' | 'time' | 'event' | 'sensor';
  condition: string;
  action: string;
  devices: string[];
  isActive: boolean;
  lastTriggered?: string;
}

interface EnergyData {
  timestamp: string;
  consumption: number;
  cost: number;
  devices: { [deviceId: string]: number };
}

interface Zone {
  id: string;
  name: string;
  devices: IoTDevice[];
  totalPowerConsumption: number;
  occupancy: number;
  temperature: number;
  lighting: number;
}

// Mock Data
const mockDevices: IoTDevice[] = [
  {
    id: 'light-001',
    name: 'Main Hall Lights',
    type: 'light',
    status: 'online',
    zone: 'Study Hall A',
    powerConsumption: 45,
    lastSeen: new Date().toISOString(),
    settings: { brightness: 80, isOn: true },
    automationRules: ['auto-brightness', 'motion-sensor']
  },
  {
    id: 'ac-001',
    name: 'Study Hall AC',
    type: 'ac',
    status: 'online',
    zone: 'Study Hall A',
    powerConsumption: 1200,
    lastSeen: new Date().toISOString(),
    settings: { temperature: 24, isOn: true },
    automationRules: ['temp-control', 'occupancy-based']
  },
  {
    id: 'plug-001',
    name: 'Charging Station',
    type: 'plug',
    status: 'online',
    zone: 'Study Hall A',
    powerConsumption: 15,
    lastSeen: new Date().toISOString(),
    settings: { isOn: true },
    automationRules: ['scheduled-power']
  },
  {
    id: 'sensor-001',
    name: 'Motion Sensor',
    type: 'sensor',
    status: 'online',
    zone: 'Study Hall A',
    powerConsumption: 2,
    lastSeen: new Date().toISOString(),
    settings: { isOn: true },
    automationRules: []
  }
];

const mockZones: Zone[] = [
  {
    id: 'zone-001',
    name: 'Study Hall A',
    devices: mockDevices,
    totalPowerConsumption: 1262,
    occupancy: 8,
    temperature: 24,
    lighting: 80
  },
  {
    id: 'zone-002',
    name: 'Study Hall B',
    devices: [],
    totalPowerConsumption: 0,
    occupancy: 0,
    temperature: 26,
    lighting: 0
  }
];

const mockAutomationRules: AutomationRule[] = [
  {
    id: 'rule-001',
    name: 'Auto Lights on Motion',
    trigger: 'occupancy',
    condition: 'motion_detected = true',
    action: 'turn_on_lights',
    devices: ['light-001'],
    isActive: true,
    lastTriggered: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: 'rule-002',
    name: 'Temperature Control',
    trigger: 'sensor',
    condition: 'temperature > 26',
    action: 'turn_on_ac',
    devices: ['ac-001'],
    isActive: true,
    lastTriggered: new Date(Date.now() - 600000).toISOString()
  }
];

const mockEnergyData: EnergyData[] = [
  { timestamp: '00:00', consumption: 1200, cost: 8.4, devices: { 'light-001': 45, 'ac-001': 1200 } },
  { timestamp: '04:00', consumption: 800, cost: 5.6, devices: { 'light-001': 20, 'ac-001': 800 } },
  { timestamp: '08:00', consumption: 1500, cost: 10.5, devices: { 'light-001': 80, 'ac-001': 1200 } },
  { timestamp: '12:00', consumption: 1800, cost: 12.6, devices: { 'light-001': 80, 'ac-001': 1200 } },
  { timestamp: '16:00', consumption: 1600, cost: 11.2, devices: { 'light-001': 70, 'ac-001': 1200 } },
  { timestamp: '20:00', consumption: 1400, cost: 9.8, devices: { 'light-001': 60, 'ac-001': 1200 } },
];

const SmartIoTDashboard: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [devices, setDevices] = useState<IoTDevice[]>(mockDevices);
  const [zones, setZones] = useState<Zone[]>(mockZones);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(mockAutomationRules);
  const [energyData, setEnergyData] = useState<EnergyData[]>(mockEnergyData);
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AutomationRule>>({});

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prev => prev.map(device => ({
        ...device,
        lastSeen: new Date().toISOString(),
        powerConsumption: device.powerConsumption + (Math.random() - 0.5) * 10
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDeviceToggle = (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, settings: { ...device.settings, isOn: !device.settings.isOn } }
        : device
    ));
    toast.success('Device status updated');
  };

  const handleDeviceSettingChange = (deviceId: string, setting: string, value: number) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, settings: { ...device.settings, [setting]: value } }
        : device
    ));
  };

  const handleCreateRule = () => {
    if (newRule.name && newRule.trigger && newRule.condition && newRule.action) {
      const rule: AutomationRule = {
        id: `rule-${Date.now()}`,
        name: newRule.name,
        trigger: newRule.trigger as any,
        condition: newRule.condition,
        action: newRule.action,
        devices: newRule.devices || [],
        isActive: true
      };
      setAutomationRules(prev => [...prev, rule]);
      setNewRule({});
      setRuleDialogOpen(false);
      toast.success('Automation rule created');
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'light': return <LightIcon />;
      case 'ac': return <AcIcon />;
      case 'fan': return <PowerIcon />;
      case 'plug': return <PowerIcon />;
      case 'sensor': return <SecurityIcon />;
      case 'camera': return <SecurityIcon />;
      case 'lock': return <SecurityIcon />;
      default: return <SmartIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'error': return 'warning';
      default: return 'default';
    }
  };

  const totalPowerConsumption = devices.reduce((sum, device) => sum + device.powerConsumption, 0);
  const onlineDevices = devices.filter(device => device.status === 'online').length;
  const activeRules = automationRules.filter(rule => rule.isActive).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            🏠 Smart IoT Control Center
          </Typography>
          <Typography variant="body2" color="text.secondary">
            WiFi-controlled electrical appliance management and automation
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setDeviceDialogOpen(true)}
          >
            Add Device
          </Button>
          <Button
            variant="contained"
            startIcon={<RuleIcon />}
            onClick={() => setRuleDialogOpen(true)}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
              }
            }}
          >
            Create Rule
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Devices
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {devices.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <SmartIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={`${onlineDevices} Online`} 
                  color="success" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Power Consumption
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {totalPowerConsumption.toFixed(0)}W
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <ElectricIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="Real-time" 
                  color="info" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Rules
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {activeRules}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <RuleIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="Automation" 
                  color="success" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Energy Savings
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    23%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <EcoIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="This Month" 
                  color="info" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Device Control" icon={<SmartIcon />} />
            <Tab label="Zone Management" icon={<HomeIcon />} />
            <Tab label="Automation Rules" icon={<RuleIcon />} />
            <Tab label="Energy Analytics" icon={<AnalyticsIcon />} />
            <Tab label="Integrations" icon={<CloudIcon />} />
          </Tabs>
        </Box>

        <CardContent>
          {/* Device Control Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {devices.map((device) => (
                <Grid item xs={12} sm={6} md={4} key={device.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { 
                        boxShadow: theme.shadows[4] 
                      }
                    }}
                    onClick={() => {
                      setSelectedDevice(device);
                      setDeviceDialogOpen(true);
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getDeviceIcon(device.type)}
                          <Typography variant="h6" fontWeight={600}>
                            {device.name}
                          </Typography>
                        </Box>
                        <Chip 
                          label={device.status} 
                          color={getStatusColor(device.status) as any}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Zone: {device.zone}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Power: {device.powerConsumption.toFixed(0)}W
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Switch
                          checked={device.settings.isOn}
                          onChange={() => handleDeviceToggle(device.id)}
                          color="primary"
                        />
                        <Typography variant="body2">
                          {device.settings.isOn ? 'ON' : 'OFF'}
                        </Typography>
                      </Box>

                      {device.type === 'light' && device.settings.brightness !== undefined && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            Brightness: {device.settings.brightness}%
                          </Typography>
                          <Slider
                            value={device.settings.brightness}
                            onChange={(e, value) => handleDeviceSettingChange(device.id, 'brightness', value as number)}
                            disabled={!device.settings.isOn}
                            size="small"
                          />
                        </Box>
                      )}

                      {device.type === 'ac' && device.settings.temperature !== undefined && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            Temperature: {device.settings.temperature}°C
                          </Typography>
                          <Slider
                            value={device.settings.temperature}
                            onChange={(e, value) => handleDeviceSettingChange(device.id, 'temperature', value as number)}
                            min={16}
                            max={30}
                            disabled={!device.settings.isOn}
                            size="small"
                          />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Zone Management Tab */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              {zones.map((zone) => (
                <Grid item xs={12} md={6} key={zone.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {zone.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Chip 
                          icon={<ElectricIcon />}
                          label={`${zone.totalPowerConsumption}W`}
                          color="warning"
                        />
                        <Chip 
                          icon={<ThermostatIcon />}
                          label={`${zone.temperature}°C`}
                          color="info"
                        />
                        <Chip 
                          label={`${zone.occupancy} people`}
                          color="success"
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          Lighting Level
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={zone.lighting} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {zone.lighting}%
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Devices in this zone:
                      </Typography>
                      <List dense>
                        {zone.devices.map((device) => (
                          <ListItem key={device.id} sx={{ px: 0 }}>
                            <ListItemIcon>
                              {getDeviceIcon(device.type)}
                            </ListItemIcon>
                            <ListItemText 
                              primary={device.name}
                              secondary={`${device.powerConsumption}W`}
                            />
                            <ListItemSecondaryAction>
                              <Switch
                                checked={device.settings.isOn}
                                onChange={() => handleDeviceToggle(device.id)}
                                size="small"
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Automation Rules Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Automation Rules
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setRuleDialogOpen(true)}
                >
                  Create Rule
                </Button>
              </Box>

              <Grid container spacing={3}>
                {automationRules.map((rule) => (
                  <Grid item xs={12} md={6} key={rule.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {rule.name}
                          </Typography>
                          <Switch
                            checked={rule.isActive}
                            onChange={() => {
                              setAutomationRules(prev => prev.map(r => 
                                r.id === rule.id ? { ...r, isActive: !r.isActive } : r
                              ));
                            }}
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Chip 
                            label={rule.trigger}
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip 
                            label={rule.isActive ? 'Active' : 'Inactive'}
                            color={rule.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Condition:</strong> {rule.condition}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Action:</strong> {rule.action}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Devices:</strong> {rule.devices.length} device(s)
                        </Typography>

                        {rule.lastTriggered && (
                          <Typography variant="caption" color="text.secondary">
                            Last triggered: {new Date(rule.lastTriggered).toLocaleString()}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Energy Analytics Tab */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Energy Consumption (24h)
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={energyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line 
                          type="monotone" 
                          dataKey="consumption" 
                          stroke={theme.palette.primary.main}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Device Power Usage
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={devices.map(device => ({
                            name: device.name,
                            value: device.powerConsumption
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {devices.map((device, index) => (
                            <Cell key={`cell-${index}`} fill={theme.palette.primary.main} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Energy Cost Analysis
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={energyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="cost" fill={theme.palette.success.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Integrations Tab */}
          {activeTab === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        <WifiIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        Smart Life/Tuya Platform
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Connect your Tuya-compatible smart devices for seamless control.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip label="Connected" color="success" sx={{ mr: 1 }} />
                      <Chip label="12 devices" color="info" />
                    </Box>
                    <Button variant="outlined" sx={{ mt: 2 }}>
                      Manage Integration
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                        <HomeIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        Google Home
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Voice control integration with Google Assistant.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip label="Connected" color="success" sx={{ mr: 1 }} />
                      <Chip label="8 devices" color="info" />
                    </Box>
                    <Button variant="outlined" sx={{ mt: 2 }}>
                      Manage Integration
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                        <PhoneIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        Amazon Alexa
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Voice control integration with Amazon Alexa.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip label="Not Connected" color="default" sx={{ mr: 1 }} />
                    </Box>
                    <Button variant="contained" sx={{ mt: 2 }}>
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                        <CloudIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        IFTTT Automation
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Create custom automation workflows with IFTTT.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip label="Connected" color="success" sx={{ mr: 1 }} />
                      <Chip label="5 applets" color="info" />
                    </Box>
                    <Button variant="outlined" sx={{ mt: 2 }}>
                      Manage Applets
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Device Settings Dialog */}
      <Dialog open={deviceDialogOpen} onClose={() => setDeviceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Device Settings
          {selectedDevice && ` - ${selectedDevice.name}`}
        </DialogTitle>
        <DialogContent>
          {selectedDevice && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography>Power</Typography>
                    <Switch
                      checked={selectedDevice.settings.isOn}
                      onChange={() => handleDeviceToggle(selectedDevice.id)}
                    />
                  </Box>
                </Grid>

                {selectedDevice.type === 'light' && selectedDevice.settings.brightness !== undefined && (
                  <Grid item xs={12}>
                    <Typography gutterBottom>Brightness</Typography>
                    <Slider
                      value={selectedDevice.settings.brightness}
                      onChange={(e, value) => handleDeviceSettingChange(selectedDevice.id, 'brightness', value as number)}
                      disabled={!selectedDevice.settings.isOn}
                    />
                  </Grid>
                )}

                {selectedDevice.type === 'ac' && selectedDevice.settings.temperature !== undefined && (
                  <Grid item xs={12}>
                    <Typography gutterBottom>Temperature</Typography>
                    <Slider
                      value={selectedDevice.settings.temperature}
                      onChange={(e, value) => handleDeviceSettingChange(selectedDevice.id, 'temperature', value as number)}
                      min={16}
                      max={30}
                      disabled={!selectedDevice.settings.isOn}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeviceDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Automation Rule Dialog */}
      <Dialog open={ruleDialogOpen} onClose={() => setRuleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Automation Rule</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Rule Name"
                  value={newRule.name || ''}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Trigger Type</InputLabel>
                  <Select
                    value={newRule.trigger || ''}
                    onChange={(e) => setNewRule({ ...newRule, trigger: e.target.value })}
                  >
                    <MenuItem value="occupancy">Occupancy</MenuItem>
                    <MenuItem value="time">Time-based</MenuItem>
                    <MenuItem value="event">Event</MenuItem>
                    <MenuItem value="sensor">Sensor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Condition"
                  value={newRule.condition || ''}
                  onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                  placeholder="e.g., motion_detected = true"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Action"
                  value={newRule.action || ''}
                  onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                  placeholder="e.g., turn_on_lights"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Target Devices</InputLabel>
                  <Select
                    multiple
                    value={newRule.devices || []}
                    onChange={(e) => setNewRule({ ...newRule, devices: e.target.value as string[] })}
                  >
                    {devices.map((device) => (
                      <MenuItem key={device.id} value={device.id}>
                        {device.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRuleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRule} variant="contained">
            Create Rule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SmartIoTDashboard;
