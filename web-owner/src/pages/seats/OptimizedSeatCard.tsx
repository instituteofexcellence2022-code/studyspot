import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { Close } from '@mui/icons-material';

interface SeatCardProps {
  seat: {
    id: string;
    zone: string;
    status: string;
    pricing: { [key: string]: number };
    features: {
      window: boolean;
      power: boolean;
      locker: boolean;
    };
  };
  bookingDuration: string;
  zoneColor: string;
  onClick: (id: string) => void;
  getSeatIcon: (seat: any) => string;
  zoneLabel: string;
}

const SeatCard: React.FC<SeatCardProps> = React.memo(({ 
  seat, 
  bookingDuration, 
  zoneColor, 
  onClick, 
  getSeatIcon,
  zoneLabel 
}) => {
  const handleClick = () => onClick(seat.id);
  
  const tooltipContent = (
    <Box>
      <Typography variant="caption" fontWeight="bold">{seat.id} - {zoneLabel}</Typography>
      <Typography variant="caption">💰 ₹{seat.pricing[bookingDuration].toLocaleString()}/{bookingDuration}</Typography>
      {getSeatIcon(seat) && <Typography variant="caption">{getSeatIcon(seat)}</Typography>}
    </Box>
  );

  return (
    <Tooltip title={tooltipContent}>
      <Box
        onClick={handleClick}
        sx={{
          width: 55,
          height: 55,
          bgcolor: seat.status === 'occupied' ? '#757575' : 
                   seat.status === 'selected' ? '#1976D2' : zoneColor,
          border: '2px solid',
          borderColor: seat.status === 'selected' ? '#1976D2' : '#ddd',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: seat.status === 'occupied' ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          '&:hover': seat.status !== 'occupied' ? {
            transform: 'scale(1.05)',
            boxShadow: 3,
            zIndex: 10,
          } : {},
        }}
      >
        {seat.status === 'occupied' ? (
          <Close sx={{ fontSize: 20, color: 'white' }} />
        ) : (
          <>
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 'bold', 
                fontSize: '0.75rem',
                color: seat.status === 'selected' ? 'white' : '#333'
              }}
            >
              {seat.id}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '0.6rem',
                color: seat.status === 'selected' ? 'white' : '#666'
              }}
            >
              ₹{seat.pricing[bookingDuration].toLocaleString()}
            </Typography>
          </>
        )}
      </Box>
    </Tooltip>
  );
});

SeatCard.displayName = 'SeatCard';

export default SeatCard;















