
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  connectDevice, 
  syncDeviceData, 
  DeviceProvider, 
  pairAndroidDevice,
  setupRealtimeSync
} from '@/services/deviceIntegrationService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RealTimeIndicator } from '@/components/RealTimeIndicator';
import { 
  ActivityIcon,
  HeartIcon,
  WatchIcon,
  DropletIcon,
  RefreshCwIcon,
  SmartphoneIcon,
  WifiIcon,
  BellIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface ConnectedDevice {
  provider: DeviceProvider;
  name: string;
  lastSynced: string;
  connected: boolean;
  deviceId?: string;
  realtime?: boolean;
}

interface AndroidPairFormData {
  deviceId: string;
  deviceName: string;
}

export const DeviceConnection = () => {
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setSyncing] = useState<DeviceProvider | null>(null);
  const [androidPairOpen, setAndroidPairOpen] = useState(false);
  const [realtimeDevices, setRealtimeDevices] = useState<string[]>([]);
  const realtimeUnsubscribe = useRef<(() => void) | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<AndroidPairFormData>({
    defaultValues: {
      deviceId: '',
      deviceName: 'My Android Device'
    }
  });

  useEffect(() => {
    if (user) {
      loadConnectedDevices();
    }
  }, [user]);

  useEffect(() => {
    // Cleanup any realtime connections when component unmounts
    return () => {
      if (realtimeUnsubscribe.current) {
        realtimeUnsubscribe.current();
      }
    };
  }, []);

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
        connected: true,
        deviceId: device.provider === 'android' ? device.access_token.split('_')[1] : undefined,
        realtime: realtimeDevices.includes(device.provider === 'android' && device.access_token.split('_')[1] || '')
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
      case 'android': return 'Android Device';
      default: return provider;
    }
  };

  const handleConnectDevice = async (provider: DeviceProvider) => {
    try {
      // For Android, we'll open the pairing dialog instead
      if (provider === 'android') {
        setAndroidPairOpen(true);
        return;
      }
      
      const clientId = 'demo_client_id';
      const redirectUri = `${window.location.origin}/device-connect`;
      
      await connectDevice(provider, clientId, redirectUri);
    } catch (error) {
      console.error(`Error connecting to ${provider}:`, error);
      toast({
        title: 'Connection Failed',
        description: `Unable to connect to ${getDeviceName(provider)}. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleAndroidPair = async (data: AndroidPairFormData) => {
    if (!user) return;
    
    try {
      const result = await pairAndroidDevice(user.id, data.deviceId);
      
      if (result.success) {
        toast({
          title: 'Device Paired',
          description: `Successfully paired Android device (${data.deviceId})`,
        });
        
        setAndroidPairOpen(false);
        form.reset();
        loadConnectedDevices();
      } else {
        throw new Error(result.error || 'Pairing failed');
      }
    } catch (error) {
      console.error('Error pairing Android device:', error);
      toast({
        title: 'Pairing Failed',
        description: 'Unable to pair Android device. Please try again.',
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
  
  const toggleRealtimeSync = (device: ConnectedDevice) => {
    if (!user || !device.deviceId) return;
    
    if (device.realtime) {
      // Turn off realtime
      if (realtimeUnsubscribe.current) {
        realtimeUnsubscribe.current();
        realtimeUnsubscribe.current = null;
      }
      
      setRealtimeDevices(prev => prev.filter(id => id !== device.deviceId));
      
      toast({
        title: 'Real-time Sync Disabled',
        description: 'Device will no longer sync in real-time',
      });
    } else {
      // Turn on realtime
      const unsub = setupRealtimeSync(user.id, device.deviceId, (data) => {
        // Handle real-time data updates
        toast({
          title: 'Real-time Update',
          description: `Received new health data from your Android device`,
        });
      });
      
      realtimeUnsubscribe.current = unsub;
      setRealtimeDevices(prev => [...prev, device.deviceId!]);
      
      toast({
        title: 'Real-time Sync Enabled',
        description: 'Device will now sync data in real-time',
      });
    }
    
    loadConnectedDevices();
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
      case 'android':
        return <SmartphoneIcon className="w-5 h-5 text-green-500" />;
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
                        <div className="flex items-center">
                          {device.realtime ? (
                            <RealTimeIndicator 
                              lastUpdated={new Date()} 
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Last synced: {device.lastSynced}
                            </p>
                          )}
                        </div>
                        {device.deviceId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Device ID: {device.deviceId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {device.provider === 'android' && (
                        <Button
                          size="sm"
                          variant={device.realtime ? "default" : "outline"}
                          onClick={() => toggleRealtimeSync(device)}
                        >
                          <WifiIcon className={`w-4 h-4 mr-2 ${device.realtime ? 'text-white' : ''}`} />
                          {device.realtime ? 'Live' : 'Enable Live'}
                        </Button>
                      )}
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
              {(['fitbit', 'apple_health', 'google_fit', 'withings', 'android'] as DeviceProvider[]).map(provider => (
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
      
      {/* Android Device Pairing Dialog */}
      <Dialog open={androidPairOpen} onOpenChange={setAndroidPairOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pair Android Device</DialogTitle>
            <DialogDescription>
              Enter your Android device details to establish a connection.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAndroidPair)} className="space-y-4">
              <FormField
                control={form.control}
                name="deviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter device ID" required {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deviceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Android Device" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAndroidPairOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <SmartphoneIcon className="w-4 h-4 mr-2" />
                  Pair Device
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
