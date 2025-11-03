// ============================================
// CREATE TENANT PAGE
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { useAppDispatch } from '../../../hooks/redux';
import { createTenant } from '../../../store/slices/tenantSlice';
import { Tenant } from '../../../types';

const CreateTenantPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
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

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    
    // Auto-generate slug from name
    if (field === 'name') {
      const slug = event.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
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

    setLoading(true);
    try {
      const tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        slug: formData.slug,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        status: formData.status,
        subscriptionPlan: formData.subscriptionPlan,
        subscriptionStatus: formData.subscriptionStatus,
        logo: '',
        metadata: {
          librariesCount: 0,
          usersCount: 0,
          seatsCount: 0,
        },
      };

      await dispatch(createTenant(tenantData)).unwrap();
      toast.success('Tenant created successfully!');
      navigate('/tenants');
    } catch (error: any) {
      toast.error(error || 'Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/tenants');
  };

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
        <Typography color="text.primary">Create New Tenant</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Create New Tenant
        </Typography>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/tenants')}
        >
          Back to List
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
                helperText={errors.slug || 'URL-friendly identifier (auto-generated)'}
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
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  size="large"
                >
                  {loading ? 'Creating...' : 'Create Tenant'}
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

export default CreateTenantPage;

