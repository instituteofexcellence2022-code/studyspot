/**
 * StudySpot Mobile App - Offline Indicator Component
 * Shows offline status and sync progress
 */

import React, {useEffect, useState} from 'react';
import {Box, Text, HStack, Button, Spinner} from 'native-base';
import {Animated, Dimensions} from 'react-native';
import {useAppDispatch, useAppSelector} from '../hooks/redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {COLORS, LAYOUT} from '@constants/index';
import {
  selectIsOnline,
  selectIsSyncing,
  selectPendingActions,
  selectLastSyncTime,
  selectSyncError,
  syncOfflineActions,
  syncOfflineData,
  clearSyncError,
} from '@store/slices/offlineSlice';

const {width} = Dimensions.get('window');

const OfflineIndicator: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOnline = useAppSelector(selectIsOnline);
  const isSyncing = useAppSelector(selectIsSyncing);
  const pendingActions = useAppSelector(selectPendingActions);const syncError = useAppSelector(selectSyncError);

  const [showIndicator, setShowIndicator] = useState(false);
  const [slideAnimation] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (!isOnline || pendingActions > 0 || isSyncing || syncError) {
      setShowIndicator(true);
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnimation, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowIndicator(false);
      });
    }
  }, [isOnline, pendingActions, isSyncing, syncError]);

  const handleSync = () => {
    dispatch(syncOfflineActions());
    dispatch(syncOfflineData());
  };

  const handleDismissError = () => {
    dispatch(clearSyncError());
  };

  const getIndicatorContent = () => {
    if (!isOnline) {
      return (
        <HStack alignItems="center" space={3}>
          <Icon name="wifi-off" size={20} color="white" />
          <Text color="white" fontSize="sm" fontWeight="medium">
            You're offline
          </Text>
        </HStack>
      );
    }

    if (syncError) {
      return (
        <HStack alignItems="center" space={3} flex={1}>
          <Icon name="error" size={20} color="white" />
          <Text color="white" fontSize="sm" fontWeight="medium" flex={1}>
            Sync failed. Tap to retry.
          </Text>
          <Button
            size="sm"
            variant="outline"
            borderColor="white"
            _pressed={{backgroundColor: 'rgba(255,255,255,0.2)'}}
            onPress={handleSync}>
            <Text color="white" fontSize="xs">Retry</Text>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            _pressed={{backgroundColor: 'rgba(255,255,255,0.2)'}}
            onPress={handleDismissError}>
            <Icon name="close" size={16} color="white" />
          </Button>
        </HStack>
      );
    }

    if (isSyncing) {
      return (
        <HStack alignItems="center" space={3}>
          <Spinner size="sm" color="white" />
          <Text color="white" fontSize="sm" fontWeight="medium">
            Syncing...
          </Text>
        </HStack>
      );
    }

    if (pendingActions > 0) {
      return (
        <HStack alignItems="center" space={3} flex={1}>
          <Icon name="sync" size={20} color="white" />
          <Text color="white" fontSize="sm" fontWeight="medium" flex={1}>
            {pendingActions} action{pendingActions > 1 ? 's' : ''} pending sync
          </Text>
          <Button
            size="sm"
            variant="outline"
            borderColor="white"
            _pressed={{backgroundColor: 'rgba(255,255,255,0.2)'}}
            onPress={handleSync}>
            <Text color="white" fontSize="xs">Sync Now</Text>
          </Button>
        </HStack>
      );
    }

    return null;
  };

  const getIndicatorColor = () => {
    if (!isOnline) {return COLORS.ERROR;}
    if (syncError) {return COLORS.ERROR;}
    if (isSyncing) {return COLORS.INFO;}
    if (pendingActions > 0) {return COLORS.WARNING;}
    return COLORS.SUCCESS;
  };

  if (!showIndicator) {
    return null;
  }

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transform: [{translateY: slideAnimation}],
      }}>
      <Box
        backgroundColor={getIndicatorColor()}
        px={LAYOUT.PADDING.LG}
        py={LAYOUT.PADDING.SM}
        width={width}>
        {getIndicatorContent()}
      </Box>
    </Animated.View>
  );
};

export default OfflineIndicator;


