import { ReactNode } from 'react';
import { Card, CardContent, Box, alpha, SxProps, Theme } from '@mui/material';

interface MobileCardProps {
  children: ReactNode;
  onClick?: () => void;
  gradient?: string;
  hover?: boolean;
  sx?: SxProps<Theme>;
  elevation?: number;
}

export default function MobileCard({ 
  children, 
  onClick, 
  gradient, 
  hover = true,
  sx = {},
  elevation = 0,
}: MobileCardProps) {
  return (
    <Card
      onClick={onClick}
      elevation={elevation}
      sx={{
        borderRadius: 2,
        background: gradient || 'white',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        ...(hover && onClick && {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
          '&:active': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          },
        }),
        ...sx,
      }}
    >
      {children}
    </Card>
  );
}

// Compact Card for Lists
export function CompactCard({ 
  children, 
  onClick, 
  sx = {} 
}: { 
  children: ReactNode; 
  onClick?: () => void;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: 'white',
        borderRadius: 1.5,
        p: 2,
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...(onClick && {
          '&:active': {
            transform: 'scale(0.98)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          },
        }),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

// Gradient Card
export function GradientCard({ 
  children, 
  gradient, 
  onClick,
  sx = {}
}: { 
  children: ReactNode; 
  gradient: string;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        background: gradient,
        borderRadius: 2,
        p: 2.5,
        color: 'white',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...(onClick && {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        }),
        ...sx,
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: alpha('#ffffff', 0.1),
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -10,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: alpha('#ffffff', 0.05),
        }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
}

// Glass Card
export function GlassCard({ 
  children, 
  onClick,
  sx = {}
}: { 
  children: ReactNode; 
  onClick?: () => void;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      onClick={onClick}
      className="glass"
      sx={{
        borderRadius: 2,
        p: 2.5,
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...(onClick && {
          '&:active': {
            transform: 'scale(0.98)',
          },
        }),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

