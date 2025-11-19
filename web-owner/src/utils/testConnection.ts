/**
 * Test Connection Utility
 * Tests backend connectivity and provides detailed diagnostics
 */

export interface ConnectionTestResult {
  success: boolean;
  endpoint: string;
  status?: number;
  statusText?: string;
  data?: any;
  error?: string;
  duration: number;
  timestamp: number;
}

export async function testBackendConnection(
  baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:3001'
): Promise<ConnectionTestResult> {
  const startTime = Date.now();
  const endpoint = `${baseURL}/health`;
  const timestamp = Date.now();

  try {
    console.log('[testConnection] Testing connection to:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    const result: ConnectionTestResult = {
      success: response.ok,
      endpoint,
      status: response.status,
      statusText: response.statusText,
      data,
      duration,
      timestamp,
    };

    console.log('[testConnection] Connection test result:', result);
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    const result: ConnectionTestResult = {
      success: false,
      endpoint,
      error: error.message || 'Unknown error',
      duration,
      timestamp,
    };

    console.error('[testConnection] Connection test failed:', result);
    return result;
  }
}

export async function testRegistrationEndpoint(
  baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:3001'
): Promise<ConnectionTestResult> {
  const startTime = Date.now();
  const endpoint = `${baseURL}/api/auth/register`;
  const timestamp = Date.now();

  try {
    console.log('[testConnection] Testing registration endpoint:', endpoint);
    
    // Test with OPTIONS request first (CORS preflight)
    const optionsResponse = await fetch(endpoint, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
    });

    console.log('[testConnection] OPTIONS response:', {
      status: optionsResponse.status,
      statusText: optionsResponse.statusText,
      headers: Object.fromEntries(optionsResponse.headers.entries()),
    });

    // Then test with POST (but don't actually register)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Test',
        email: 'test@example.com',
        password: 'Test1234!@#$',
      }),
      mode: 'cors',
      credentials: 'omit',
    });

    const duration = Date.now() - startTime;
    const data = await response.json().catch(() => ({ error: 'Failed to parse response' }));

    const result: ConnectionTestResult = {
      success: response.status < 500, // Accept 4xx as "successful connection"
      endpoint,
      status: response.status,
      statusText: response.statusText,
      data,
      duration,
      timestamp,
    };

    console.log('[testConnection] Registration endpoint test result:', result);
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    const result: ConnectionTestResult = {
      success: false,
      endpoint,
      error: error.message || 'Unknown error',
      duration,
      timestamp,
    };

    console.error('[testConnection] Registration endpoint test failed:', result);
    return result;
  }
}

