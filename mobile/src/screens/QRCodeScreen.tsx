/**
 * StudySpot Mobile App - QR Code Screen
 * Display QR codes for check-in/out and library information
 */

import React, {useState, useEffect} from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  ScrollView,
  Card,
  Button,
  Spinner,
  Avatar,
  Badge,
} from 'native-base';
import QRCode from 'react-native-qrcode-svg';
import {Share} from 'react-native';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAppDispatch, useAppSelector} from '../hooks/redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import {View, Dimensions} from 'react-native';

import {COLORS, LAYOUT} from '@constants/index';
import {RootStackParamList} from '../types/index';
import {selectUser, selectTokens} from '@store/slices/authSlice';
import {selectCurrentBooking} from '@store/slices/bookingsSlice';
import {qrCodeService, QRCodeData} from '@services/QRCodeService';

type QRCodeScreenRouteProp = RouteProp<RootStackParamList, 'QRCode'>;
type QRCodeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QRCode'>;

const {width} = Dimensions.get('window');

const QRCodeScreen: React.FC = () => {
  const route = useRoute<QRCodeScreenRouteProp>();
  const navigation = useNavigation<QRCodeScreenNavigationProp>();const currentBooking = useAppSelector(selectCurrentBooking);

  const {type, libraryId, seatId, bookingId} = route.params;
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [qrComponent, setQrComponent] = useState<React.ReactElement | null>(null);

  useEffect(() => {
    generateQRCode();
  }, [type, libraryId, seatId, bookingId]);

  const generateQRCode = () => {
    try {
      const data = qrCodeService.generateQRData(
        libraryId,
        type as any,
        seatId,
        bookingId
      );

      setQrData(data);

      const qrProps = qrCodeService.generateQRCodeProps(
        data,
        Math.min(width * 0.6, 250),
        COLORS.PRIMARY,
        COLORS.WHITE
      );

      const qrElement = (
        <QRCode
          value={qrCodeService.qrDataToString(data)}
          size={qrProps.size}
          color={qrProps.color}
          backgroundColor={qrProps.backgroundColor}
        />
      );

      setQrComponent(qrElement);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const handleShare = async () => {
    if (!qrData) {return;}

    try {
      const qrString = qrCodeService.qrDataToString(qrData);
      await Share.share({
        message: `StudySpot QR Code: ${qrString}`,
        title: 'StudySpot QR Code',
      });
    } catch (error) {
      console.error('Failed to share QR code:', error);
    }
  };

  const handleRefresh = () => {
    generateQRCode();
  };

  const getQRTitle = () => {
    switch (type) {
      case 'checkin':
        return 'Check-in QR Code';
      case 'checkout':
        return 'Check-out QR Code';
      case 'library':
        return 'Library QR Code';
      case 'seat':
        return 'Seat QR Code';
      default:
        return 'QR Code';
    }
  };

  const getQRDescription = () => {
    switch (type) {
      case 'checkin':
        return 'Show this QR code at the library entrance for check-in';
      case 'checkout':
        return 'Show this QR code at the library exit for check-out';
      case 'library':
        return 'Scan this QR code for library information';
      case 'seat':
        return 'Scan this QR code for seat information';
      default:
        return 'Scan this QR code for information';
    }
  };

  const getQRIcon = () => {
    switch (type) {
      case 'checkin':
        return 'login';
      case 'checkout':
        return 'logout';
      case 'library':
        return 'library-books';
      case 'seat':
        return 'chair';
      default:
        return 'qr-code';
    }
  };

  const getQRColor = () => {
    switch (type) {
      case 'checkin':
        return COLORS.SUCCESS;
      case 'checkout':
        return COLORS.INFO;
      case 'library':
        return COLORS.PRIMARY;
      case 'seat':
        return COLORS.WARNING;
      default:
        return COLORS.PRIMARY;
    }
  };

  return (
    <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY}>
      <ScrollView>
        {/* Header */}
        <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD} backgroundColor={COLORS.WHITE}>
          <VStack space={3} alignItems="center">
            <Avatar size="lg" backgroundColor={getQRColor()}>
              <Icon name={getQRIcon()} size={30} color="white" />
            </Avatar>
            <VStack space={1} alignItems="center">
              <Text fontSize="xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
                {getQRTitle()}
              </Text>
              <Text fontSize="sm" color={COLORS.TEXT.SECONDARY} textAlign="center">
                {getQRDescription()}
              </Text>
            </VStack>
          </VStack>
        </Box>

        {/* QR Code Display */}
        <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD}>
          <Card backgroundColor={COLORS.WHITE} p={6} alignItems="center">
            <VStack space={4} alignItems="center">
              {qrComponent ? (
                <View style={{alignItems: 'center'}}>
                  {qrComponent}
                </View>
              ) : (
                <VStack space={3} alignItems="center">
                  <Spinner size="lg" color={COLORS.PRIMARY} />
                  <Text color={COLORS.TEXT.SECONDARY}>Generating QR Code...</Text>
                </VStack>
              )}

              {/* QR Code Info */}
              {qrData && (
                <VStack space={2} alignItems="center">
                  <Badge backgroundColor={getQRColor()} borderRadius="full">
                    <HStack alignItems="center" space={1}>
                      <Icon name={getQRIcon()} size={12} color="white" />
                      <Text color="white" fontSize="xs" fontWeight="medium" textTransform="capitalize">
                        {qrData.type}
                      </Text>
                    </HStack>
                  </Badge>

                  <Text fontSize="xs" color={COLORS.TEXT.SECONDARY} textAlign="center">
                    Generated: {moment(qrData.timestamp).format('MMM DD, YYYY h:mm A')}
                  </Text>
                </VStack>
              )}
            </VStack>
          </Card>
        </Box>

        {/* Booking Information */}
        {currentBooking && type !== 'library' && (
          <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD}>
            <Card backgroundColor={COLORS.BACKGROUND.CARD} p={4}>
              <VStack space={3}>
                <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                  Booking Details
                </Text>
                <VStack space={2}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>Library</Text>
                    <Text fontSize="sm" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                      {currentBooking.library.name}
                    </Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>Date & Time</Text>
                    <Text fontSize="sm" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                      {moment(currentBooking.bookingDate).format('MMM DD')} - {moment(currentBooking.startTime, 'HH:mm').format('h:mm A')}
                    </Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>Seat</Text>
                    <Text fontSize="sm" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                      {currentBooking.seat.seatNumber} ({currentBooking.seat.zone})
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </Card>
          </Box>
        )}

        {/* Instructions */}
        <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD}>
          <Card backgroundColor={COLORS.INFO + '10'} p={4} borderWidth={1} borderColor={COLORS.INFO}>
            <VStack space={3}>
              <HStack alignItems="center" space={2}>
                <Icon name="info" size={20} color={COLORS.INFO} />
                <Text fontSize="md" fontWeight="semibold" color={COLORS.INFO}>
                  How to Use
                </Text>
              </HStack>

              <VStack space={2}>
                <HStack alignItems="flex-start" space={2}>
                  <Text fontSize="sm" color={COLORS.TEXT.PRIMARY} fontWeight="medium">1.</Text>
                  <Text fontSize="sm" color={COLORS.TEXT.SECONDARY} flex={1}>
                    Show this QR code to the library staff or scan it at the designated kiosk
                  </Text>
                </HStack>

                <HStack alignItems="flex-start" space={2}>
                  <Text fontSize="sm" color={COLORS.TEXT.PRIMARY} fontWeight="medium">2.</Text>
                  <Text fontSize="sm" color={COLORS.TEXT.SECONDARY} flex={1}>
                    Wait for confirmation from the staff or kiosk system
                  </Text>
                </HStack>

                <HStack alignItems="flex-start" space={2}>
                  <Text fontSize="sm" color={COLORS.TEXT.PRIMARY} fontWeight="medium">3.</Text>
                  <Text fontSize="sm" color={COLORS.TEXT.SECONDARY} flex={1}>
                    Your check-in/out will be automatically recorded
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Card>
        </Box>

        {/* Action Buttons */}
        <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD}>
          <VStack space={3}>
            <Button
              backgroundColor={COLORS.PRIMARY}
              _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
              onPress={handleShare}
              leftIcon={<Icon name="share" size={16} color="white" />}
              isDisabled={!qrData}>
              Share QR Code
            </Button>

            <Button
              variant="outline"
              borderColor={COLORS.PRIMARY}
              _pressed={{backgroundColor: COLORS.PRIMARY + '20'}}
              onPress={handleRefresh}
              leftIcon={<Icon name="refresh" size={16} color={COLORS.PRIMARY} />}>
              Refresh QR Code
            </Button>

            <Button
              variant="outline"
              borderColor={COLORS.GRAY[400]}
              _pressed={{backgroundColor: COLORS.GRAY[100]}}
              onPress={() => navigation.goBack()}>
              Close
            </Button>
          </VStack>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default QRCodeScreen;


