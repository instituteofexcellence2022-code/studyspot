// ============================================
// USER DETAILS PAGE
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
  Email as EmailIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { fetchUserById, deleteUser } from '../../../store/slices/userSlice';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentUser, loading, error } = useAppSelector((state) => state.user);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
    }
  }, [dispatch, id]);

  const handleEdit = () => {
    navigate(`/users/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 3000);
      return;
    }

    try {
      if (id) {
        await dispatch(deleteUser(id)).unwrap();
        toast.success('User deleted successfully');
        navigate('/users');
      }
    } catch (error: any) {
      toast.error(error || 'Failed to delete user');
    }
  };

  const handleBack = () => {
    navigate('/users');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'error';
      case 'admin':
        return 'primary';
      case 'support':
        return 'info';
      case 'viewer':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingSpinner fullscreen message="Loading user details..." />;
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

  if (!currentUser) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 3 }}>
          User not found
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
            navigate('/users');
          }}
        >
          Users
        </Link>
        <Typography color="text.primary">{currentUser.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {currentUser.name}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label={currentUser.status}
              size="small"
              color={getStatusColor(currentUser.status) as any}
              sx={{ textTransform: 'capitalize' }}
            />
            <Chip
              label={currentUser.role.replace('_', ' ')}
              size="small"
              color={getRoleColor(currentUser.role) as any}
              sx={{ textTransform: 'capitalize' }}
            />
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<BackIcon />} onClick={handleBack}>
            Back
          </Button>
          <Tooltip title="Edit User">
            <IconButton color="primary" onClick={handleEdit}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={deleteConfirm ? 'Click again to confirm' : 'Delete User'}>
            <IconButton color={deleteConfirm ? 'error' : 'default'} onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Main Details */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            User Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'grid', gap: 2 }}>
            {/* Email */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentUser.email}
                </Typography>
              </Box>
            </Box>

            {/* Role */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ShieldIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Role
                </Typography>
                <Chip
                  label={currentUser.role.replace('_', ' ')}
                  size="small"
                  color={getRoleColor(currentUser.role) as any}
                  sx={{ textTransform: 'capitalize', mt: 0.5 }}
                />
              </Box>
            </Box>

            {/* Tenant */}
            {currentUser.tenantId && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tenant
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {currentUser.tenantName || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            )}

            {currentUser.role === 'super_admin' && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tenant
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" color="primary.main">
                    Super Admin (No Tenant)
                  </Typography>
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 1 }} />

            {/* Last Login */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Login
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentUser.lastLogin ? formatDate(currentUser.lastLogin) : 'Never'}
                </Typography>
              </Box>
            </Box>

            {/* Created At */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatDate(currentUser.createdAt)}
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
                  {formatDate(currentUser.updatedAt)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Account Status
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <Chip
                label={currentUser.status}
                color={getStatusColor(currentUser.status) as any}
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Access Level
              </Typography>
              <Chip
                label={currentUser.role.replace('_', ' ')}
                color={getRoleColor(currentUser.role) as any}
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserDetailsPage;

