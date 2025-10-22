/**
 * StudySpot Mobile App - Verify OTP Screen
 * OTP verification screen
 */

import React from 'react';
import {Box, Text, VStack, Button} from 'native-base';
import {COLORS, LAYOUT} from '@constants/index';

const VerifyOTPScreen: React.FC = () => {
  return (
    <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY} px={LAYOUT.PADDING.LG}>
      <VStack flex={1} justifyContent="center" space={6}>
        <Text fontSize="2xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY} textAlign="center">
          Verify OTP
        </Text>
        <Text fontSize="md" color={COLORS.TEXT.SECONDARY} textAlign="center">
          Enter the verification code sent to your email
        </Text>
        <Button
          backgroundColor={COLORS.PRIMARY}
          _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
          mt={4}>
          Verify
        </Button>
      </VStack>
    </Box>
  );
};

export default VerifyOTPScreen;
