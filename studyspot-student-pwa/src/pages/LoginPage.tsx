import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import api from '../services/api';

export default function LoginPage({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', formData);
      
      // Extract data from response
      const responseData = response.data?.data || response.data;
      const tokens = responseData.tokens || {};
      const user = responseData.user || {};
      
      // Store authentication data
      const accessToken = tokens.accessToken || tokens.token || responseData.token;
      if (accessToken) {
        localStorage.setItem('token', accessToken);
      }
      if (tokens.refreshToken) {
        localStorage.setItem('refreshToken', tokens.refreshToken);
      }
      if (user && Object.keys(user).length > 0) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkipLogin = () => {
    // Dev mode bypass
    const mockUser = {
      id: 'dev-user-123',
      email: 'dev@studyspot.com',
      firstName: 'Dev',
      lastName: 'User',
      role: 'student',
      phone: '9999999999',
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'dev-mock-token-bypass');
    localStorage.setItem('bypassAuth', 'true');
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your StudySpot account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
              autoFocus
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
                  Register here
                </Link>
              </Typography>
            </Box>

            {/* DEV MODE: Skip Login Button */}
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              size="small"
              onClick={handleSkipLogin}
              sx={{ 
                textTransform: 'none',
                borderStyle: 'dashed',
                opacity: 0.7,
                '&:hover': { opacity: 1, borderStyle: 'dashed' }
              }}
            >
              🔓 Skip Login (Dev Mode)
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
