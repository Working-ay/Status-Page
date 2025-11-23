export type ServiceStatus = 'online' | 'offline' | 'degraded';

export interface ServiceData {
  status: ServiceStatus;
  latency: number;
  lastChecked: number;
}

export interface StatusResponse {
  [serviceId: string]: ServiceData;
}

export interface ServiceConfig {
  id: string;
  name: string;
  url: string;
  displayUrl: string;
  type: 'vps' | 'website' | 'api';
}
