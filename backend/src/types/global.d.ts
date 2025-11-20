// ============================================
// GLOBAL TYPE DECLARATIONS
// ============================================

import 'fastify';
import '@fastify/multipart';

// Fetch API (available in Node.js 18+)
declare global {
  function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  
  interface RequestInit {
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit | null;
    cache?: RequestCache;
    credentials?: RequestCredentials;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    integrity?: string;
    keepalive?: boolean;
    signal?: AbortSignal | null;
  }
  
  interface Response {
    readonly ok: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly headers: Headers;
    readonly url: string;
    readonly redirected: boolean;
    readonly type: ResponseType;
    json(): Promise<any>;
    text(): Promise<string>;
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob>;
  }
  
  type RequestInfo = Request | string;
  type HeadersInit = Headers | string[][] | Record<string, string>;
  type BodyInit = Blob | BufferSource | FormData | URLSearchParams | string;
  type RequestCache = 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
  type RequestCredentials = 'omit' | 'same-origin' | 'include';
  type RequestMode = 'navigate' | 'same-origin' | 'no-cors' | 'cors';
  type RequestRedirect = 'follow' | 'error' | 'manual';
  type ReferrerPolicy = '' | 'no-referrer' | 'no-referrer-when-downgrade' | 'same-origin' | 'origin' | 'strict-origin' | 'origin-when-cross-origin' | 'unsafe-url';
  type ResponseType = 'basic' | 'cors' | 'error' | 'opaque' | 'opaqueredirect';
}

// Extend FastifyRequest to include multipart file method
declare module 'fastify' {
  interface FastifyRequest {
    file?: () => Promise<{
      toBuffer: () => Promise<Buffer>;
      filename: string;
      encoding: string;
      mimetype: string;
      fields: any;
    }>;
  }
}

export {};

