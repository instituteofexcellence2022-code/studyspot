// ============================================
// EDIT TENANT PAGE
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  MenuItem,
  Stack,
  Breadcrumbs,
  Link,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { fetchTenantById, updateTenant } from '../../../store/slices/tenantSlice';
import { Tenant } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const EditTenantPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentTenant, loading: fetchLoading, error } = useAppSelector((state) => state.tenant);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    status: 'active' as Tenant['status'],
    subscriptionPlan: 'starter',
    subscriptionStatus: 'trial' as Tenant['subscriptionStatus'],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchTenantById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentTenant) {
      setFormData({
        name: currentTenant.name,
        slug: currentTenant.slug,
        email: currentTenant.email,
        phone: currentTenant.phone || '',
        address: currentTenant.address || '',
        status: currentTenant.status,
        subscriptionPlan: currentTenant.subscriptionPlan,
        subscriptionStatus: currentTenant.subscriptionStatus,
      });
    }
  }, [currentTenant]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tenant name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!id) {
      toast.error('Tenant ID is missing');
      return;
    }

    setLoading(true);
    try {
      const updateData: Partial<Tenant> = {
        name: formData.name,
        slug: formData.slug,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        status: formData.status,
        subscriptionPlan: formData.subscriptionPlan,
        subscriptionStatus: formData.subscriptionStatus,
      };

      await dispatch(updateTenant({ id, data: updateData })).unwrap();
      toast.success('Tenant updated successfully!');
      navigate(`/tenants/${id}`);
    } catch (error: any) {
      toast.error(error || 'Failed to update tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/tenants/${id}`);
  };

  if (fetchLoading) {
    return <LoadingSpinner fullscreen message="Loading tenant..." />;
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate('/tenants')}>
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
        <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate('/tenants')}>
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
        <Link
          underline="hover"
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate(`/tenants/${id}`);
          }}
        >
          {currentTenant.name}
        </Link>
        <Typography color="text.primary">Edit</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Edit Tenant
        </Typography>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate(`/tenants/${id}`)}
        >
          Back to Details
        </Button>
      </Box>

      {/* Form */}
      <Card sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* Tenant Name */}
              <TextField
                label="Tenant Name"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name || 'The name of the organization'}
                fullWidth
                required
              />
              {/* Slug */}
              <TextField
                label="Slug"
                value={formData.slug}
                onChange={handleChange('slug')}
                error={!!errors.slug}
                helperText={errors.slug || 'URL-friendly identifier'}
                fullWidth
                required
              />
              {/* Email */}
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email || 'Primary contact email'}
                fullWidth
                required
              />
              {/* Phone */}
              <TextField
                label="Phone"
                value={formData.phone}
                onChange={handleChange('phone')}
                helperText="Contact phone number (optional)"
                fullWidth
              />
            </Box>

            {/* Address */}
            <TextField
              label="Address"
              value={formData.address}
              onChange={handleChange('address')}
              helperText="Physical address (optional)"
              fullWidth
              multiline
              rows={2}
            />

            {/* Subscription & Status */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Subscription & Status
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              <TextField
                select
                label="Status"
                value={formData.status}
                onChange={handleChange('status')}
                fullWidth
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
              <TextField
                select
                label="Subscription Plan"
                value={formData.subscriptionPlan}
                onChange={handleChange('subscriptionPlan')}
                fullWidth
              >
                <MenuItem value="starter">Starter</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
              </TextField>
              <TextField
                select
                label="Subscription Status"
                value={formData.subscriptionStatus}
                onChange={handleChange('subscriptionStatus')}
                fullWidth
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="trial">Trial</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Box>

            {/* Actions */}
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  size="large"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={loading}
                  size="large"
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default EditTenantPage;

