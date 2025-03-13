import { supabase, storeDeviceToken, getDeviceToken, updateLastSynced } from '@/integrations/supabase/client';
import { useHealthStore } from './healthDataService';

// Supported device types
export type DeviceProvider = 'fitbit' | 'apple_health' | 'google_fit' | 'garmin' | 'withings';

// Configuration for OAuth providers
const providerConfig = {
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

// Function to initiate OAuth flow for a device
export const connectDevice = async (provider: DeviceProvider, clientId: string, redirectUri: string) => {
  const config = providerConfig[provider];
  if (!config || !config.authUrl) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  const scopes = config.scopes?.join(' ') || '';
  const state = generateRandomState();
  
  // Store state in localStorage for verification when the user returns
  localStorage.setItem('deviceConnectState', state);
  localStorage.setItem('deviceConnectProvider', provider);

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: scopes,
    redirect_uri: redirectUri,
    state,
  });

  // Redirect to provider authorization page
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

// Function to sync data from connected devices
export const syncDeviceData = async (provider: DeviceProvider, userId: string) => {
  try {
    // Get stored token
    const tokenData = await getDeviceToken(userId, provider);
    if (!tokenData) {
      console.error(`No token found for provider ${provider}`);
      return { success: false, error: 'Device not connected' };
    }

    console.log(`Syncing data from ${provider}...`);
    
    // In a real implementation, you would make API calls to the provider
    // For this demo, we'll simulate data from different providers
    let healthData = {};
    
    switch (provider) {
      case 'fitbit':
        healthData = {
          steps: Math.floor(Math.random() * 5000) + 3000,
          heartRate: Math.floor(Math.random() * 20) + 60,
          sleep: (Math.random() * 2 + 6).toFixed(1),
          caloriesBurned: Math.floor(Math.random() * 300) + 200
        };
        break;
        
      case 'withings':
        healthData = {
          bloodPressureSystolic: Math.floor(Math.random() * 20) + 110,
          bloodPressureDiastolic: Math.floor(Math.random() * 15) + 70,
          weight: (Math.random() * 10 + 65).toFixed(1)
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
    
    // Update health data store with the new data
    const store = useHealthStore.getState();
    if (healthData) {
      if ('steps' in healthData) {
        store.updateSteps(healthData.steps);
      }
      if ('heartRate' in healthData) {
        store.updateHeartRate(healthData.heartRate);
      }
      if ('sleep' in healthData) {
        store.updateSleep(parseFloat(healthData.sleep));
      }
      if ('caloriesBurned' in healthData) {
        store.updateCaloriesBurned(healthData.caloriesBurned);
      }
      // Additional health metrics would be handled similarly
    }
    
    // Update last synced timestamp
    await updateLastSynced(userId, provider);
    
    return { success: true, data: healthData };
  } catch (error) {
    console.error(`Error syncing data from ${provider}:`, error);
    return { success: false, error };
  }
};

// Helper function to generate a random state for OAuth
const generateRandomState = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};
