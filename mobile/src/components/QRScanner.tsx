/**
 * StudySpot Mobile App - QR Code Scanner Component
 * QR code scanning for library check-in/out functionality
 */

import React, {useState, useEffect} from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Alert,
  Spinner,
  Modal,
  Pressable,
} from 'native-base';
import {View, StyleSheet, Dimensions} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {useCodeScanner} from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {COLORS, LAYOUT} from '@constants/index';

interface QRScannerProps {
  isVisible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  title?: string;
  subtitle?: string;
  type?: 'checkin' | 'checkout' | 'general';
}

const {width, height} = Dimensions.get('window');

const QRScanner: React.FC<QRScannerProps> = ({
  isVisible,
  onClose,
  onScan,
  title = 'Scan QR Code',
  subtitle = 'Point your camera at the QR code',
  type = 'general',
}) => {
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back') || devices[0];
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scanError, setScanError] = useState<string | null>(null);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && isScanning) {
        const code = codes[0];
        if (code.value) {
          setIsScanning(false);
          onScan(code.value);
        }
      }
    },
  });

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    const permission = await Camera.requestCameraPermission();
    setHasPermission(permission === 'granted');
  };

  const handleScan = (data: string) => {
    try {
      // Parse QR code data
      const qrData = JSON.parse(data);

      // Validate QR code structure
      if (!qrData.libraryId || !qrData.type) {
        setScanError('Invalid QR code format');
        return;
      }

      // Check if QR code type matches scanner type
      if (type !== 'general' && qrData.type !== type) {
        setScanError(`This QR code is for ${qrData.type}, but you're trying to ${type}`);
        return;
      }

      onScan(data);
    } catch (error) {
      setScanError('Invalid QR code. Please scan a valid StudySpot QR code.');
    }
  };

  const handleRetry = () => {
    setScanError(null);
    setIsScanning(true);
  };

  const getScannerIcon = () => {
    switch (type) {
      case 'checkin':
        return 'login';
      case 'checkout':
        return 'logout';
      default:
        return 'qr-code-scanner';
    }
  };

  const getScannerColor = () => {
    switch (type) {
      case 'checkin':
        return COLORS.SUCCESS;
      case 'checkout':
        return COLORS.INFO;
      default:
        return COLORS.PRIMARY;
    }
  };

  if (hasPermission === null) {
    return (
      <Modal isOpen={isVisible} onClose={onClose} size="full">
        <Modal.Content backgroundColor={COLORS.BACKGROUND.PRIMARY}>
          <Modal.Body>
            <VStack flex={1} justifyContent="center" alignItems="center" space={4}>
              <Spinner size="lg" color={COLORS.PRIMARY} />
              <Text color={COLORS.TEXT.SECONDARY}>Requesting camera permission...</Text>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal isOpen={isVisible} onClose={onClose} size="full">
        <Modal.Content backgroundColor={COLORS.BACKGROUND.PRIMARY}>
          <Modal.Header backgroundColor={COLORS.BACKGROUND.PRIMARY}>
            <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
              Camera Permission Required
            </Text>
          </Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <Alert status="warning" borderRadius="md">
                <Alert.Icon />
                <Text color="red.500" fontSize="sm">Camera access is required to scan QR codes</Text>
              </Alert>
              <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                Please enable camera permission in your device settings to use the QR scanner.
              </Text>
            </VStack>
          </Modal.Body>
          <Modal.Footer backgroundColor={COLORS.BACKGROUND.PRIMARY}>
            <Button
              variant="outline"
              borderColor={COLORS.PRIMARY}
              _pressed={{backgroundColor: COLORS.PRIMARY + '20'}}
              onPress={onClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    );
  }

  if (!device) {
    return (
      <Modal isOpen={isVisible} onClose={onClose} size="full">
        <Modal.Content backgroundColor={COLORS.BACKGROUND.PRIMARY}>
          <Modal.Body>
            <VStack flex={1} justifyContent="center" alignItems="center" space={4}>
              <Icon name="camera-alt" size={60} color={COLORS.GRAY[400]} />
              <Text fontSize="lg" color={COLORS.TEXT.PRIMARY}>
                Camera not available
              </Text>
              <Text fontSize="sm" color={COLORS.TEXT.SECONDARY} textAlign="center">
                Your device doesn't have a camera or it's not accessible.
              </Text>
              <Button
                backgroundColor={COLORS.PRIMARY}
                _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
                onPress={onClose}>
                Close
              </Button>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isVisible} onClose={onClose} size="full">
      <Modal.Content backgroundColor="transparent" flex={1}>
        <Box flex={1} backgroundColor="black">
          {/* Camera View */}
          <View style={styles.cameraContainer}>
            <Camera
              style={styles.camera}
              device={device}
              isActive={isVisible}
              codeScanner={codeScanner}
            />

            {/* Overlay */}
            <View style={styles.overlay}>
              {/* Header */}
              <Box
                backgroundColor="rgba(0,0,0,0.7)"
                px={LAYOUT.PADDING.LG}
                py={LAYOUT.PADDING.MD}>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1} space={1}>
                    <Text fontSize="lg" fontWeight="semibold" color="white">
                      {title}
                    </Text>
                    <Text fontSize="sm" color="rgba(255,255,255,0.8)">
                      {subtitle}
                    </Text>
                  </VStack>
                  <Pressable onPress={onClose} p={2}>
                    <Icon name="close" size={24} color="white" />
                  </Pressable>
                </HStack>
              </Box>

              {/* Scanning Area */}
              <View style={styles.scanArea}>
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>

                {/* Scanning Indicator */}
                {isScanning && (
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    style={{transform: [{translateX: -20}, {translateY: -20}]}}>
                    <Icon name={getScannerIcon()} size={40} color={getScannerColor()} />
                  </Box>
                )}
              </View>

              {/* Instructions */}
              <Box
                backgroundColor="rgba(0,0,0,0.7)"
                px={LAYOUT.PADDING.LG}
                py={LAYOUT.PADDING.MD}
                position="absolute"
                bottom={0}
                left={0}
                right={0}>
                <VStack space={3} alignItems="center">
                  <Text fontSize="sm" color="white" textAlign="center">
                    Position the QR code within the frame above
                  </Text>

                  {scanError && (
                    <Alert status="error" borderRadius="md" width="100%">
                      <Alert.Icon />
                      <Text color="red.500" fontSize="sm" flex={1}>{scanError}</Text>
                    </Alert>
                  )}

                  <HStack space={3}>
                    <Button
                      variant="outline"
                      borderColor="white"
                      _pressed={{backgroundColor: 'rgba(255,255,255,0.2)'}}
                      onPress={onClose}>
                      <Text color="white">Cancel</Text>
                    </Button>

                    {scanError && (
                      <Button
                        backgroundColor={getScannerColor()}
                        _pressed={{backgroundColor: getScannerColor() + '80'}}
                        onPress={handleRetry}>
                        <Text color="white">Try Again</Text>
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </Box>
            </View>
          </View>
        </Box>
      </Modal.Content>
    </Modal>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.PRIMARY,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});

export default QRScanner;


