/**
 * Registration Flow Diagnostics
 * Comprehensive logging and validation for registration process
 */

export interface RegistrationDiagnostics {
  step: string;
  timestamp: number;
  data?: any;
  error?: any;
  success: boolean;
}

class RegistrationDiagnosticsLogger {
  private logs: RegistrationDiagnostics[] = [];

  log(step: string, data?: any, error?: any) {
    const logEntry: RegistrationDiagnostics = {
      step,
      timestamp: Date.now(),
      data: data ? JSON.parse(JSON.stringify(data, null, 2)) : undefined,
      error: error ? {
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        responseData: error?.response?.data,
        stack: error?.stack?.substring(0, 500),
      } : undefined,
      success: !error,
    };
    
    this.logs.push(logEntry);
    console.log(`[RegistrationDiagnostics] ${step}:`, logEntry);
    
    return logEntry;
  }

  getLogs(): RegistrationDiagnostics[] {
    return this.logs;
  }

  clear() {
    this.logs = [];
  }

  getSummary() {
    const failed = this.logs.filter(l => !l.success);
    const successful = this.logs.filter(l => l.success);
    
    return {
      total: this.logs.length,
      successful: successful.length,
      failed: failed.length,
      lastStep: this.logs[this.logs.length - 1]?.step,
      failures: failed.map(f => ({ step: f.step, error: f.error })),
    };
  }
}

export const registrationDiagnostics = new RegistrationDiagnosticsLogger();

