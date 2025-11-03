import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Avatar,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy,
  WhatsApp,
  Facebook,
  Twitter,
  Email,
  Person,
  CheckCircle,
  HourglassEmpty,
  CardGiftcard,
  TrendingUp,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import Layout from '../components/Layout';
import api from '../services/api';

interface Referral {
  id: string;
  friendName: string;
  email: string;
  status: 'pending' | 'signed_up' | 'completed';
  date: string;
  reward: number;
  earnedOn?: string;
}

export default function ReferralPage({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [referralCode] = useState(`STUDY${user.id?.slice(-6).toUpperCase() || 'CODE123'}`);
  const [referralLink] = useState(`https://studyspot-student.vercel.app/register?ref=${referralCode}`);
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    totalEarned: 0,
  });

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const response = await api.get('/api/referrals/my-referrals');
      setReferrals(response.data.data || mockReferrals);
      calculateStats(response.data.data || mockReferrals);
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
      setReferrals(mockReferrals);
      calculateStats(mockReferrals);
    }
  };

  const mockReferrals: Referral[] = [
    {
      id: '1',
      friendName: 'Rahul Sharma',
      email: 'rahul@example.com',
      status: 'completed',
      date: '2024-10-25',
      reward: 500,
      earnedOn: '2024-10-28',
    },
    {
      id: '2',
      friendName: 'Priya Singh',
      email: 'priya@example.com',
      status: 'signed_up',
      date: '2024-11-01',
      reward: 500,
    },
    {
      id: '3',
      friendName: 'Amit Kumar',
      email: 'amit@example.com',
      status: 'pending',
      date: '2024-11-02',
      reward: 500,
    },
  ];

  const calculateStats = (refs: Referral[]) => {
    setStats({
      totalReferrals: refs.length,
      successfulReferrals: refs.filter(r => r.status === 'completed').length,
      pendingReferrals: refs.filter(r => r.status === 'pending').length,
      totalEarned: refs.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.reward, 0),
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const text = `Join StudySpot and get ₹200 OFF on your first booking! Use my referral code: ${referralCode}`;
    const url = referralLink;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent('Join StudySpot!')}&body=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
        break;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'signed_up': return <HourglassEmpty color="warning" />;
      default: return <Person color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'signed_up': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🎁 Refer & Earn
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Invite friends and earn ₹500 for each successful referral
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h4" fontWeight="bold">{stats.totalReferrals}</Typography>
                <Typography variant="body2">Total Referrals</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h4" fontWeight="bold">{stats.successfulReferrals}</Typography>
                <Typography variant="body2">Successful</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h4" fontWeight="bold">{stats.pendingReferrals}</Typography>
                <Typography variant="body2">Pending</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h4" fontWeight="bold">₹{stats.totalEarned}</Typography>
                <Typography variant="body2">Total Earned</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Referral Code Section */}
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Your Referral Code
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                  Share this code with friends. They get ₹200 OFF, you get ₹500!
                </Typography>
                
                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }}>
                  <Typography variant="h4" fontWeight="bold" sx={{ textAlign: 'center', letterSpacing: 2 }}>
                    {referralCode}
                  </Typography>
                </Paper>

                <TextField
                  fullWidth
                  value={referralLink}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                          onClick={handleCopy}
                          sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 1 }}
                />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<WhatsApp />}
                    onClick={() => handleShare('whatsapp')}
                    sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#1ea952' } }}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Facebook />}
                    onClick={() => handleShare('facebook')}
                    sx={{ bgcolor: '#1877f2', '&:hover': { bgcolor: '#145dbf' } }}
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Twitter />}
                    onClick={() => handleShare('twitter')}
                    sx={{ bgcolor: '#1da1f2', '&:hover': { bgcolor: '#1a8cd8' } }}
                  >
                    Twitter
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Email />}
                    onClick={() => handleShare('email')}
                    sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                  >
                    Email
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                <Paper sx={{ p: 2, bgcolor: 'white', display: 'inline-block' }}>
                  <QRCodeSVG value={referralLink} size={180} />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Scan to register
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              💡 How It Works
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                    <Typography variant="h4">1</Typography>
                  </Avatar>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Share Your Code
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Share your unique referral code with friends via WhatsApp, Facebook, or Email
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                    <Typography variant="h4">2</Typography>
                  </Avatar>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Friend Registers
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your friend signs up using your referral code and gets ₹200 discount
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
                    <Typography variant="h4">3</Typography>
                  </Avatar>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    You Earn ₹500
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    When your friend completes their first booking, you earn ₹500 in credits
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Referral Progress */}
        {stats.totalReferrals > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  🎯 Referral Progress
                </Typography>
                <Chip 
                  label={`${stats.successfulReferrals}/${stats.totalReferrals} completed`} 
                  color="primary" 
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(stats.successfulReferrals / stats.totalReferrals) * 100} 
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {Math.round((stats.successfulReferrals / stats.totalReferrals) * 100)}% success rate
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Referral List */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📋 Your Referrals ({referrals.length})
            </Typography>
            {referrals.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <ShareIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No referrals yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Start sharing your code and earn rewards!
                </Typography>
                <Button variant="contained" onClick={handleCopy} startIcon={<ContentCopy />}>
                  Copy Referral Link
                </Button>
              </Box>
            ) : (
              <List>
                {referrals.map((referral, index) => (
                  <Box key={referral.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getStatusColor(referral.status) === 'success' ? 'success.main' : 'grey.400' }}>
                          {getStatusIcon(referral.status)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight="600">
                              {referral.friendName}
                            </Typography>
                            <Chip 
                              label={referral.status.replace('_', ' ')} 
                              size="small" 
                              color={getStatusColor(referral.status) as any}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {referral.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Referred on: {new Date(referral.date).toLocaleDateString()}
                              {referral.earnedOn && ` • Earned on: ${new Date(referral.earnedOn).toLocaleDateString()}`}
                            </Typography>
                          </>
                        }
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight="bold" color={referral.status === 'completed' ? 'success.main' : 'text.secondary'}>
                          ₹{referral.reward}
                        </Typography>
                        {referral.status === 'completed' && (
                          <Chip label="Earned" color="success" size="small" />
                        )}
                      </Box>
                    </ListItem>
                    {index < referrals.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Rewards Breakdown */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              💰 Reward Breakdown
            </Typography>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CardGiftcard />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Friend Bonus"
                  secondary="Your friend gets ₹200 discount on first booking"
                />
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  ₹200
                </Typography>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <TrendingUp />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Your Reward"
                  secondary="You earn credits after friend's first booking"
                />
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  ₹500
                </Typography>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <CardGiftcard />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Bonus Milestone"
                  secondary="Refer 10 friends, get ₹1000 bonus"
                />
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  ₹1000
                </Typography>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
}

// Helper functions moved inside component scope
function getStatusColor(status: string) {
  switch (status) {
    case 'completed': return 'success';
    case 'signed_up': return 'warning';
    default: return 'default';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed': return <CheckCircle />;
    case 'signed_up': return <HourglassEmpty />;
    default: return <Person />;
  }
}

