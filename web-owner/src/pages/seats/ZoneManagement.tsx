import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  CardActions,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AcUnit,
  VolumeOff,
  Groups,
  Star,
  EventSeat,
  Speed,
} from '@mui/icons-material';

interface Zone {
  id: string;
  name: string;
  type: string;
  capacity: number;
  currentOccupancy: number;
  color: string;
  priceMultiplier: number;
}

const ZoneManagement: React.FC = () => {
  const [zones] = useState<Zone[]>([
    {
      id: '1',
      name: 'AC Zone - Central Hall',
      type: 'ac',
      capacity: 50,
      currentOccupancy: 35,
      color: '#4CAF50',
      priceMultiplier: 1.5,
    },
    {
      id: '2',
      name: 'Non-AC Zone',
      type: 'non-ac',
      capacity: 80,
      currentOccupancy: 60,
      color: '#FF9800',
      priceMultiplier: 1.0,
    },
    {
      id: '3',
      name: 'Silent Study Zone',
      type: 'quiet',
      capacity: 30,
      currentOccupancy: 25,
      color: '#2196F3',
      priceMultiplier: 1.8,
    },
    {
      id: '4',
      name: 'Premium Executive Zone',
      type: 'premium',
      capacity: 20,
      currentOccupancy: 18,
      color: '#FFD700',
      priceMultiplier: 2.5,
    },
  ]);

  const getZoneIcon = (type: string) => {
    switch (type) {
      case 'ac': return <AcUnit />;
      case 'quiet': return <VolumeOff />;
      case 'group': return <Groups />;
      case 'premium': return <Star />;
      default: return <EventSeat />;
    }
  };

  const stats = useMemo(() => ({
    totalZones: zones.length,
    totalCapacity: zones.reduce((sum, z) => sum + z.capacity, 0),
    totalOccupancy: zones.reduce((sum, z) => sum + z.currentOccupancy, 0),
  }), [zones]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Zone Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Create New Zone
        </Button>
      </Box>

      {/* Statistics */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EventSeat sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4">{stats.totalZones}</Typography>
                <Typography variant="body2" color="text.secondary">Total Zones</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Speed sx={{ fontSize: 40, color: 'success.main' }} />
              <Box>
                <Typography variant="h4">{stats.totalCapacity}</Typography>
                <Typography variant="body2" color="text.secondary">Total Capacity</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EventSeat sx={{ fontSize: 40, color: 'info.main' }} />
              <Box>
                <Typography variant="h4">{stats.totalOccupancy}</Typography>
                <Typography variant="body2" color="text.secondary">Occupied</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* Zone Cards */}
      <Stack spacing={2}>
        {zones.map((zone) => {
          const occupancyPercentage = (zone.currentOccupancy / zone.capacity) * 100;

          return (
            <Card key={zone.id} sx={{ borderLeft: `6px solid ${zone.color}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getZoneIcon(zone.type)}
                    <Typography variant="h6">{zone.name}</Typography>
                  </Box>
                  <Chip label={zone.type.toUpperCase()} size="small" />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Occupancy</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {zone.currentOccupancy} / {zone.capacity}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={occupancyPercentage}
                    color={occupancyPercentage >= 90 ? 'error' : occupancyPercentage >= 70 ? 'warning' : 'success'}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {occupancyPercentage.toFixed(1)}% Utilized
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Price Multiplier: <strong>{zone.priceMultiplier}x</strong>
                </Typography>
              </CardContent>

              <CardActions>
                <Button size="small" startIcon={<EditIcon />}>Edit</Button>
                <Button size="small" color="error" startIcon={<DeleteIcon />}>Delete</Button>
              </CardActions>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
};

export default ZoneManagement;

