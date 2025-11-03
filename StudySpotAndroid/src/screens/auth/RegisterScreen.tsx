/**
 * StudySpot Mobile App - Register Screen
 * User registration screen
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
  Checkbox,
  ScrollView,
} from 'native-base';
import {useForm, Controller} from 'react-hook-form';
import {useAppDispatch, useAppSelector} from '../../hooks/redux';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {COLORS, LAYOUT, VALIDATION} from '@constants/index';
import {AuthStackParamList, RegisterForm} from '../../types/index';
import {registerUser, clearError} from '@store/slices/authSlice';
import {selectAuthLoading, selectAuthError} from '@store/slices/authSlice';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const {
    control,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm<RegisterForm>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      agreeToTerms: false,
    },
  });

  const password = watch('password');

  const onSubmit = (data: RegisterForm) => {
    dispatch(clearError());
    dispatch(registerUser({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: 'student',
    }));
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ScrollView flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY}>
      <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.XL}>
        <VStack space={6}>
          {/* Header */}
          <VStack space={2} alignItems="center">
            <Text fontSize="3xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
              Create Account
            </Text>
            <Text fontSize="md" color={COLORS.TEXT.SECONDARY} textAlign="center">
              Join StudySpot and find your perfect study space
            </Text>
          </VStack>

          {/* Error Alert */}
          {error && (
            <Alert status="error" borderRadius="md">
              <Alert.Icon />
              <Text color="red.500" fontSize="sm">{error}</Text>
            </Alert>
          )}

          {/* Registration Form */}
          <VStack space={4}>
            {/* Name Fields */}
            <HStack space={3}>
              <FormControl flex={1} isInvalid={!!errors.firstName}>
                <FormControl.Label>First Name</FormControl.Label>
                <Controller
                  control={control}
                  name="firstName"
                  rules={{
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters',
                    },
                    pattern: {
                      value: VALIDATION.NAME.PATTERN,
                      message: 'First name can only contain letters',
                    },
                  }}
                  render={({field: {onChange, onBlur, value}}) => (
                    <Input
                      placeholder="First name"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      autoCapitalize="words"
                    />
                  )}
                />
                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors.firstName?.message}
                </FormControl.ErrorMessage>
              </FormControl>

              <FormControl flex={1} isInvalid={!!errors.lastName}>
                <FormControl.Label>Last Name</FormControl.Label>
                <Controller
                  control={control}
                  name="lastName"
                  rules={{
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters',
                    },
                    pattern: {
                      value: VALIDATION.NAME.PATTERN,
                      message: 'Last name can only contain letters',
                    },
                  }}
                  render={({field: {onChange, onBlur, value}}) => (
                    <Input
                      placeholder="Last name"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      autoCapitalize="words"
                    />
                  )}
                />
                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors.lastName?.message}
                </FormControl.ErrorMessage>
              </FormControl>
            </HStack>

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

            {/* Phone Input */}
            <FormControl isInvalid={!!errors.phone}>
              <FormControl.Label>Phone Number (Optional)</FormControl.Label>
              <Controller
                control={control}
                name="phone"
                rules={{
                  pattern: {
                    value: VALIDATION.PHONE,
                    message: 'Please enter a valid phone number',
                  },
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <Input
                    placeholder="Enter your phone number"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                  />
                )}
              />
              <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                {errors.phone?.message}
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
                    value: VALIDATION.PASSWORD.MIN_LENGTH,
                    message: `Password must be at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters`,
                  },
                  pattern: {
                    value: VALIDATION.PASSWORD.PATTERN,
                    message: 'Password must contain uppercase, lowercase, number, and special character',
                  },
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <Input
                    placeholder="Create a password"
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

            {/* Confirm Password Input */}
            <FormControl isInvalid={!!errors.confirmPassword}>
              <FormControl.Label>Confirm Password</FormControl.Label>
              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <Input
                    placeholder="Confirm your password"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    type="password"
                    secureTextEntry
                  />
                )}
              />
              <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                {errors.confirmPassword?.message}
              </FormControl.ErrorMessage>
            </FormControl>

            {/* Terms Agreement */}
            <FormControl isInvalid={!!errors.agreeToTerms}>
              <Controller
                control={control}
                name="agreeToTerms"
                rules={{
                  required: 'You must agree to the terms and conditions',
                }}
                render={({field: {onChange, value}}) => (
                  <Checkbox
                    isChecked={value}
                    onChange={onChange}
                    value="agreeToTerms">
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY} ml={2}>
                      I agree to the{' '}
                      <Text color={COLORS.TEXT.LINK} underline>
                        Terms of Service
                      </Text>{' '}
                      and{' '}
                      <Text color={COLORS.TEXT.LINK} underline>
                        Privacy Policy
                      </Text>
                    </Text>
                  </Checkbox>
                )}
              />
              <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                {errors.agreeToTerms?.message}
              </FormControl.ErrorMessage>
            </FormControl>

            {/* Register Button */}
            <Button
              onPress={handleSubmit(onSubmit)}
              backgroundColor={COLORS.PRIMARY}
              _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
              isDisabled={isLoading}
              mt={4}>
              {isLoading ? <Spinner color="white" /> : 'Create Account'}
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
              _pressed={{backgroundColor: COLORS.BACKGROUND.SECONDARY}}>
              <HStack alignItems="center" space={2}>
                <Text>Continue with Google</Text>
              </HStack>
            </Button>

            <Button
              variant="outline"
              borderColor={COLORS.BORDER.PRIMARY}
              _pressed={{backgroundColor: COLORS.BACKGROUND.SECONDARY}}>
              <HStack alignItems="center" space={2}>
                <Text>Continue with Facebook</Text>
              </HStack>
            </Button>
          </VStack>

          {/* Login Link */}
          <HStack justifyContent="center" space={1}>
            <Text color={COLORS.TEXT.SECONDARY} fontSize="sm">
              Already have an account?
            </Text>
            <Pressable onPress={handleLogin}>
              <Text color={COLORS.TEXT.LINK} fontSize="sm" fontWeight="medium">
                Sign In
              </Text>
            </Pressable>
          </HStack>
        </VStack>
      </Box>
    </ScrollView>
  );
};

export default RegisterScreen;
