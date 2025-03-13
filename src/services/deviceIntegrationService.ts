import { supabase, storeDeviceToken, getDeviceToken, updateLastSynced } from '@/integrations/supabase/client';
import { useHealthStore } from './healthDataService';
import type { DeviceProvider, ProviderConfig } from '@/types/device';

// Configuration for OAuth providers
const providerConfig: Record<DeviceProvider, ProviderConfig> = {
  fitbit: {
    name: 'Fitbit',
    icon: 'fitbit.svg',
    color: '#00B0B9',
    scopes: ['activity', 'heartrate', 'sleep', 'weight'],
    authUrl: 'https://www.fitbit.com/oauth2/authorize',
    tokenUrl: 'https://api.fitbit.com/oauth2/token',
  },
  apple_health: {
    name: 'Apple Health',
    icon: 'apple-health.svg',
    color: '#FF2D55',
  },
  google_fit: {
    name: 'Google Fit',
    icon: 'google-fit.svg',
    color: '#4285F4',
    scopes: ['https://www.googleapis.com/auth/fitness.activity.read', 'https://www.googleapis.com/auth/fitness.heart_rate.read'],
    authUrl: 'https://accounts.google.com/o/oauth2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
  },
  garmin: {
    name: 'Garmin',
    icon: 'garmin.svg',
    color: '#007CC3',
  },
  withings: {
    name: 'Withings',
    icon: 'withings.svg',
    color: '#00B2A9',
    scopes: ['user.metrics', 'user.activity'],
    authUrl: 'https://account.withings.com/oauth2_user/authorize2',
    tokenUrl: 'https://wbsapi.withings.net/v2/oauth2',
  }
};

// Helper function to generate a random state for OAuth
const generateRandomState = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const connectDevice = async (provider: DeviceProvider, clientId: string, redirectUri: string) => {
  const config = providerConfig[provider];
  if (!config?.authUrl) {
    throw new Error(`Provider ${provider} does not support OAuth authentication`);
  }

  const scopes = config.scopes?.join(' ') || '';
  const state = generateRandomState();
  
  localStorage.setItem('deviceConnectState', state);
  localStorage.setItem('deviceConnectProvider', provider);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: scopes,
    redirect_uri: redirectUri,
    state,
  });

  window.location.href = `${config.authUrl}?${params.toString()}`;
};

// Handle OAuth redirect and token exchange
export const handleDeviceRedirect = async (
  code: string, 
  state: string, 
  clientId: string, 
  clientSecret: string, 
  redirectUri: string
) => {
  // Verify state to prevent CSRF attacks
  const storedState = localStorage.getItem('deviceConnectState');
  const provider = localStorage.getItem('deviceConnectProvider') as DeviceProvider;
  
  if (!storedState || storedState !== state || !provider) {
    throw new Error('Invalid state parameter');
  }

  // Clear stored state
  localStorage.removeItem('deviceConnectState');
  localStorage.removeItem('deviceConnectProvider');
  
  const config = providerConfig[provider];
  if (!config || !config.tokenUrl) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  // Exchange code for token using Supabase Edge Function
  // This keeps client secret secure
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  // In a real implementation, you would use an edge function to securely exchange the code for tokens
  // For this demo, we'll simulate a successful token response
  const mockTokenResponse = {
    access_token: `mock_${provider}_token_${Date.now()}`,
    refresh_token: `mock_refresh_token_${Date.now()}`,
    expires_in: 3600
  };

  // Store token in Supabase
  const expiresAt = Date.now() + (mockTokenResponse.expires_in * 1000);
  await storeDeviceToken(
    userData.user.id,
    provider,
    mockTokenResponse.access_token,
    mockTokenResponse.refresh_token,
    expiresAt
  );

  return { success: true, provider };
};

export const syncDeviceData = async (provider: DeviceProvider, userId: string) => {
  try {
    const tokenData = await getDeviceToken(userId, provider);
    if (!tokenData) {
      console.error(`No token found for provider ${provider}`);
      return { success: false, error: 'Device not connected' };
    }

    console.log(`Syncing data from ${provider}...`);
    
    let healthData: Record<string, number> = {};
    
    switch (provider) {
      case 'fitbit':
        healthData = {
          steps: Math.floor(Math.random() * 5000) + 3000,
          heartRate: Math.floor(Math.random() * 20) + 60,
          sleep: Math.floor(Math.random() * 2) + 6,
          caloriesBurned: Math.floor(Math.random() * 300) + 200
        };
        break;
        
      case 'withings':
        healthData = {
          bloodPressureSystolic: Math.floor(Math.random() * 20) + 110,
          bloodPressureDiastolic: Math.floor(Math.random() * 15) + 70,
          weight: Math.floor(Math.random() * 10) + 65
        };
        break;
        
      case 'google_fit':
        healthData = {
          steps: Math.floor(Math.random() * 6000) + 2000,
          heartRate: Math.floor(Math.random() * 25) + 65,
          caloriesBurned: Math.floor(Math.random() * 400) + 150
        };
        break;
        
      default:
        healthData = {};
    }
    
    // Update health data store
    const store = useHealthStore.getState();
    if (healthData.steps) {
      store.incrementSteps(healthData.steps);
    }
    if (healthData.heartRate) {
      store.updateHeartRate(healthData.heartRate);
    }
    if (healthData.sleep) {
      store.updateSleep(healthData.sleep);
    }
    if (healthData.caloriesBurned) {
      store.updateCaloriesBurned(healthData.caloriesBurned);
    }
    
    await updateLastSynced(userId, provider);
    
    return { success: true, data: healthData };
  } catch (error) {
    console.error(`Error syncing data from ${provider}:`, error);
    return { success: false, error };
  }
};
