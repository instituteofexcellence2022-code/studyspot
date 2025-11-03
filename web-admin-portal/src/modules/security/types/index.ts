/**
 * Security Module Types
 * Defines interfaces for MFA, SSO, Security Events, and Threat Detection
 */

// ============================================
// MFA (Multi-Factor Authentication)
// ============================================

export interface MFAUser {
  id: string;
  name: string;
  email: string;
  mfaEnabled: boolean;
  mfaMethods: ('sms' | 'email' | 'totp' | 'backup_codes' | 'fido2')[];
  enrolledAt?: string;
  lastLogin?: string;
  tenantId: string;
  tenantName: string;
}

export interface MFASettings {
  enforceForAll: boolean;
  enforceForAdmins: boolean;
  allowOptIn: boolean;
  gracePeriodDays: number;
  supportedMethods: {
    sms: boolean;
    email: boolean;
    totp: boolean;
    backupCodes: boolean;
    fido2: boolean;
  };
}

export interface MFAStats {
  totalUsers: number;
  mfaEnabled: number;
  mfaDisabled: number;
  enrollmentRate: number;
  methodsUsage: {
    sms: number;
    email: number;
    totp: number;
    backupCodes: number;
    fido2: number;
  };
}

// ============================================
// SSO (Single Sign-On)
// ============================================

export interface SSOProvider {
  id: string;
  name: string;
  type: 'google' | 'azure' | 'okta' | 'auth0' | 'saml' | 'oidc';
  status: 'active' | 'inactive' | 'configured' | 'not_configured';
  connectedUsers: number;
  lastSync?: string;
  logo?: string;
  config?: {
    clientId: string;
    clientSecret?: string;
    redirectUri: string;
    scopes: string[];
    domainRestriction?: string;
    autoProvision: boolean;
    defaultRole: string;
  };
}

export interface SSOEvent {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  provider: string;
  action: 'login' | 'logout' | 'sync' | 'provision';
  status: 'success' | 'failed';
  timestamp: string;
  ipAddress: string;
  errorMessage?: string;
}

export interface SSOStats {
  activeIntegrations: number;
  totalUsersViaSSO: number;
  successRate: number;
  lastSync?: string;
}

// ============================================
// Security Events
// ============================================

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'login' | 'logout' | 'password_change' | 'mfa' | 'permission_change' | 'data_access' | 'api_call' | 'export' | 'delete';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress: string;
  location: {
    city: string;
    country: string;
    countryCode: string;
  };
  device: string;
  browser: string;
  status: 'success' | 'failed' | 'blocked';
  details: Record<string, any>;
  tenantId?: string;
  tenantName?: string;
}

export interface SecurityEventStats {
  total24h: number;
  critical: number;
  warning: number;
  info: number;
  successRate: number;
}

export interface SecurityEventFilters {
  dateRange: {
    start: string;
    end: string;
  };
  eventType?: string;
  severity?: string;
  userId?: string;
  ipAddress?: string;
  tenantId?: string;
  status?: string;
}

// ============================================
// Threat Detection
// ============================================

export interface Threat {
  id: string;
  type: 'brute_force' | 'suspicious_location' | 'anomalous_behavior' | 'account_takeover' | 'data_exfiltration' | 'privilege_escalation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  detectedAt: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  ipAddress: string;
  description: string;
  details: Record<string, any>;
  actions: string[];
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface BlockedIP {
  id: string;
  ip: string;
  reason: string;
  blockedAt: string;
  expiresAt: string;
  threatType: string;
  autoBlocked: boolean;
  country?: string;
  attempts: number;
}

export interface ThreatRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  condition: {
    eventType: string;
    frequency: number;
    timeWindow: number; // minutes
  };
  action: 'alert' | 'block' | 'log' | 'notify';
  severity: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

export interface ThreatStats {
  activeThreats: number;
  blockedIPs: number;
  suspiciousActivities: number;
  riskScore: number; // 0-100
}

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  dismissed: boolean;
  threatId?: string;
}

// ============================================
// Dashboard Data
// ============================================

export interface SecurityDashboardData {
  mfaStats: MFAStats;
  ssoStats: SSOStats;
  eventStats: SecurityEventStats;
  threatStats: ThreatStats;
}

