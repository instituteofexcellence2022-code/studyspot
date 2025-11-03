// ============================================
// EDIT USER PAGE
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
import { fetchUserById, updateUser } from '../../../store/slices/userSlice';
import { fetchTenants } from '../../../store/slices/tenantSlice';
import { User } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentUser, loading: userLoading, error } = useAppSelector((state) => state.user);
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
    if (id) {
      dispatch(fetchUserById(id));
    }
    // Load tenants for dropdown
    dispatch(fetchTenants({ limit: 100 }));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        tenantId: currentUser.tenantId || '',
        status: currentUser.status,
      });
    }
  }, [currentUser]);

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
      const updateData: Partial<User> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        tenantId: formData.role === 'super_admin' ? null : (formData.tenantId || null),
        tenantName: formData.role === 'super_admin' ? undefined : tenants.find(t => t.id === formData.tenantId)?.name,
        status: formData.status,
      };

      if (id) {
        await dispatch(updateUser({ id, data: updateData })).unwrap();
        toast.success('User updated successfully!');
        navigate(`/users/${id}`);
      }
    } catch (error: any) {
      toast.error(error || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/users/${id}`);
  };

  if (userLoading && !currentUser) {
    return <LoadingSpinner fullscreen message="Loading user..." />;
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate('/users')}>
          Back to List
        </Button>
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 3 }}>
          User not found
        </Alert>
        <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate('/users')}>
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
            navigate('/users');
          }}
        >
          Users
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate(`/users/${id}`);
          }}
        >
          {currentUser.name}
        </Link>
        <Typography color="text.primary">Edit</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Edit User: {currentUser.name}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate(`/users/${id}`)}
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

            {/* Meta Information */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>User ID:</strong> {currentUser.id}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Created:</strong> {new Date(currentUser.createdAt).toLocaleDateString()}
              </Typography>
              {currentUser.lastLogin && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Last Login:</strong> {new Date(currentUser.lastLogin).toLocaleString()}
                </Typography>
              )}
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

export default EditUserPage;

