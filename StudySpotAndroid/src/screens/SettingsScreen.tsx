/**
 * StudySpot Mobile App - Settings Screen
 * App settings and preferences
 */

import React from 'react';
import {Box, Text, VStack, Button} from 'native-base';
import {COLORS, LAYOUT} from '@constants/index';

const SettingsScreen: React.FC = () => {
  return (
    <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY} px={LAYOUT.PADDING.LG}>
      <VStack flex={1} justifyContent="center" space={6}>
        <Text fontSize="2xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY} textAlign="center">
          Settings
        </Text>
        <Text fontSize="md" color={COLORS.TEXT.SECONDARY} textAlign="center">
          Configure your app preferences and settings
        </Text>
        <Button
          backgroundColor={COLORS.PRIMARY}
          _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
          mt={4}>
          Save Settings
        </Button>
      </VStack>
    </Box>
  );
};

export default SettingsScreen;
