// ============================================
// TENANT DETAILS PAGE
// ============================================

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
  Divider,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { fetchTenantById, deleteTenant } from '../../../store/slices/tenantSlice';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const TenantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentTenant, loading, error } = useAppSelector((state) => state.tenant);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchTenantById(id));
    }
  }, [dispatch, id]);

  const handleEdit = () => {
    navigate(`/tenants/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 3000);
      return;
    }

    try {
      if (id) {
        await dispatch(deleteTenant(id)).unwrap();
        toast.success('Tenant deleted successfully');
        navigate('/tenants');
      }
    } catch (error: any) {
      toast.error(error || 'Failed to delete tenant');
    }
  };

  const handleBack = () => {
    navigate('/tenants');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trial':
        return 'info';
      case 'expired':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner fullscreen message="Loading tenant details..." />;
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="outlined" startIcon={<BackIcon />} onClick={handleBack}>
          Back to List
        </Button>
      </Box>
    );
  }

  if (!currentTenant) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Tenant not found
        </Alert>
        <Button variant="outlined" startIcon={<BackIcon />} onClick={handleBack}>
          Back to List
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/tenants');
          }}
        >
          Tenants
        </Link>
        <Typography color="text.primary">{currentTenant.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {currentTenant.name}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label={currentTenant.status}
              size="small"
              color={getStatusColor(currentTenant.status) as any}
              sx={{ textTransform: 'capitalize' }}
            />
            <Chip
              label={currentTenant.subscriptionPlan}
              size="small"
              color={
                currentTenant.subscriptionPlan === 'enterprise'
                  ? 'primary'
                  : currentTenant.subscriptionPlan === 'professional'
                  ? 'secondary'
                  : 'default'
              }
              sx={{ textTransform: 'capitalize' }}
            />
            <Chip
              label={currentTenant.subscriptionStatus}
              size="small"
              color={getSubscriptionStatusColor(currentTenant.subscriptionStatus) as any}
              sx={{ textTransform: 'capitalize' }}
            />
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<BackIcon />} onClick={handleBack}>
            Back
          </Button>
          <Tooltip title="Edit Tenant">
            <IconButton color="primary" onClick={handleEdit}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={deleteConfirm ? 'Click again to confirm' : 'Delete Tenant'}>
            <IconButton color={deleteConfirm ? 'error' : 'default'} onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BusinessIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Libraries
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {currentTenant.metadata?.librariesCount || 0}
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BusinessIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Users
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {currentTenant.metadata?.usersCount || 0}
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BusinessIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Total Seats
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {currentTenant.metadata?.seatsCount || 0}
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Utilization
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {currentTenant.metadata?.seatsCount
                ? Math.round(((currentTenant.metadata?.usersCount || 0) / currentTenant.metadata.seatsCount) * 100)
                : 0}
              %
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Details */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Tenant Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'grid', gap: 2 }}>
            {/* Slug */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Slug
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {currentTenant.slug}
              </Typography>
            </Box>

            {/* Email */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentTenant.email}
                </Typography>
              </Box>
            </Box>

            {/* Phone */}
            {currentTenant.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {currentTenant.phone}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Address */}
            {currentTenant.address && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <LocationIcon sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {currentTenant.address}
                  </Typography>
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 1 }} />

            {/* Created At */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatDate(currentTenant.createdAt)}
                </Typography>
              </Box>
            </Box>

            {/* Updated At */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatDate(currentTenant.updatedAt)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Subscription Details */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Subscription Details
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Plan
              </Typography>
              <Chip
                label={currentTenant.subscriptionPlan}
                color={
                  currentTenant.subscriptionPlan === 'enterprise'
                    ? 'primary'
                    : currentTenant.subscriptionPlan === 'professional'
                    ? 'secondary'
                    : 'default'
                }
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <Chip
                label={currentTenant.subscriptionStatus}
                color={getSubscriptionStatusColor(currentTenant.subscriptionStatus) as any}
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Account Status
              </Typography>
              <Chip
                label={currentTenant.status}
                color={getStatusColor(currentTenant.status) as any}
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TenantDetailsPage;

