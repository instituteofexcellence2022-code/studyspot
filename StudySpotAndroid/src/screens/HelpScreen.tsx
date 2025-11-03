/**
 * StudySpot Mobile App - Help Screen
 * Help and support screen
 */

import React from 'react';
import {Box, Text, VStack, Button} from 'native-base';
import {COLORS, LAYOUT} from '@constants/index';

const HelpScreen: React.FC = () => {
  return (
    <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY} px={LAYOUT.PADDING.LG}>
      <VStack flex={1} justifyContent="center" space={6}>
        <Text fontSize="2xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY} textAlign="center">
          Help & Support
        </Text>
        <Text fontSize="md" color={COLORS.TEXT.SECONDARY} textAlign="center">
          Get help and support for using StudySpot
        </Text>
        <Button
          backgroundColor={COLORS.PRIMARY}
          _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
          mt={4}>
          Contact Support
        </Button>
      </VStack>
    </Box>
  );
};

export default HelpScreen;
