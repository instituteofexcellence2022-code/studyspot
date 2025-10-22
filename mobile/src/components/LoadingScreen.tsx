/**
 * StudySpot Mobile App - Loading Screen Component
 * Generic loading screen with app branding
 */

import React from 'react';
import {Box, Spinner, Text, VStack} from 'native-base';
import {COLORS} from '@constants/index';

interface LoadingScreenProps {
  message?: string;
  size?: 'sm' | 'lg';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  size = 'lg',
}) => {
  return (
    <Box
      flex={1}
      backgroundColor={COLORS.BACKGROUND.PRIMARY}
      justifyContent="center"
      alignItems="center"
      px={6}>
      <VStack space={4} alignItems="center">
        <Spinner
          size={size}
          color={COLORS.PRIMARY}
          accessibilityLabel={message}
        />
        <Text
          fontSize="md"
          color={COLORS.TEXT.SECONDARY}
          textAlign="center"
          fontWeight="500">
          {message}
        </Text>
      </VStack>
    </Box>
  );
};

export default LoadingScreen;
