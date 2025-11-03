export interface Microservice {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
}

export interface MicroserviceHealth {
  service: string;
  status: string;
  uptime: number;
}

export default {};

