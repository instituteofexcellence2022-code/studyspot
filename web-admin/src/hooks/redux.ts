import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Type-safe selectors
export const useAuth = () => useAppSelector((state) => state.auth);
export const useUI = () => useAppSelector((state) => state.ui);
export const useUser = () => useAppSelector((state) => state.user);
export const useLibrary = () => useAppSelector((state) => state.library);
export const useBooking = () => useAppSelector((state) => state.booking);
export const useSubscription = () => useAppSelector((state) => state.subscription);
export const useTenant = () => useAppSelector((state) => state.tenant);
export const useRBAC = () => useAppSelector((state) => state.rbac);
export const useCredit = () => useAppSelector((state) => state.credit);


