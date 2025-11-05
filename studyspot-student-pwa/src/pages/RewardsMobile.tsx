import { Box, Typography, LinearProgress, alpha, Button } from '@mui/material';
import {
  EmojiEvents,
  LocalFireDepartment,
  Stars,
  CardGiftcard,
  ArrowForward,
  Redeem,
  TrendingUp,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../components/MobileLayout';
import { SectionHeader, ListItem, BadgeChip } from '../components/MobileComponents';
import { GradientCard, CompactCard } from '../components/MobileCard';
import { gradients } from '../theme/mobileTheme';

interface RewardsMobileProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function RewardsMobile({ setIsAuthenticated }: RewardsMobileProps) {
  const navigate = useNavigate();

  const userPoints = 850;
  const nextTierPoints = 1000;
  const progress = (userPoints / nextTierPoints) * 100;

  const achievements = [
    { id: 1, title: 'First Booking', icon: '🎯', unlocked: true, points: 50 },
    { id: 2, title: '7 Day Streak', icon: '🔥', unlocked: true, points: 100 },
    { id: 3, title: '10 Bookings', icon: '📚', unlocked: true, points: 150 },
    { id: 4, title: 'Early Bird', icon: '🌅', unlocked: true, points: 75 },
    { id: 5, title: '25 Bookings', icon: '⭐', unlocked: false, points: 250 },
    { id: 6, title: 'Night Owl', icon: '🦉', unlocked: false, points: 100 },
  ];

  const rewards = [
    { id: 1, title: '₹50 Off Voucher', points: 500, icon: '🎟️', available: true },
    { id: 2, title: '₹100 Off Voucher', points: 900, icon: '🎫', available: false },
    { id: 3, title: 'Free 2 Hour Session', points: 800, icon: '⏰', available: true },
    { id: 4, title: 'Premium Seat Access', points: 1200, icon: '💎', available: false },
    { id: 5, title: '₹200 Off Voucher', points: 1500, icon: '🎁', available: false },
  ];

  return (
    <MobileLayout setIsAuthenticated={setIsAuthenticated}>
      <Box sx={{ animation: 'fadeIn 0.4s ease-in' }}>
        {/* Points Header */}
        <GradientCard gradient={gradients.orange} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                Your Reward Points
              </Typography>
              <Typography variant="h2" fontWeight={900} sx={{ letterSpacing: '-1px' }}>
                {userPoints}
              </Typography>
            </Box>
            
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: 3,
                bgcolor: alpha('#ffffff', 0.2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
              }}
            >
              <EmojiEvents sx={{ fontSize: 40 }} />
            </Box>
          </Box>

          {/* Progress to Next Tier */}
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography variant="body2" fontWeight={600}>
                Progress to Silver Tier
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {nextTierPoints - userPoints} points to go
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: alpha('#ffffff', 0.2),
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'white',
                  borderRadius: 1,
                },
              }}
            />
          </Box>
        </GradientCard>

        {/* Quick Stats */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: 1.5,
          mb: 3 
        }}>
          <CompactCard>
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h5" fontWeight={800} color="primary.main" sx={{ mb: 0.5 }}>
                375
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Earned Points
              </Typography>
            </Box>
          </CompactCard>

          <CompactCard>
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h5" fontWeight={800} color="success.main" sx={{ mb: 0.5 }}>
                4
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Achievements
              </Typography>
            </Box>
          </CompactCard>

          <CompactCard>
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h5" fontWeight={800} color="warning.main" sx={{ mb: 0.5 }}>
                2
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Redeemed
              </Typography>
            </Box>
          </CompactCard>
        </Box>

        {/* Achievements */}
        <SectionHeader
          title="Achievements"
          subtitle="Unlock rewards by completing challenges"
          action={
            <Button size="small" endIcon={<ArrowForward />}>
              View All
            </Button>
          }
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1.5,
            mb: 3,
          }}
        >
          {achievements.map((achievement) => (
            <Box
              key={achievement.id}
              sx={{
                textAlign: 'center',
                p: 2,
                borderRadius: 2.5,
                bgcolor: 'white',
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                opacity: achievement.unlocked ? 1 : 0.5,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {achievement.unlocked && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle sx={{ fontSize: 14, color: 'white' }} />
                </Box>
              )}
              
              <Typography variant="h3" sx={{ mb: 0.5 }}>
                {achievement.icon}
              </Typography>
              <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.25 }}>
                {achievement.title}
              </Typography>
              <BadgeChip
                label={`${achievement.points} pts`}
                color="#f59e0b"
                variant="filled"
              />
            </Box>
          ))}
        </Box>

        {/* Available Rewards */}
        <SectionHeader
          title="Redeem Rewards"
          subtitle="Use your points to get rewards"
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          {rewards.map((reward) => {
            const canRedeem = userPoints >= reward.points;
            
            return (
              <CompactCard
                key={reward.id}
                sx={{
                  opacity: canRedeem ? 1 : 0.6,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      background: canRedeem ? gradients.primary : alpha('#64748b', 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.75rem',
                      flexShrink: 0,
                    }}
                  >
                    {reward.icon}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" fontWeight={700} sx={{ mb: 0.25 }}>
                      {reward.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Stars sx={{ fontSize: 14, color: '#f59e0b' }} />
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        {reward.points} points
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant={canRedeem ? 'contained' : 'outlined'}
                    size="small"
                    disabled={!canRedeem}
                    startIcon={<Redeem />}
                    sx={{
                      borderRadius: 1.5,
                      fontWeight: 600,
                      ...(canRedeem && {
                        background: gradients.success,
                      }),
                    }}
                  >
                    Redeem
                  </Button>
                </Box>
              </CompactCard>
            );
          })}
        </Box>

        {/* Earn More Points Card */}
        <Box
          onClick={() => navigate('/referral')}
          sx={{
            background: gradients.pink,
            borderRadius: 3,
            p: 2.5,
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            '&:active': { transform: 'scale(0.98)' },
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: alpha('#ffffff', 0.2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}
          >
            <TrendingUp sx={{ fontSize: 32 }} />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.25 }}>
              Earn More Points
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.813rem' }}>
              Refer friends and earn ₹500 + bonus points!
            </Typography>
          </Box>

          <ArrowForward />
        </Box>
      </Box>
    </MobileLayout>
  );
}

