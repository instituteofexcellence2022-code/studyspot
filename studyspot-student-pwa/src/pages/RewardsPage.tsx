import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Avatar,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
} from '@mui/material';
import {
  EmojiEvents,
  Star,
  LocalFireDepartment,
  CardGiftcard,
  Redeem,
  Share,
  ContentCopy,
  TrendingUp,
  Grade,
  WorkspacePremium,
} from '@mui/icons-material';
import Layout from '../components/StudyFocusedLayout';
import api from '../services/api';

interface RewardsPageProps {
  setIsAuthenticated: (value: boolean) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function RewardsPage({ setIsAuthenticated }: RewardsPageProps) {
  const [tabValue, setTabValue] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [rewards, setRewards] = useState({
    points: 450,
    level: 5,
    rank: 234,
    totalUsers: 10000,
    referralCode: 'STUDY' + user.id?.toString().padStart(4, '0'),
    referralsCount: 3,
    streak: 7,
  });

  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: 'First Booking',
      description: 'Complete your first library booking',
      icon: '🎯',
      earned: true,
      earnedDate: '2025-10-15',
      points: 50,
    },
    {
      id: 2,
      title: '7-Day Streak',
      description: 'Study for 7 consecutive days',
      icon: '🔥',
      earned: true,
      earnedDate: '2025-11-01',
      points: 100,
    },
    {
      id: 3,
      title: 'Early Bird',
      description: 'Check-in before 7 AM',
      icon: '🌅',
      earned: true,
      earnedDate: '2025-10-20',
      points: 75,
    },
    {
      id: 4,
      title: '100 Hours',
      description: 'Study for 100 total hours',
      icon: '⏰',
      earned: false,
      progress: 65,
      points: 200,
    },
    {
      id: 5,
      title: 'Library Explorer',
      description: 'Visit 5 different libraries',
      icon: '🗺️',
      earned: false,
      progress: 3,
      target: 5,
      points: 150,
    },
    {
      id: 6,
      title: 'Social Butterfly',
      description: 'Refer 5 friends',
      icon: '👥',
      earned: false,
      progress: 3,
      target: 5,
      points: 250,
    },
  ]);

  const [coupons, setCoupons] = useState([
    {
      id: 1,
      code: 'STUDY50',
      discount: '50% OFF',
      description: 'Get 50% off on next booking',
      points: 200,
      validUntil: '2025-12-31',
      redeemed: false,
    },
    {
      id: 2,
      code: 'FREEHOUR',
      discount: '1 Free Hour',
      description: 'Get 1 hour free at any library',
      points: 300,
      validUntil: '2025-12-31',
      redeemed: false,
    },
    {
      id: 3,
      code: 'WEEKEND20',
      discount: '20% OFF',
      description: '20% off on weekend bookings',
      points: 150,
      validUntil: '2025-11-30',
      redeemed: true,
    },
  ]);

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'Rahul Kumar', points: 2500, avatar: 'RK' },
    { rank: 2, name: 'Priya Sharma', points: 2300, avatar: 'PS' },
    { rank: 3, name: 'Amit Patel', points: 2100, avatar: 'AP' },
    { rank: 234, name: `${user.firstName} ${user.lastName}`, points: rewards.points, avatar: `${user.firstName?.[0]}${user.lastName?.[0]}`, isCurrentUser: true },
  ]);

  const copyReferralCode = () => {
    navigator.clipboard.writeText(rewards.referralCode);
    alert('Referral code copied!');
  };

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join StudySpot',
        text: `Use my referral code ${rewards.referralCode} to get started!`,
        url: window.location.origin,
      });
    }
  };

  const redeemCoupon = async (couponId: number, pointsRequired: number) => {
    if (rewards.points < pointsRequired) {
      alert('Not enough points!');
      return;
    }

    try {
      await api.post('/api/rewards/redeem-coupon', { couponId });
      setRewards({ ...rewards, points: rewards.points - pointsRequired });
      setCoupons(coupons.map(c => c.id === couponId ? { ...c, redeemed: true } : c));
      alert('Coupon redeemed successfully!');
    } catch (error) {
      alert('Failed to redeem coupon');
    }
  };

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Rewards & Achievements 🏆
        </Typography>

        {/* Points & Level Card */}
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ width: 100, height: 100, bgcolor: 'white', color: '#f59e0b', fontSize: 40, mx: 'auto', mb: 2 }}>
                    L{rewards.level}
                  </Avatar>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Level {rewards.level}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Star sx={{ fontSize: 50, color: 'white', mb: 1 }} />
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {rewards.points}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Reward Points
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <EmojiEvents sx={{ fontSize: 50, color: 'white', mb: 1 }} />
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                    #{rewards.rank}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Global Rank
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab icon={<Grade />} label="Achievements" />
            <Tab icon={<Redeem />} label="Coupons" />
            <Tab icon={<Share />} label="Referrals" />
            <Tab icon={<TrendingUp />} label="Leaderboard" />
          </Tabs>

          {/* Tab 1: Achievements */}
          <TabPanel value={tabValue} index={0}>
            <CardContent>
              <Grid container spacing={2}>
                {achievements.map((achievement) => (
                  <Grid item xs={12} sm={6} key={achievement.id}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: achievement.earned ? '#f0fdf4' : '#f5f5f5',
                        border: 1,
                        borderColor: achievement.earned ? '#10b981' : '#e5e7eb',
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="h2">{achievement.icon}</Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {achievement.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {achievement.description}
                          </Typography>
                          {achievement.earned ? (
                            <Chip
                              label={`Earned on ${achievement.earnedDate}`}
                              size="small"
                              color="success"
                              icon={<CheckCircle />}
                            />
                          ) : (
                            <Box>
                              {achievement.progress !== undefined && (
                                <Box sx={{ mt: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption">Progress</Typography>
                                    <Typography variant="caption">
                                      {achievement.progress}/{achievement.target || 100}
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={(achievement.progress / (achievement.target || 100)) * 100}
                                    sx={{ height: 6, borderRadius: 3 }}
                                  />
                                </Box>
                              )}
                            </Box>
                          )}
                          <Chip
                            label={`+${achievement.points} pts`}
                            size="small"
                            sx={{ mt: 1 }}
                            color="warning"
                          />
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </TabPanel>

          {/* Tab 2: Coupons */}
          <TabPanel value={tabValue} index={1}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Redeem your points for exclusive discount coupons
              </Typography>
              <Grid container spacing={2}>
                {coupons.map((coupon) => (
                  <Grid item xs={12} sm={6} key={coupon.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h5" color="primary.main" fontWeight="bold" gutterBottom>
                          {coupon.discount}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {coupon.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                          Valid until {coupon.validUntil}
                        </Typography>
                        {coupon.redeemed ? (
                          <Chip label={`Code: ${coupon.code}`} color="success" />
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            onClick={() => redeemCoupon(coupon.id, coupon.points)}
                            disabled={rewards.points < coupon.points}
                          >
                            Redeem ({coupon.points} pts)
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </TabPanel>

          {/* Tab 3: Referrals */}
          <TabPanel value={tabValue} index={2}>
            <CardContent>
              <Paper sx={{ p: 3, bgcolor: '#f5f5f5', mb: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Your Referral Code
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {rewards.referralCode}
                  </Typography>
                  <IconButton onClick={copyReferralCode} size="small">
                    <ContentCopy />
                  </IconButton>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Share />}
                  onClick={shareReferral}
                >
                  Share with Friends
                </Button>
              </Paper>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Referral Benefits
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Your friend gets 100 points"
                      secondary="When they sign up with your code"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="You get 150 points"
                      secondary="When your friend makes their first booking"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Bonus rewards"
                      secondary="Unlock special badges when you refer 5, 10, or 25 friends"
                    />
                  </ListItem>
                </List>
              </Box>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Your Referrals
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">
                      {rewards.referralsCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Friends Referred
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </CardContent>
          </TabPanel>

          {/* Tab 4: Leaderboard */}
          <TabPanel value={tabValue} index={3}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Compete with students across the platform
              </Typography>
              <List>
                {leaderboard.map((user) => (
                  <ListItem
                    key={user.rank}
                    sx={{
                      bgcolor: user.isCurrentUser ? '#e3f2fd' : 'transparent',
                      borderRadius: 1,
                      mb: 1,
                      border: user.isCurrentUser ? 2 : 0,
                      borderColor: 'primary.main',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: user.rank === 1 ? '#f59e0b' : user.rank === 2 ? '#9ca3af' : user.rank === 3 ? '#d97706' : '#2563eb',
                        }}
                      >
                        {user.rank <= 3 ? <EmojiEvents /> : user.avatar}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" fontWeight="bold">
                            #{user.rank}
                          </Typography>
                          <Typography variant="body1">
                            {user.name}
                          </Typography>
                          {user.isCurrentUser && (
                            <Chip label="You" size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={`${user.points} points`}
                    />
                    {user.rank <= 3 && (
                      <WorkspacePremium sx={{ color: user.rank === 1 ? '#f59e0b' : user.rank === 2 ? '#9ca3af' : '#d97706' }} />
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </TabPanel>
        </Card>

        {/* Progress to Next Level */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1">Progress to Level {rewards.level + 1}</Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                {rewards.points}/500
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(rewards.points / 500) * 100}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {500 - rewards.points} points to next level
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
}

