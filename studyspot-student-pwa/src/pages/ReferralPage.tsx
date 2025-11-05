import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  alpha,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy,
  WhatsApp,
  Facebook,
  Twitter,
  Email,
  CheckCircle,
  HourglassEmpty,
  CardGiftcard,
  TrendingUp,
  Person,
  QrCode2,
  MonetizationOn,
  GroupAdd,
  EmojiEvents,
  Celebration,
  ArrowForward,
  LocalFireDepartment,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import Layout from '../components/MobileLayout';
import { advancedGradients, glassEffects } from '../theme/premiumTheme';
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
  const [referralLink] = useState(`https://studyspot.app/register?ref=${referralCode}`);
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    totalEarned: 0,
    nextMilestone: 5,
    potentialEarnings: 0,
  });

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const response = await api.get('/api/referrals/my-referrals');
      const data = response.data.data || mockReferrals;
      setReferrals(data);
      calculateStats(data);
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
      setReferrals(mockReferrals);
      calculateStats(mockReferrals);
    }
  };

  const mockReferrals: Referral[] = [
    { id: '1', friendName: 'Rahul Sharma', email: 'rahul@example.com', status: 'completed', date: '2024-10-25', reward: 500, earnedOn: '2024-10-28' },
    { id: '2', friendName: 'Priya Singh', email: 'priya@example.com', status: 'signed_up', date: '2024-11-01', reward: 500 },
    { id: '3', friendName: 'Amit Kumar', email: 'amit@example.com', status: 'pending', date: '2024-11-02', reward: 500 },
    { id: '4', friendName: 'Sneha Patel', email: 'sneha@example.com', status: 'completed', date: '2024-10-20', reward: 500, earnedOn: '2024-10-23' },
  ];

  const calculateStats = (refs: Referral[]) => {
    const successful = refs.filter(r => r.status === 'completed').length;
    const pending = refs.filter(r => r.status === 'pending').length;
    const total = refs.length;
    const earned = refs.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.reward, 0);
    
    setStats({
      totalReferrals: total,
      successfulReferrals: successful,
      pendingReferrals: pending,
      totalEarned: earned,
      nextMilestone: Math.ceil(total / 5) * 5,
      potentialEarnings: (total + 1) * 500,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const text = `Join StudySpot and get ₹200 OFF! Use my code: ${referralCode}`;
    const url = referralLink;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent('Join StudySpot!')}&body=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'signed_up': return '#f59e0b';
      default: return '#64748b';
    }
  };

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Compact Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
            Refer & Earn <CardGiftcard sx={{ fontSize: 24, color: '#f59e0b' }} />
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Earn ₹500 per friend • They get ₹200 OFF
          </Typography>
        </Box>

        {/* Compact Stats - 4 columns */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {[
            { icon: GroupAdd, value: stats.totalReferrals, label: 'Invited', color: '#6366f1', trend: '+2 this week' },
            { icon: CheckCircle, value: stats.successfulReferrals, label: 'Successful', color: '#10b981', badge: `₹${stats.totalEarned}` },
            { icon: HourglassEmpty, value: stats.pendingReferrals, label: 'Pending', color: '#f59e0b', potential: true },
            { icon: MonetizationOn, value: `₹${stats.totalEarned}`, label: 'Earned', color: '#ec4899', trend: '+₹500' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Grid item xs={3} key={index}>
                <Box sx={{ bgcolor: 'white', borderRadius: 1.5, p: 1.25, textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${stat.color}, ${alpha(stat.color, 0.6)})` }} />
                  <Icon sx={{ fontSize: 22, color: stat.color, mb: 0.5 }} />
                  <Typography variant="body1" fontWeight={800} sx={{ fontSize: '0.938rem', lineHeight: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.625rem', display: 'block', mt: 0.25 }}>
                    {stat.label}
                  </Typography>
                  {stat.trend && (
                    <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.563rem', color: '#10b981', display: 'block', mt: 0.25 }}>
                      {stat.trend}
                    </Typography>
                  )}
                  {stat.badge && (
                    <Chip label={stat.badge} size="small" sx={{ height: 16, fontSize: '0.625rem', mt: 0.5, bgcolor: alpha(stat.color, 0.1), color: stat.color, fontWeight: 700 }} />
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Referral Code Card - Compact */}
        <Box sx={{ background: advancedGradients.primary, borderRadius: 2, p: 2, mb: 2, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="body1" fontWeight={700} color="white" sx={{ mb: 0.5, fontSize: '0.938rem' }}>
              Your Referral Code
            </Typography>
            <Box sx={{ ...glassEffects.light, borderRadius: 1.5, p: 1.5, mb: 1.5, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={900} color="white" sx={{ letterSpacing: 3 }}>
                {referralCode}
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              value={referralLink}
              size="small"
              InputProps={{
                readOnly: true,
                sx: { fontSize: '0.813rem', fontWeight: 500, bgcolor: 'white', borderRadius: 1.5 },
                endAdornment: (
                  <InputAdornment position="end">
                    <Button size="small" startIcon={copied ? <CheckCircle /> : <ContentCopy />} onClick={handleCopy} sx={{ fontSize: '0.75rem', fontWeight: 700, minWidth: 'auto', px: 1.5 }}>
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1.5 }}
            />
            
            <Grid container spacing={1}>
              {[
                { icon: WhatsApp, label: 'WhatsApp', platform: 'whatsapp', color: '#25D366' },
                { icon: Facebook, label: 'Facebook', platform: 'facebook', color: '#1877F2' },
                { icon: Twitter, label: 'Twitter', platform: 'twitter', color: '#1DA1F2' },
                { icon: Email, label: 'Email', platform: 'email', color: '#EA4335' },
              ].map((share) => {
                const Icon = share.icon;
                return (
                  <Grid item xs={3} key={share.platform}>
                    <Button
                      onClick={() => handleShare(share.platform)}
                      sx={{
                        width: '100%',
                        flexDirection: 'column',
                        gap: 0.5,
                        py: 1,
                        borderRadius: 1.5,
                        bgcolor: 'white',
                        color: share.color,
                        fontSize: '0.688rem',
                        fontWeight: 700,
                        '&:hover': { bgcolor: alpha(share.color, 0.1) },
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                      <span>{share.label}</span>
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Box>

        {/* How It Works - Compact */}
        <Box sx={{ bgcolor: 'white', borderRadius: 1.5, p: 2, mb: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5, fontSize: '0.938rem' }}>
            How It Works
          </Typography>
          <Grid container spacing={1.5}>
            {[
              { step: '1', icon: '🔗', title: 'Share Link', desc: 'Share your code with friends' },
              { step: '2', icon: '👤', title: 'They Join', desc: 'Friend signs up & books' },
              { step: '3', icon: '💰', title: 'You Earn', desc: 'Get ₹500 instantly' },
            ].map((item) => (
              <Grid item xs={4} key={item.step}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: alpha('#6366f1', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 0.75, fontSize: '1.5rem' }}>
                    {item.icon}
                  </Box>
                  <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 0.25, fontSize: '0.75rem' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Earnings Breakdown - Compact */}
        <Box sx={{ bgcolor: 'white', borderRadius: 1.5, p: 2, mb: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="body1" fontWeight={700} sx={{ fontSize: '0.938rem' }}>
              Earnings Breakdown
            </Typography>
            <Chip label={`${stats.successfulReferrals}/${stats.nextMilestone} Goal`} size="small" sx={{ height: 20, fontSize: '0.688rem', fontWeight: 700, bgcolor: alpha('#10b981', 0.12), color: '#10b981' }} />
          </Box>
          
          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center', p: 1.25, borderRadius: 1.5, bgcolor: alpha('#10b981', 0.08) }}>
                <Typography variant="h6" fontWeight={800} color="#10b981" sx={{ fontSize: '1.125rem' }}>
                  ₹{stats.totalEarned}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
                  Earned
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center', p: 1.25, borderRadius: 1.5, bgcolor: alpha('#f59e0b', 0.08) }}>
                <Typography variant="h6" fontWeight={800} color="#f59e0b" sx={{ fontSize: '1.125rem' }}>
                  ₹{stats.pendingReferrals * 500}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
                  Pending
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center', p: 1.25, borderRadius: 1.5, bgcolor: alpha('#6366f1', 0.08) }}>
                <Typography variant="h6" fontWeight={800} color="#6366f1" sx={{ fontSize: '1.125rem' }}>
                  ₹{stats.potentialEarnings}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
                  Potential
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                Progress to {stats.nextMilestone} referrals
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.75rem' }}>
                {stats.totalReferrals}/{stats.nextMilestone}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(stats.totalReferrals / stats.nextMilestone) * 100}
              sx={{ height: 6, borderRadius: 1, bgcolor: alpha('#6366f1', 0.1), '& .MuiLinearProgress-bar': { background: advancedGradients.primary, borderRadius: 1 } }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem', mt: 0.5, display: 'block' }}>
              Unlock bonus ₹200 at {stats.nextMilestone} referrals!
            </Typography>
          </Box>
        </Box>

        {/* Share Options - Compact */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<QrCode2 />}
              onClick={() => setShowQR(!showQR)}
              sx={{ borderRadius: 1.5, py: 1.25, fontSize: '0.813rem', fontWeight: 700, borderColor: alpha('#6366f1', 0.3), color: '#6366f1' }}
            >
              {showQR ? 'Hide' : 'Show'} QR Code
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ShareIcon />}
              onClick={() => handleShare('whatsapp')}
              sx={{ borderRadius: 1.5, py: 1.25, fontSize: '0.813rem', fontWeight: 700, background: advancedGradients.success }}
            >
              Share Now
            </Button>
          </Grid>
        </Grid>

        {/* QR Code - Collapsible */}
        {showQR && (
          <Box sx={{ bgcolor: 'white', borderRadius: 1.5, p: 2, mb: 2, textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, fontSize: '0.875rem' }}>
              Scan to Register
            </Typography>
            <Box sx={{ display: 'inline-block', p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <QRCodeSVG value={referralLink} size={140} level="H" />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, fontSize: '0.688rem' }}>
              Friends scan this to join with your code
            </Typography>
          </Box>
        )}

        {/* Referral List - Compact */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1" fontWeight={700} sx={{ fontSize: '0.938rem' }}>
              My Referrals ({stats.totalReferrals})
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {referrals.map((referral) => (
              <Box key={referral.id} sx={{ bgcolor: 'white', borderRadius: 1.5, p: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: alpha(getStatusColor(referral.status), 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', color: getStatusColor(referral.status), flexShrink: 0 }}>
                    <Person sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                      {referral.friendName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
                      {new Date(referral.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip
                      label={referral.status.replace('_', ' ')}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.688rem',
                        fontWeight: 700,
                        bgcolor: alpha(getStatusColor(referral.status), 0.12),
                        color: getStatusColor(referral.status),
                        textTransform: 'capitalize',
                        mb: 0.5,
                      }}
                    />
                    {referral.status === 'completed' && (
                      <Typography variant="caption" fontWeight={700} sx={{ display: 'block', color: '#10b981', fontSize: '0.75rem' }}>
                        +₹{referral.reward}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bonus Tiers - Compact */}
        <Box sx={{ bgcolor: 'white', borderRadius: 1.5, p: 2, mb: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5, fontSize: '0.938rem' }}>
            Bonus Rewards 🎁
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[
              { referrals: 5, bonus: 200, unlocked: stats.successfulReferrals >= 5 },
              { referrals: 10, bonus: 500, unlocked: stats.successfulReferrals >= 10 },
              { referrals: 25, bonus: 1500, unlocked: stats.successfulReferrals >= 25 },
            ].map((tier) => (
              <Box key={tier.referrals} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 1.5, bgcolor: tier.unlocked ? alpha('#10b981', 0.08) : alpha('#64748b', 0.05) }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: tier.unlocked ? alpha('#10b981', 0.15) : alpha('#64748b', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {tier.unlocked ? <CheckCircle sx={{ fontSize: 20, color: '#10b981' }} /> : <EmojiEvents sx={{ fontSize: 20, color: '#64748b' }} />}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                    {tier.referrals} Referrals Bonus
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
                    {tier.unlocked ? 'Unlocked!' : `${tier.referrals - stats.successfulReferrals} more to go`}
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={800} sx={{ color: tier.unlocked ? '#10b981' : '#f59e0b', fontSize: '0.938rem' }}>
                  +₹{tier.bonus}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Tips - Compact */}
        <Box sx={{ bgcolor: alpha('#6366f1', 0.05), borderRadius: 1.5, p: 2, border: `1px solid ${alpha('#6366f1', 0.1)}` }}>
          <Typography variant="body2" fontWeight={700} sx={{ mb: 1, fontSize: '0.875rem', color: '#6366f1' }}>
            💡 Pro Tips to Earn More
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {[
              'Share on WhatsApp groups for quick responses',
              'Post on social media with your QR code',
              'Tell friends about study benefits',
              'Share during exam season for best results',
            ].map((tip, index) => (
              <Typography key={index} variant="caption" sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, fontSize: '0.75rem' }}>
                <span style={{ color: '#6366f1', fontWeight: 700 }}>•</span>
                <span>{tip}</span>
              </Typography>
            ))}
          </Box>
        </Box>
      </Container>
    </Layout>
  );
}
