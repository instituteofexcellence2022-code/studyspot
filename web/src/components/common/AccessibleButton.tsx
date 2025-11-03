import React from 'react';
import { Button, ButtonProps } from '@mui/material';

interface AccessibleButtonProps extends ButtonProps {
  ariaLabel: string;
  tooltip?: string;
}

/**
 * Accessible button component with proper ARIA labels and keyboard navigation
 */
const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  ariaLabel,
  tooltip,
  children,
  ...props
}) => {
  return (
    <Button
      {...props}
      aria-label={ariaLabel}
      title={tooltip || ariaLabel}
      sx={{
        '&:focus': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px',
        },
        ...props.sx,
      }}
    >
      {children}
    </Button>
  );
};

export default AccessibleButton;


