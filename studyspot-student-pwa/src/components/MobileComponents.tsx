import { ReactNode } from 'react';
import { Box, Typography, Chip, alpha, SxProps, Theme, CircularProgress } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';

// Section Header
export function SectionHeader({ 
  title, 
  subtitle, 
  action 
}: { 
  title: string; 
  subtitle?: string; 
  action?: ReactNode;
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.5px' }}>
          {title}
        </Typography>
        {action}
      </Box>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

// Stat Card
export function StatCard({ 
  icon, 
  value, 
  label, 
  color, 
  onClick,
  trend,
}: { 
  icon: ReactNode; 
  value: string | number; 
  label: string; 
  color: string;
  onClick?: () => void;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: 'white',
        borderRadius: 1.5,
        p: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        ...(onClick && {
          '&:active': {
            transform: 'scale(0.95)',
          },
        }),
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          right: -10,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: alpha(color, 0.08),
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: alpha(color, 0.12),
              color: color,
            }}
          >
            {icon}
          </Box>
          {trend && (
            <Chip
              label={`${trend.positive ? '+' : ''}${trend.value}%`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.688rem',
                fontWeight: 700,
                bgcolor: alpha(trend.positive ? '#10b981' : '#ef4444', 0.12),
                color: trend.positive ? '#10b981' : '#ef4444',
              }}
            />
          )}
        </Box>
        
        <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5, color: 'text.primary' }}>
          {value}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

// List Item
export function ListItem({ 
  icon, 
  title, 
  subtitle, 
  rightContent, 
  onClick,
  color,
}: { 
  icon?: ReactNode; 
  title: string; 
  subtitle?: string; 
  rightContent?: ReactNode;
  onClick?: () => void;
  color?: string;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        bgcolor: 'white',
        borderRadius: 1.5,
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        ...(onClick && {
          '&:active': {
            transform: 'scale(0.98)',
            bgcolor: alpha(color || '#6366f1', 0.02),
          },
        }),
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: alpha(color || '#6366f1', 0.12),
            color: color || '#6366f1',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}
      
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body1" fontWeight={600} sx={{ mb: subtitle ? 0.25 : 0 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" className="truncate">
            {subtitle}
          </Typography>
        )}
      </Box>

      {rightContent || (onClick && <ChevronRight sx={{ color: 'text.secondary', fontSize: 20 }} />)}
    </Box>
  );
}

// Empty State
export function EmptyState({ 
  icon, 
  title, 
  description, 
  action 
}: { 
  icon: ReactNode; 
  title: string; 
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
        width: 80,
        height: 80,
        borderRadius: 2,
        display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha('#6366f1', 0.1),
          color: '#6366f1',
          mb: 2,
          fontSize: 40,
        }}
      >
        {icon}
      </Box>
      
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 280 }}>
          {description}
        </Typography>
      )}

      {action}
    </Box>
  );
}

// Loading State
export function LoadingState({ message }: { message?: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 2,
      }}
    >
      <CircularProgress size={40} thickness={4} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}

// Badge Chip
export function BadgeChip({ 
  label, 
  color, 
  variant = 'filled' 
}: { 
  label: string; 
  color: string;
  variant?: 'filled' | 'outlined';
}) {
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 24,
        fontSize: '0.75rem',
        fontWeight: 600,
        borderRadius: 1.5,
        ...(variant === 'filled' ? {
          bgcolor: alpha(color, 0.12),
          color: color,
        } : {
          borderColor: alpha(color, 0.3),
          color: color,
        }),
      }}
      variant={variant}
    />
  );
}

// Info Row
export function InfoRow({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string;
  icon?: ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon && (
          <Box sx={{ color: 'text.secondary', fontSize: 20, display: 'flex' }}>
            {icon}
          </Box>
        )}
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}

// Floating Action Button
export function FloatingButton({ 
  icon, 
  label, 
  onClick,
  color = '#6366f1',
}: { 
  icon: ReactNode; 
  label: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'fixed',
        bottom: 80,
        right: 16,
        zIndex: 1000,
        width: 56,
        height: 56,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
        },
        '&:active': {
          transform: 'scale(0.95)',
        },
      }}
    >
      {icon}
    </Box>
  );
}

// Skeleton Loader
export function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <Box
      className="skeleton"
      sx={{
        height,
        borderRadius: 1.5,
        bgcolor: '#f0f0f0',
      }}
    />
  );
}

