/**
 * usePermissions Hook Tests
 */

import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import usePermissions from '../../hooks/usePermissions';
import { mockUser } from '../utils/test-utils';

// Mock store
const createMockStore = (user: any = null) => {
  return configureStore({
    reducer: {
      auth: (state = { user, isAuthenticated: !!user }) => state,
    },
  });
};

describe('usePermissions', () => {
  it('returns false for all permissions when user is null', () => {
    const store = createMockStore(null);
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <Provider store={store}>{children}</Provider>;
  };

    const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

    expect(result.current.hasPermission('dashboard:view')).toBe(false);
    expect(result.current.hasAnyPermission(['dashboard:view', 'students:create'])).toBe(false);
    expect(result.current.hasAllPermissions(['dashboard:view'])).toBe(false);
    expect(result.current.getAllPermissions()).toEqual([]);
  });

  it('returns true for all permissions when user is super_admin', () => {
    const superAdminUser = { ...mockUser, role: 'super_admin' };
    const store = createMockStore(superAdminUser);
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.hasPermission('dashboard:view')).toBe(true);
    expect(result.current.hasPermission('students:create')).toBe(true);
    expect(result.current.hasAnyPermission(['dashboard:view', 'students:create'])).toBe(true);
    expect(result.current.hasAllPermissions(['dashboard:view', 'students:create'])).toBe(true);
  });

  it('checks specific permissions correctly for regular user', () => {
    const regularUser = {
      ...mockUser,
      role: 'library_admin',
      permissions: ['dashboard:view', 'students:view', 'students:create'],
    };
    const store = createMockStore(regularUser);
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => usePermissions(), { wrapper });

    // Has permission
    expect(result.current.hasPermission('dashboard:view')).toBe(true);
    expect(result.current.hasPermission('students:create')).toBe(true);

    // Doesn't have permission
    expect(result.current.hasPermission('system:configure')).toBe(false);

    // Has any permission
    expect(result.current.hasAnyPermission(['dashboard:view', 'system:configure'])).toBe(true);
    expect(result.current.hasAnyPermission(['system:configure', 'admin:system'])).toBe(false);

    // Has all permissions
    expect(result.current.hasAllPermissions(['dashboard:view', 'students:view'])).toBe(true);
    expect(result.current.hasAllPermissions(['dashboard:view', 'system:configure'])).toBe(false);

    // Get all permissions
    expect(result.current.getAllPermissions()).toEqual(['dashboard:view', 'students:view', 'students:create']);
  });

  it('handles empty permissions array', () => {
    const userWithNoPermissions = {
      ...mockUser,
      role: 'student',
      permissions: [],
    };
    const store = createMockStore(userWithNoPermissions);
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.hasPermission('dashboard:view')).toBe(false);
    expect(result.current.hasAnyPermission(['dashboard:view'])).toBe(false);
    expect(result.current.hasAllPermissions(['dashboard:view'])).toBe(false);
    expect(result.current.getAllPermissions()).toEqual([]);
  });

  it('handles undefined permissions', () => {
    const userWithUndefinedPermissions = {
      ...mockUser,
      role: 'student',
      permissions: undefined,
    };
    const store = createMockStore(userWithUndefinedPermissions);
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.hasPermission('dashboard:view')).toBe(false);
    expect(result.current.getAllPermissions()).toEqual([]);
  });
});