/**
 * Defines interfaces for MFA, SSO, Security Events, and Threat Detection
 */

// ============================================
// MFA (Multi-Factor Authentication)
// ============================================

export interface MFAUser {
  id: string;
  name: string;
  email: string;
  mfaEnabled: boolean;
  mfaMethods: ('sms' | 'email' | 'totp' | 'backup_codes' | 'fido2')[];
  enrolledAt?: string;
  lastLogin?: string;
  tenantId: string;
  tenantName: string;
}

export interface MFASettings {
  enforceForAll: boolean;
  enforceForAdmins: boolean;
  allowOptIn: boolean;
  gracePeriodDays: number;
  supportedMethods: {
    sms: boolean;
    email: boolean;
    totp: boolean;
    backupCodes: boolean;
    fido2: boolean;
  };
}

export interface MFAStats {
  totalUsers: number;
  mfaEnabled: number;
  mfaDisabled: number;
  enrollmentRate: number;
  methodsUsage: {
    sms: number;
    email: number;
    totp: number;
    backupCodes: number;
    fido2: number;
  };
}

// ============================================
// SSO (Single Sign-On)
// ============================================

export interface SSOProvider {
  id: string;
  name: string;
  type: 'google' | 'azure' | 'okta' | 'auth0' | 'saml' | 'oidc';
  status: 'active' | 'inactive' | 'configured' | 'not_configured';
  connectedUsers: number;
  lastSync?: string;
  logo?: string;
  config?: {
    clientId: string;
    clientSecret?: string;
    redirectUri: string;
    scopes: string[];
    domainRestriction?: string;
    autoProvision: boolean;
    defaultRole: string;
  };
}

export interface SSOEvent {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  provider: string;
  action: 'login' | 'logout' | 'sync' | 'provision';
  status: 'success' | 'failed';
  timestamp: string;
  ipAddress: string;
  errorMessage?: string;
}

export interface SSOStats {
  activeIntegrations: number;
  totalUsersViaSSO: number;
  successRate: number;
  lastSync?: string;
}

// ============================================
// Security Events
// ============================================

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'login' | 'logout' | 'password_change' | 'mfa' | 'permission_change' | 'data_access' | 'api_call' | 'export' | 'delete';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress: string;
  location: {
    city: string;
    country: string;
    countryCode: string;
  };
  device: string;
  browser: string;
  status: 'success' | 'failed' | 'blocked';
  details: Record<string, any>;
  tenantId?: string;
  tenantName?: string;
}

export interface SecurityEventStats {
  total24h: number;
  critical: number;
  warning: number;
  info: number;
  successRate: number;
}

export interface SecurityEventFilters {
  dateRange: {
    start: string;
    end: string;
  };
  eventType?: string;
  severity?: string;
  userId?: string;
  ipAddress?: string;
  tenantId?: string;
  status?: string;
}

// ============================================
// Threat Detection
// ============================================

export interface Threat {
  id: string;
  type: 'brute_force' | 'suspicious_location' | 'anomalous_behavior' | 'account_takeover' | 'data_exfiltration' | 'privilege_escalation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  detectedAt: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  ipAddress: string;
  description: string;
  details: Record<string, any>;
  actions: string[];
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface BlockedIP {
  id: string;
  ip: string;
  reason: string;
  blockedAt: string;
  expiresAt: string;
  threatType: string;
  autoBlocked: boolean;
  country?: string;
  attempts: number;
}

export interface ThreatRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  condition: {
    eventType: string;
    frequency: number;
    timeWindow: number; // minutes
  };
  action: 'alert' | 'block' | 'log' | 'notify';
  severity: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

export interface ThreatStats {
  activeThreats: number;
  blockedIPs: number;
  suspiciousActivities: number;
  riskScore: number; // 0-100
}

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  dismissed: boolean;
  threatId?: string;
}

// ============================================
// Dashboard Data
// ============================================

export interface SecurityDashboardData {
  mfaStats: MFAStats;
  ssoStats: SSOStats;
  eventStats: SecurityEventStats;
  threatStats: ThreatStats;
}




