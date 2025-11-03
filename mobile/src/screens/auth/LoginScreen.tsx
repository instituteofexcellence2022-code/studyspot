/**
 * StudySpot Mobile App - Enhanced Login Screen with Animations
 * Professional login experience with Lottie animations
 */

import React, {useState} from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  FormControl,
  WarningOutlineIcon,
  Pressable,
  Divider,
  Alert,
  Spinner,
} from 'native-base';
import {useForm, Controller} from 'react-hook-form';
import {useAppDispatch, useAppSelector} from '../../hooks/redux';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import { performanceMonitoring } from '../../services/PerformanceMonitoringService';
import { SuccessAnimation, ErrorAnimation } from '../common/LottieAnimations';

import {COLORS, LAYOUT, VALIDATION} from '@constants/index';
import {AuthStackParamList, LoginForm} from '../../types/index';
import {loginUser, clearError} from '@store/slices/authSlice';
import {selectAuthLoading, selectAuthError} from '@store/slices/authSlice';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showErrorAnimation, setShowErrorAnimation] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    // Track user interaction
    performanceMonitoring.trackUserInteraction('LoginScreen', 'login_attempt', true);
    
    dispatch(clearError());
    
    try {
      await dispatch(loginUser({
        email: data.email,
        password: data.password,
        loginType: 'email',
      }));
      
      // Show success animation
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 2000);
      
      // Track successful login
      performanceMonitoring.trackUserInteraction('LoginScreen', 'login_success', true);
    } catch (error) {
      // Show error animation
      setShowErrorAnimation(true);
      setTimeout(() => setShowErrorAnimation(false), 2000);
      
      // Track failed login
      performanceMonitoring.trackUserInteraction('LoginScreen', 'login_failed', false);
    }
  };

  const handleForgotPassword = () => {
    performanceMonitoring.trackUserInteraction('LoginScreen', 'forgot_password_click', true);
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    performanceMonitoring.trackUserInteraction('LoginScreen', 'register_click', true);
    navigation.navigate('Register');
  };

  const handleSocialLogin = (provider: string) => {
    performanceMonitoring.trackUserInteraction('LoginScreen', `social_login_${provider}`, true);
    // Implement social login
  };

  return (
    <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY} px={LAYOUT.PADDING.LG}>
      <VStack flex={1} justifyContent="center" space={6}>
        {/* Header */}
        <VStack space={2} alignItems="center">
          <Text fontSize="3xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
            Welcome Back
          </Text>
          <Text fontSize="md" color={COLORS.TEXT.SECONDARY} textAlign="center">
            Sign in to your StudySpot account
          </Text>
        </VStack>

        {/* Success Animation */}
        {showSuccessAnimation && (
          <Box alignItems="center">
            <SuccessAnimation size={100} />
          </Box>
        )}

        {/* Error Animation */}
        {showErrorAnimation && (
          <Box alignItems="center">
            <ErrorAnimation size={100} />
          </Box>
        )}

        {/* Error Alert */}
        {error && !showErrorAnimation && (
          <Alert status="error" borderRadius="md">
            <Alert.Icon />
            <Text color="red.500" fontSize="sm">{error}</Text>
          </Alert>
        )}

        {/* Login Form */}
        <VStack space={4}>
          {/* Email Input */}
          <FormControl isInvalid={!!errors.email}>
            <FormControl.Label>Email</FormControl.Label>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: VALIDATION.EMAIL,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({field: {onChange, onBlur, value}}) => (
                <Input
                  placeholder="Enter your email"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />
            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
              {errors.email?.message}
            </FormControl.ErrorMessage>
          </FormControl>

          {/* Password Input */}
          <FormControl isInvalid={!!errors.password}>
            <FormControl.Label>Password</FormControl.Label>
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              }}
              render={({field: {onChange, onBlur, value}}) => (
                <Input
                  placeholder="Enter your password"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  type="password"
                  secureTextEntry
                />
              )}
            />
            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
              {errors.password?.message}
            </FormControl.ErrorMessage>
          </FormControl>

          {/* Forgot Password */}
          <HStack justifyContent="flex-end">
            <Pressable onPress={handleForgotPassword}>
              <Text color={COLORS.TEXT.LINK} fontSize="sm">
                Forgot Password?
              </Text>
            </Pressable>
          </HStack>

          {/* Login Button */}
          <Button
            onPress={handleSubmit(onSubmit)}
            backgroundColor={COLORS.PRIMARY}
            _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
            isDisabled={isLoading}
            mt={4}>
            {isLoading ? <Spinner color="white" /> : 'Sign In'}
          </Button>
        </VStack>

        {/* Divider */}
        <HStack alignItems="center" space={4}>
          <Divider flex={1} />
          <Text color={COLORS.TEXT.SECONDARY} fontSize="sm">
            OR
          </Text>
          <Divider flex={1} />
        </HStack>

        {/* Social Login Buttons */}
        <VStack space={3}>
          <Button
            variant="outline"
            borderColor={COLORS.BORDER.PRIMARY}
            _pressed={{backgroundColor: COLORS.BACKGROUND.SECONDARY}}
            onPress={() => handleSocialLogin('google')}>
            <HStack alignItems="center" space={2}>
              <Text>Continue with Google</Text>
            </HStack>
          </Button>

          <Button
            variant="outline"
            borderColor={COLORS.BORDER.PRIMARY}
            _pressed={{backgroundColor: COLORS.BACKGROUND.SECONDARY}}
            onPress={() => handleSocialLogin('facebook')}>
            <HStack alignItems="center" space={2}>
              <Text>Continue with Facebook</Text>
            </HStack>
          </Button>
        </VStack>

        {/* Register Link */}
        <HStack justifyContent="center" space={1}>
          <Text color={COLORS.TEXT.SECONDARY} fontSize="sm">
            Don't have an account?
          </Text>
          <Pressable onPress={handleRegister}>
            <Text color={COLORS.TEXT.LINK} fontSize="sm" fontWeight="medium">
              Sign Up
            </Text>
          </Pressable>
        </HStack>
      </VStack>
    </Box>
  );
};

export default LoginScreen;