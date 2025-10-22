/**
 * StudySpot Mobile App - About Screen
 * About the app screen
 */

import React from 'react';
import {Box, Text, VStack, Button} from 'native-base';
import {COLORS, LAYOUT} from '@constants/index';

const AboutScreen: React.FC = () => {
  return (
    <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY} px={LAYOUT.PADDING.LG}>
      <VStack flex={1} justifyContent="center" space={6}>
        <Text fontSize="2xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY} textAlign="center">
          About StudySpot
        </Text>
        <Text fontSize="md" color={COLORS.TEXT.SECONDARY} textAlign="center">
          Learn more about StudySpot and our mission
        </Text>
        <Button
          backgroundColor={COLORS.PRIMARY}
          _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
          mt={4}>
          Learn More
        </Button>
      </VStack>
    </Box>
  );
};

export default AboutScreen;
