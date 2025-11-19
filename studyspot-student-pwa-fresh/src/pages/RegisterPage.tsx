import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(formData)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Sign up for StudySpot Student Portal
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              autoComplete="new-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
            <Box textAlign="center">
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Already have an account? Sign in
                </Typography>
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  )
}


