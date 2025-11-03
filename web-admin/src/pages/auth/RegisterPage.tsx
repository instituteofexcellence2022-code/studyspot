import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import { Email, Lock, Person, Phone, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { register, clearError } from '../../store/slices/authSlice';
import { showSnackbar } from '../../store/slices/uiSlice';
import { ROUTES, USER_ROLES } from '../../constants';
import { RegisterRequest } from '../../types';

interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
  phone: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Clear any previous errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }} = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: USER_ROLES.PLATFORM_SUPPORT}});

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      console.log('🔄 Attempting registration:', { ...registerData, password: '***' });
      
      const result = await dispatch(register(registerData)).unwrap();
      
      console.log('✅ Registration successful:', result);
      dispatch(showSnackbar({
        message: '✅ Registration successful! Please log in.',
        severity: 'success'}));
      navigate(ROUTES.LOGIN);
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      
      // Extract error message from various possible structures
      let errorMessage = 'Registration failed. Please try again.';
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }
      
      console.log('📢 Showing error:', errorMessage);
      
      dispatch(showSnackbar({
        message: `❌ ${errorMessage}`,
        severity: 'error'}));
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Create Account
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Sign up to get started with 🎓 STUDYSPOT
      </Typography>

      {/* Error messages are now shown via GlobalSnackbar instead */}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Controller
              name="firstName"
              control={control}
              rules={{
                required: 'First name is required',
                minLength: {
                  value: 2,
                  message: 'First name must be at least 2 characters'}}}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoComplete="given-name"
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    )}}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Controller
              name="lastName"
              control={control}
              rules={{
                required: 'Last name is required',
                minLength: {
                  value: 2,
                  message: 'Last name must be at least 2 characters'}}}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  autoComplete="family-name"
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address'}}}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    )}}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  autoComplete="tel"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    )}}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="role-label">Platform Role</InputLabel>
                  <Select
                    {...field}
                    labelId="role-label"
                    id="role"
                    label="Platform Role"
                    error={!!errors.role}
                  >
                    <MenuItem value={USER_ROLES.PLATFORM_SUPPORT}>Platform Support (Customer Support, Operations)</MenuItem>
                    <MenuItem value={USER_ROLES.SUPER_ADMIN}>Super Admin (Full Platform Access)</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
            <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
              ⚠️ This is the Platform Admin Portal. Only platform administrators should register here.
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Controller
              name="password"
              control={control}
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'}}}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )}}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match'}}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )}}
                />
              )}
            />
          </Box>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Link component={RouterLink} to={ROUTES.LOGIN} variant="body2">
            Already have an account? Sign In
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;

