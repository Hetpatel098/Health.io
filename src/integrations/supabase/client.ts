import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import type { DeviceConnection } from '@/types/device';

const SUPABASE_URL = "https://wgtpnzepbgbvwxhlvtji.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndndHBuemVwYmdidnd4aGx2dGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MTE0NzcsImV4cCI6MjA1NzM4NzQ3N30.QGlCL05p9A_NIOCtl3zfAa12hNsGVsAic1xoZtu9dX8";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export const checkAuthStatus = async () => {
  const { data, error } = await supabase.auth.getSession();
  console.log("Current auth status:", data.session ? "Authenticated" : "Not authenticated", error || "");
  return { data, error };
};

export const storeDeviceToken = async (
  userId: string, 
  provider: string, 
  token: string, 
  refreshToken?: string | null, 
  expiresAt?: number,
  deviceName?: string,
  deviceId?: string
) => {
  try {
    const { error } = await supabase
      .from('device_connections')
      .upsert({
        user_id: userId,
        provider,
        access_token: token,
        refresh_token: refreshToken || null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        last_synced: new Date().toISOString(),
        device_name: deviceName || null,
        device_id: deviceId || null
      });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error storing device token:', error);
    return { success: false, error };
  }
};

export const getDeviceToken = async (userId: string, provider: string) => {
  try {
    const { data, error } = await supabase
      .from('device_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      token: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at
    };
  } catch (error) {
    console.error('Error getting device token:', error);
    return null;
  }
};

export const updateLastSynced = async (userId: string, provider: string) => {
  try {
    await supabase
      .from('device_connections')
      .update({ last_synced: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('provider', provider);
  } catch (error) {
    console.error('Error updating last synced:', error);
  }
};
