import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
} from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';

interface Activity {
  id: string;
  type: 'booking' | 'cancellation' | 'payment';
  title: string;
  description: string;
  time: string;
  status: 'completed' | 'pending' | 'cancelled';
}

const RecentActivity: React.FC = () => {
  // Mock data - replace with actual data from Redux store
  const activities: Activity[] = [
    {
      id: '1',
      type: 'booking',
      title: 'New Booking',
      description: 'Central Library - Seat A1',
      time: '2 hours ago',
      status: 'completed',
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Successful',
      description: '₹500 for 1 day booking',
      time: '2 hours ago',
      status: 'completed',
    },
    {
      id: '3',
      type: 'booking',
      title: 'Booking Reminder',
      description: 'Your booking starts in 1 hour',
      time: '1 hour ago',
      status: 'pending',
    },
    {
      id: '4',
      type: 'cancellation',
      title: 'Booking Cancelled',
      description: 'City Library - Seat B3',
      time: 'Yesterday',
      status: 'cancelled',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'cancelled':
        return <CancelIcon color="error" />;
      default:
        return <BookIcon />;
    }
  };

  const getStatusChip = (status: string) => {
    const colors: any = {
      completed: 'success',
      pending: 'warning',
      cancelled: 'error',
    };
    return <Chip label={status} color={colors[status]} size="small" />;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          {activities.map((activity) => (
            <ListItem
              key={activity.id}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <ListItemIcon>
                {getStatusIcon(activity.status)}
              </ListItemIcon>
              <ListItemText
                primary={activity.title}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {activity.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                }
              />
              {getStatusChip(activity.status)}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;


