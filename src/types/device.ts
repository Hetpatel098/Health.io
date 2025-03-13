
export type DeviceProvider = 'fitbit' | 'apple_health' | 'google_fit' | 'garmin' | 'withings' | 'android';

export interface DeviceConnection {
  id: string;
  user_id: string;
  provider: DeviceProvider;
  access_token: string;
  refresh_token?: string | null;
  expires_at?: string | null;
  last_synced: string;
}

export interface ProviderConfig {
  name: string;
  icon: string;
  color: string;
  scopes?: string[];
  authUrl?: string;
  tokenUrl?: string;
}
