import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Alert,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createLibrary, updateLibrary } from '../../store/slices/librarySlice';
import { showSnackbar } from '../../store/slices/uiSlice';
import { ROUTES } from '../../constants';
import { Library, LibraryStatus } from '../../types';

interface LibraryFormProps {
  library?: Library;
  onSuccess?: () => void;
}

interface LibraryFormData {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  status: LibraryStatus;
  amenities: {
    wifi: boolean;
    ac: boolean;
    parking: boolean;
    cafeteria: boolean;
    printer: boolean;
    studyRooms: boolean;
    quietZone: boolean;
    groupStudyArea: boolean;
    chargingStations: boolean;
    wheelchairAccessible: boolean;
  };
  pricing: {
    hourlyRate: number;
    dailyRate: number;
    monthlyRate: number;
    currency: string;
    discountRates?: {
      student: number;
      bulk: number;
    };
  };
}

const LibraryForm: React.FC<LibraryFormProps> = ({ library, onSuccess }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { isLoading, error } = useAppSelector((state) => state.library);
  
  const isEditing = !!library;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LibraryFormData>({
    defaultValues: {
      name: '',
      address: '',
      latitude: undefined,
      longitude: undefined,
      capacity: 50,
      status: 'active',
      amenities: {
        wifi: false,
        ac: false,
        parking: false,
        cafeteria: false,
        printer: false,
        studyRooms: false,
        quietZone: false,
        groupStudyArea: false,
        chargingStations: false,
        wheelchairAccessible: false,
      },
      pricing: {
        hourlyRate: 50,
        dailyRate: 300,
        monthlyRate: 5000,
        currency: 'INR',
        discountRates: {
          student: 10,
          bulk: 15,
        },
      },
    },
  });

  useEffect(() => {
    if (library) {
      reset({
        name: library.name,
        address: library.address,
        latitude: library.latitude,
        longitude: library.longitude,
        capacity: library.capacity,
        status: library.status,
        amenities: library.amenities,
        pricing: library.pricing,
      });
    }
  }, [library, reset]);

  const onSubmit = async (data: LibraryFormData) => {
    try {
      if (isEditing && library) {
        await dispatch(updateLibrary({ id: library.id, libraryData: data })).unwrap();
        dispatch(showSnackbar({
          message: 'Library updated successfully',
          severity: 'success',
        }));
      } else {
        await dispatch(createLibrary(data)).unwrap();
        dispatch(showSnackbar({
          message: 'Library created successfully',
          severity: 'success',
        }));
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(ROUTES.LIBRARIES);
      }
    } catch (error: any) {
      dispatch(showSnackbar({
        message: error || 'Failed to save library',
        severity: 'error',
      }));
    }
  };

  const amenityOptions = [
    { key: 'wifi', label: 'WiFi' },
    { key: 'ac', label: 'Air Conditioning' },
    { key: 'parking', label: 'Parking' },
    { key: 'cafeteria', label: 'Cafeteria' },
    { key: 'printer', label: 'Printer' },
    { key: 'studyRooms', label: 'Study Rooms' },
    { key: 'quietZone', label: 'Quiet Zone' },
    { key: 'groupStudyArea', label: 'Group Study Area' },
    { key: 'chargingStations', label: 'Charging Stations' },
    { key: 'wheelchairAccessible', label: 'Wheelchair Accessible' },
  ];

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Basic Information" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Library name is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Library Name"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="capacity"
                    control={control}
                    rules={{ 
                      required: 'Capacity is required',
                      min: { value: 1, message: 'Capacity must be at least 1' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Capacity"
                        error={!!errors.capacity}
                        helperText={errors.capacity?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="address"
                    control={control}
                    rules={{ required: 'Address is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={3}
                        label="Address"
                        error={!!errors.address}
                        helperText={errors.address?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="latitude"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Latitude"
                        inputProps={{ step: 'any' }}
                        error={!!errors.latitude}
                        helperText={errors.latitude?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="longitude"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Longitude"
                        inputProps={{ step: 'any' }}
                        error={!!errors.longitude}
                        helperText={errors.longitude?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select {...field} label="Status">
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                          <MenuItem value="maintenance">Maintenance</MenuItem>
                          <MenuItem value="closed">Closed</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Pricing */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Pricing" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="pricing.hourlyRate"
                    control={control}
                    rules={{ required: 'Hourly rate is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Hourly Rate (₹)"
                        error={!!errors.pricing?.hourlyRate}
                        helperText={errors.pricing?.hourlyRate?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="pricing.dailyRate"
                    control={control}
                    rules={{ required: 'Daily rate is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Daily Rate (₹)"
                        error={!!errors.pricing?.dailyRate}
                        helperText={errors.pricing?.dailyRate?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="pricing.monthlyRate"
                    control={control}
                    rules={{ required: 'Monthly rate is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Monthly Rate (₹)"
                        error={!!errors.pricing?.monthlyRate}
                        helperText={errors.pricing?.monthlyRate?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Amenities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Amenities" />
            <CardContent>
              <Grid container spacing={1}>
                {amenityOptions.map((amenity) => (
                  <Grid item xs={12} sm={6} key={amenity.key}>
                    <Controller
                      name={`amenities.${amenity.key}` as any}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label={amenity.label}
                        />
                      )}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(ROUTES.LIBRARIES)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (isEditing ? 'Update Library' : 'Create Library')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LibraryForm;

