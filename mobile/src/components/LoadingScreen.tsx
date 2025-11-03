/**
 * StudySpot Mobile App - Enhanced Loading Screen with Lottie
 * Professional loading animation
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Box, Text, VStack } from 'native-base';
import { LoadingAnimation } from '../common/LottieAnimations';
import { COLORS } from '../../constants';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
  showAnimation?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  showAnimation = true 
}) => {
  return (
    <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY} justifyContent="center" alignItems="center">
      <VStack space={4} alignItems="center">
        {showAnimation && (
          <LoadingAnimation size={120} />
        )}
        
        <Text 
          fontSize="lg" 
          color={COLORS.TEXT.PRIMARY}
          fontWeight="medium"
          textAlign="center"
        >
          {message}
        </Text>
        
        <Text 
          fontSize="sm" 
          color={COLORS.TEXT.SECONDARY}
          textAlign="center"
          maxWidth={width * 0.8}
        >
          Please wait while we prepare your StudySpot experience
        </Text>
      </VStack>
    </Box>
  );
};

export default LoadingScreen;