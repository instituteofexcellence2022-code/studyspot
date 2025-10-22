import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Paper,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  LocationOn,
  People,
  Wifi,
  AcUnit,
  LocalParking,
  Restaurant,
  Print,
  MeetingRoom,
  VolumeOff,
  Groups,
  BatteryChargingFull,
  Accessibility,
  Edit,
  EventSeat,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchLibraryById, fetchLibrarySeats } from '../../store/slices/librarySlice';
import { ROUTES } from '../../constants';
import { Library, LibraryStatus } from '../../types';

interface LibraryDetailsProps {
  libraryId: string;
}

const LibraryDetails: React.FC<LibraryDetailsProps> = ({ libraryId }) => {
  const dispatch = useAppDispatch();
  const { selectedLibrary, librarySeats, isLoading, error } = useAppSelector((state) => state.library);

  useEffect(() => {
    dispatch(fetchLibraryById(libraryId));
    dispatch(fetchLibrarySeats(libraryId));
  }, [dispatch, libraryId]);

  const getStatusColor = (status: LibraryStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'maintenance':
        return 'warning';
      case 'closed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi':
        return <Wifi />;
      case 'ac':
        return <AcUnit />;
      case 'parking':
        return <LocalParking />;
      case 'cafeteria':
        return <Restaurant />;
      case 'printer':
        return <Print />;
      case 'studyRooms':
        return <MeetingRoom />;
      case 'quietZone':
        return <VolumeOff />;
      case 'groupStudyArea':
        return <Groups />;
      case 'chargingStations':
        return <BatteryChargingFull />;
      case 'wheelchairAccessible':
        return <Accessibility />;
      default:
        return null;
    }
  };

  const getAmenityLabel = (amenity: string) => {
    const labels: Record<string, string> = {
      wifi: 'WiFi',
      ac: 'Air Conditioning',
      parking: 'Parking',
      cafeteria: 'Cafeteria',
      printer: 'Printer',
      studyRooms: 'Study Rooms',
      quietZone: 'Quiet Zone',
      groupStudyArea: 'Group Study Area',
      chargingStations: 'Charging Stations',
      wheelchairAccessible: 'Wheelchair Accessible',
    };
    return labels[amenity] || amenity;
  };

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (error || !selectedLibrary) {
    return <Box>Error loading library details</Box>;
  }

  const availableAmenities = Object.entries(selectedLibrary.amenities || {})
    .filter(([, available]) => available)
    .map(([amenity]) => amenity);

  const totalSeats = librarySeats.length;
  const availableSeats = librarySeats.filter(seat => seat.isAvailable).length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {selectedLibrary.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip
              label={selectedLibrary.status}
              color={getStatusColor(selectedLibrary.status) as any}
              size="small"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {selectedLibrary.address}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Edit />}
          href={`${ROUTES.LIBRARY_EDIT.replace(':id', selectedLibrary.id)}`}
        >
          Edit Library
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Library Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <People sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Capacity
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    {selectedLibrary.capacity} seats
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EventSeat sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Current Availability
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    {availableSeats} / {totalSeats} available
                  </Typography>
                </Grid>
                {selectedLibrary.latitude && selectedLibrary.longitude && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOn sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Coordinates
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {selectedLibrary.latitude}, {selectedLibrary.longitude}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pricing
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Hourly Rate
                  </Typography>
                  <Typography variant="h6">
                    ₹{selectedLibrary.pricing?.hourlyRate || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Daily Rate
                  </Typography>
                  <Typography variant="h6">
                    ₹{selectedLibrary.pricing?.dailyRate || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Rate
                  </Typography>
                  <Typography variant="h6">
                    ₹{selectedLibrary.pricing?.monthlyRate || 0}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Amenities */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Amenities
              </Typography>
              {availableAmenities.length > 0 ? (
                <List dense>
                  {availableAmenities.map((amenity) => (
                    <ListItem key={amenity} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {getAmenityIcon(amenity)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={getAmenityLabel(amenity)}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No amenities listed
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Seats
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {totalSeats}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Available Seats
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="success.main">
                    {availableSeats}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Occupancy Rate
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {totalSeats > 0 ? Math.round(((totalSeats - availableSeats) / totalSeats) * 100) : 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LibraryDetails;
