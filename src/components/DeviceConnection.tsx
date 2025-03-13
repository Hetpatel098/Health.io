
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  connectDevice, 
  syncDeviceData, 
  DeviceProvider, 
  pairAndroidDevice,
  setupRealtimeSync,
  generateConnectQRCode
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
  BellIcon,
  InfoIcon,
  QrCodeIcon
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
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ConnectedDevice {
  provider: DeviceProvider;
  name: string;
  lastSynced: string;
  connected: boolean;
  deviceId?: string;
  deviceName?: string;
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
  const [connectionCode, setConnectionCode] = useState('');
  const [activeTab, setActiveTab] = useState('manual');
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
        name: device.device_name || getDeviceName(device.provider),
        lastSynced: new Date(device.last_synced).toLocaleString(),
        connected: true,
        deviceId: device.device_id || (device.provider === 'android' ? device.access_token.split('_')[1] : undefined),
        deviceName: device.device_name || undefined,
        realtime: realtimeDevices.includes(device.device_id || '')
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
        
        // Generate a unique code for connection
        if (user) {
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          setConnectionCode(code);
        }
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
      const result = await pairAndroidDevice(user.id, data.deviceId, data.deviceName);
      
      if (result.success) {
        toast({
          title: 'Device Paired',
          description: `Successfully paired Android device (${data.deviceName})`,
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Android Device</DialogTitle>
            <DialogDescription>
              Connect your Android device to sync health and fitness data.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="manual" className="w-full mt-4" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Setup</TabsTrigger>
              <TabsTrigger value="app">Connect with App</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="mt-4">
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
                        <FormDescription>
                          You can find your Device ID in your Android phone's Settings > About Phone > Status.
                        </FormDescription>
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
                  
                  <DialogFooter className="mt-6">
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
            </TabsContent>
            
            <TabsContent value="app" className="mt-4">
              <div className="space-y-4">
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Easy connection with Health Sync app</AlertTitle>
                  <AlertDescription>
                    Download the Health Sync app on your Android device and use the connection code below to pair.
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-col items-center justify-center py-6 border rounded-md bg-muted/20">
                  <QrCodeIcon className="w-32 h-32 mb-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Scan this QR code with the Health Sync app</p>
                </div>
                
                <div className="border rounded-md p-4 text-center bg-primary/5">
                  <p className="text-sm text-muted-foreground mb-1">Or enter this code in the app:</p>
                  <p className="text-2xl font-bold tracking-widest">{connectionCode || '------'}</p>
                </div>
                
                <div className="mt-6 text-center">
                  <Button 
                    type="button" 
                    variant="default"
                    onClick={() => {
                      if (user) {
                        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                        setConnectionCode(newCode);
                        toast({
                          title: "New Code Generated",
                          description: "Use this code in the Health Sync app to connect your device."
                        });
                      }
                    }}
                  >
                    <RefreshCwIcon className="w-4 h-4 mr-2" />
                    Generate New Code
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};
