/**
 * StudySpot Mobile App - Onboarding Screen
 * Welcome screen for new users
 */

import React from 'react';
import {Box, Text, VStack, Button} from 'native-base';
import {COLORS, LAYOUT} from '@constants/index';

const OnboardingScreen: React.FC = () => {
  return (
    <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY} px={LAYOUT.PADDING.LG}>
      <VStack flex={1} justifyContent="center" alignItems="center" space={8}>
        <Text fontSize="3xl" fontWeight="bold" color={COLORS.PRIMARY} textAlign="center">
          Welcome to StudySpot
        </Text>
        <Text fontSize="lg" color={COLORS.TEXT.SECONDARY} textAlign="center">
          Find the perfect study space near you
        </Text>
        <Button
          backgroundColor={COLORS.PRIMARY}
          _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
          px={8}
          py={3}>
          Get Started
        </Button>
      </VStack>
    </Box>
  );
};

export default OnboardingScreen;
