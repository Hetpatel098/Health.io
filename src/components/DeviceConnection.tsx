
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  connectDevice, 
  syncDeviceData, 
  DeviceProvider 
} from '@/services/deviceIntegrationService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ActivityIcon,
  HeartIcon,
  WatchIcon,
  DropletIcon,
  RefreshCwIcon,
  PlusCircleIcon,
} from 'lucide-react';

interface ConnectedDevice {
  provider: DeviceProvider;
  name: string;
  lastSynced: string;
  connected: boolean;
}

export const DeviceConnection = () => {
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setSyncing] = useState<DeviceProvider | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConnectedDevices();
    }
  }, [user]);

  const loadConnectedDevices = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('device_connections')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const devices: ConnectedDevice[] = data.map(device => ({
        provider: device.provider as DeviceProvider,
        name: getDeviceName(device.provider),
        lastSynced: new Date(device.last_synced).toLocaleString(),
        connected: true
      }));
      
      setConnectedDevices(devices);
    } catch (error) {
      console.error('Error loading connected devices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load connected devices',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getDeviceName = (provider: string): string => {
    switch (provider) {
      case 'fitbit': return 'Fitbit';
      case 'apple_health': return 'Apple Health';
      case 'google_fit': return 'Google Fit';
      case 'garmin': return 'Garmin';
      case 'withings': return 'Withings';
      default: return provider;
    }
  };

  const handleConnectDevice = async (provider: DeviceProvider) => {
    try {
      // In a real app, you would need to register your app with each provider and get client IDs
      const clientId = 'demo_client_id'; // This would be your registered client ID
      const redirectUri = `${window.location.origin}/device-connect`;
      
      await connectDevice(provider, clientId, redirectUri);
      // The user will be redirected to the provider's authorization page
    } catch (error) {
      console.error(`Error connecting to ${provider}:`, error);
      toast({
        title: 'Connection Failed',
        description: `Unable to connect to ${getDeviceName(provider)}. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleSyncDevice = async (provider: DeviceProvider) => {
    if (!user) return;
    
    try {
      setSyncing(provider);
      const result = await syncDeviceData(provider, user.id);
      
      if (result.success) {
        toast({
          title: 'Sync Complete',
          description: `Successfully synced data from ${getDeviceName(provider)}`,
        });
        
        // Refresh the connected devices list to update last synced time
        loadConnectedDevices();
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      console.error(`Error syncing data from ${provider}:`, error);
      toast({
        title: 'Sync Failed',
        description: `Unable to sync data from ${getDeviceName(provider)}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setSyncing(null);
    }
  };

  const renderDeviceIcon = (provider: DeviceProvider) => {
    switch (provider) {
      case 'fitbit':
        return <WatchIcon className="w-5 h-5 text-teal-500" />;
      case 'apple_health':
        return <HeartIcon className="w-5 h-5 text-red-500" />;
      case 'google_fit':
        return <ActivityIcon className="w-5 h-5 text-blue-500" />;
      case 'withings':
        return <DropletIcon className="w-5 h-5 text-cyan-500" />;
      default:
        return <WatchIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Connected Devices</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={loadConnectedDevices}
          disabled={isLoading}
        >
          <RefreshCwIcon className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin">
            <RefreshCwIcon className="w-6 h-6 text-primary" />
          </div>
        </div>
      ) : (
        <>
          {connectedDevices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectedDevices.map((device) => (
                <Card key={device.provider} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {renderDeviceIcon(device.provider)}
                      <div>
                        <h3 className="font-medium">{device.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          Last synced: {device.lastSynced}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSyncDevice(device.provider)}
                      disabled={isSyncing === device.provider}
                    >
                      {isSyncing === device.provider ? (
                        <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCwIcon className="w-4 h-4 mr-2" />
                      )}
                      Sync
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground mb-4">
                No devices connected yet. Connect your fitness and health devices to automatically sync data.
              </p>
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="font-medium mb-3">Add a new device</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['fitbit', 'apple_health', 'google_fit', 'withings'] as DeviceProvider[]).map(provider => (
                <Button
                  key={provider}
                  variant="outline"
                  className="h-auto py-3 justify-start"
                  onClick={() => handleConnectDevice(provider)}
                >
                  {renderDeviceIcon(provider)}
                  <span className="ml-2">{getDeviceName(provider)}</span>
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
