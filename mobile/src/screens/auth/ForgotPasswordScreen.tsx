/**
 * StudySpot Mobile App - Forgot Password Screen
 * Password reset screen
 */

import React from 'react';
import {Box, Text, VStack, Button} from 'native-base';
import {COLORS, LAYOUT} from '@constants/index';

const ForgotPasswordScreen: React.FC = () => {
  return (
    <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY} px={LAYOUT.PADDING.LG}>
      <VStack flex={1} justifyContent="center" space={6}>
        <Text fontSize="2xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY} textAlign="center">
          Forgot Password?
        </Text>
        <Text fontSize="md" color={COLORS.TEXT.SECONDARY} textAlign="center">
          Enter your email to reset your password
        </Text>
        <Button
          backgroundColor={COLORS.PRIMARY}
          _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
          mt={4}>
          Send Reset Link
        </Button>
      </VStack>
    </Box>
  );
};

export default ForgotPasswordScreen;
