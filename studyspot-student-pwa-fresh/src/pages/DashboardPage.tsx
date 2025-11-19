import { Container, Typography, Box, Button, Paper } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button variant="outlined" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Welcome, {user?.firstName || user?.email}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is your student portal dashboard. Start building your features here.
        </Typography>
      </Paper>
    </Container>
  )
}


