// ============================================
// CREATE USER PAGE
// ============================================

import React, { useState, useEffect } from 'react';
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

import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { createUser } from '../../../store/slices/userSlice';
import { fetchTenants } from '../../../store/slices/tenantSlice';
import { User } from '../../../types';

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { tenants } = useAppSelector((state) => state.tenant);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer' as User['role'],
    tenantId: '',
    status: 'active' as User['status'],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load tenants for dropdown
    dispatch(fetchTenants({ limit: 100 }));
  }, [dispatch]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    
    // If role is super_admin, clear tenant
    if (field === 'role' && value === 'super_admin') {
      setFormData(prev => ({ ...prev, tenantId: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.role !== 'super_admin' && !formData.tenantId) {
      newErrors.tenantId = 'Tenant is required for non-super admin users';
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
      const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        tenantId: formData.role === 'super_admin' ? null : (formData.tenantId || null),
        tenantName: formData.role === 'super_admin' ? undefined : tenants.find(t => t.id === formData.tenantId)?.name,
        avatarUrl: '',
        status: formData.status,
      };

      await dispatch(createUser(userData)).unwrap();
      toast.success('User created successfully!');
      navigate('/users');
    } catch (error: any) {
      toast.error(error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
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
            navigate('/users');
          }}
        >
          Users
        </Link>
        <Typography color="text.primary">Create New User</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Create New User
        </Typography>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/users')}
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
              {/* Name */}
              <TextField
                label="Full Name"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name || 'User\'s full name'}
                fullWidth
                required
              />
              {/* Email */}
              <TextField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email || 'User\'s email for login'}
                fullWidth
                required
              />
            </Box>

            {/* Role & Access */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Role & Access
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              <TextField
                select
                label="Role"
                value={formData.role}
                onChange={handleChange('role')}
                fullWidth
                required
                helperText="User's access level"
              >
                <MenuItem value="viewer">Viewer</MenuItem>
                <MenuItem value="support">Support</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
              </TextField>
              
              <TextField
                select
                label="Tenant"
                value={formData.tenantId}
                onChange={handleChange('tenantId')}
                fullWidth
                required={formData.role !== 'super_admin'}
                disabled={formData.role === 'super_admin'}
                error={!!errors.tenantId}
                helperText={errors.tenantId || (formData.role === 'super_admin' ? 'Super admins have no tenant' : 'Assign user to tenant')}
              >
                <MenuItem value="">
                  <em>Select Tenant</em>
                </MenuItem>
                {tenants.map((tenant) => (
                  <MenuItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Status"
                value={formData.status}
                onChange={handleChange('status')}
                fullWidth
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
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
                  {loading ? 'Creating...' : 'Create User'}
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

export default CreateUserPage;

