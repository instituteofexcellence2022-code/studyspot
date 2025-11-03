import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Link, Alert, IconButton, InputAdornment } from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { login } from '../../store/slices/authSlice';
import { showSnackbar } from '../../store/slices/uiSlice';
import { ROUTES } from '../../constants';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state: any) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors }} = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: ''}});

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(login(data as any)).unwrap();
      dispatch(showSnackbar({
        message: 'Login successful!',
        severity: 'success'} as any));
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      dispatch(showSnackbar({
        message: error || 'Login failed. Please try again.',
        severity: 'error'} as any));
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Sign In
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Enter your credentials to access your account
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
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
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              autoFocus
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
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
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

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Link component={RouterLink} to={ROUTES.REGISTER} variant="body2">
            Don't have an account? Sign Up
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;


