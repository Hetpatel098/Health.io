
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { HealthMetricCard } from "@/components/HealthMetricCard";
import { ActivityCard } from "@/components/ActivityCard";
import { HeartPulse, Flame, Moon, Droplets, Bell, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useHealthStore, startHealthDataSimulation, setupRealtimeSubscriptions } from "@/services/healthDataService";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Index = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const healthData = useHealthStore((state) => state.data);
  const initialized = useHealthStore((state) => state.initialized);
  const fetchUserData = useHealthStore((state) => state.fetchUserData);
  const completeActivity = useHealthStore((state) => state.completeActivity);
  const addActivity = useHealthStore((state) => state.addActivity);
  
  const [openNewActivity, setOpenNewActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    time: "",
    duration: "",
  });
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  useEffect(() => {
    // Start the real-time data simulation when the component mounts
    startHealthDataSimulation();
    
    // Fetch user data when user is authenticated
    if (user && !initialized) {
      fetchUserData(user.id);
    }
    
    // Set up realtime subscriptions for the authenticated user
    let unsubscribe: (() => void) | undefined;
    if (user) {
      unsubscribe = setupRealtimeSubscriptions(user.id);
    }
    
    // Show toast when data updates
    const interval = setInterval(() => {
      const lastUpdated = formatDistanceToNow(healthData.lastUpdated, { addSuffix: true });
      toast({
        title: "Data Updated",
        description: `Latest health metrics updated ${lastUpdated}`,
        duration: 2000,
      });
    }, 30000); // Notify every 30 seconds
    
    return () => {
      clearInterval(interval);
      if (unsubscribe) unsubscribe();
    };
  }, [user, initialized]);
  
  const handleActivityClick = (id: string) => {
    completeActivity(id);
    toast({
      title: "Activity Completed",
      description: "Great job! Your activity has been marked as completed.",
      duration: 3000,
    });
  };
  
  const handleAddActivity = async () => {
    if (!newActivity.title) {
      toast({
        title: "Missing title",
        description: "Please provide a title for your activity.",
        variant: "destructive",
      });
      return;
    }
    
    await addActivity({
      title: newActivity.title,
      description: newActivity.description,
      time: newActivity.time,
      duration: newActivity.duration,
      completed: false,
    });
    
    toast({
      title: "Activity Added",
      description: "Your new activity has been added to your plan.",
      duration: 3000,
    });
    
    setNewActivity({
      title: "",
      description: "",
      time: "",
      duration: "",
    });
    
    setOpenNewActivity(false);
  };
  
  const userFirstName = user?.user_metadata?.first_name || "User";
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        rightElement={
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-health-green rounded-full"></span>
          </button>
        } 
      />
      
      <main className="px-5 pt-3 pb-24">
        {/* Welcome Section */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="text-3xl font-medium text-balance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Good morning, <br />{userFirstName}
          </motion.h1>
          <motion.p 
            className="text-muted-foreground mt-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {today}
          </motion.p>
          <motion.p 
            className="text-xs text-muted-foreground mt-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Last updated: {formatDistanceToNow(healthData.lastUpdated, { addSuffix: true })}
          </motion.p>
        </motion.section>
        
        {/* Health Metrics */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Health Metrics</h2>
            <button className="text-sm text-primary font-medium">See all</button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <HealthMetricCard
              title="Heart Rate"
              value={healthData.heartRate}
              unit="bpm"
              target={60}
              progress={80}
              icon={<HeartPulse className="w-5 h-5 text-health-blue" />}
              variant="primary"
            />
            <HealthMetricCard
              title="Steps"
              value={healthData.steps}
              target={10000}
              progress={Math.min(100, Math.round((healthData.steps / 10000) * 100))}
              icon={<Flame className="w-5 h-5 text-health-green" />}
              variant="success"
            />
            <HealthMetricCard
              title="Sleep"
              value={healthData.sleep}
              unit="hrs"
              target={8}
              progress={Math.min(100, Math.round((healthData.sleep / 8) * 100))}
              icon={<Moon className="w-5 h-5 text-health-purple" />}
              variant="purple"
            />
            <HealthMetricCard
              title="Water"
              value={Number(healthData.water.toFixed(1))}
              unit="L"
              target={2.5}
              progress={Math.min(100, Math.round((healthData.water / 2.5) * 100))}
              icon={<Droplets className="w-5 h-5 text-sky-500" />}
              variant="info"
            />
          </div>
        </section>
        
        {/* Today's Activities */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Today's Plan</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={() => setOpenNewActivity(true)}
              >
                <Plus className="h-5 w-5" />
              </Button>
              <button className="text-sm text-primary font-medium">View all</button>
            </div>
          </div>
          
          <div className="space-y-3">
            {healthData.activities.length > 0 ? (
              healthData.activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  title={activity.title}
                  description={activity.description}
                  time={activity.time}
                  duration={activity.duration}
                  completed={activity.completed}
                  onClick={() => !activity.completed && handleActivityClick(activity.id)}
                />
              ))
            ) : (
              <div className="text-center py-8 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">No activities yet.</p>
                <Button 
                  variant="outline"
                  className="mt-2"
                  onClick={() => setOpenNewActivity(true)}
                >
                  Add your first activity
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Dialog open={openNewActivity} onOpenChange={setOpenNewActivity}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Activity</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Activity Title</Label>
              <Input
                id="title"
                placeholder="Morning Meditation"
                value={newActivity.title}
                onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Start your day mindfully"
                value={newActivity.description}
                onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  placeholder="8:00 AM"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (optional)</Label>
                <Input
                  id="duration"
                  placeholder="15 min"
                  value={newActivity.duration}
                  onChange={(e) => setNewActivity({...newActivity, duration: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNewActivity(false)}>Cancel</Button>
            <Button onClick={handleAddActivity}>Add Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <BottomNav />
    </div>
  );
};

export default Index;
