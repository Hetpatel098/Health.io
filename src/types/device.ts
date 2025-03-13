
export type DeviceProvider = 'fitbit' | 'apple_health' | 'google_fit' | 'garmin' | 'withings' | 'android';

export interface DeviceConnection {
  id: string;
  user_id: string;
  provider: DeviceProvider;
  access_token: string;
  refresh_token?: string | null;
  expires_at?: string | null;
  last_synced: string;
  device_name?: string; // Added for better device identification
  device_id?: string;   // Added for Android devices
}

export interface ProviderConfig {
  name: string;
  icon: string;
  color: string;
  scopes?: string[];
  authUrl?: string;
  tokenUrl?: string;
  connectType?: 'oauth' | 'direct'; // Added to differentiate connection methods
  instructions?: string; // Added to provide user instructions
}
