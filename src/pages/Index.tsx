
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { HealthMetricCard } from "@/components/HealthMetricCard";
import { ActivityCard } from "@/components/ActivityCard";
import { HeartPulse, Flame, Moon, Droplets, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useHealthStore, startHealthDataSimulation } from "@/services/healthDataService";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const Index = () => {
  const { toast } = useToast();
  const healthData = useHealthStore((state) => state.data);
  const completeActivity = useHealthStore((state) => state.completeActivity);
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  useEffect(() => {
    // Start the real-time data simulation when the component mounts
    startHealthDataSimulation();
    
    // Show toast when data updates
    const interval = setInterval(() => {
      const lastUpdated = formatDistanceToNow(healthData.lastUpdated, { addSuffix: true });
      toast({
        title: "Data Updated",
        description: `Latest health metrics updated ${lastUpdated}`,
        duration: 2000,
      });
    }, 30000); // Notify every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const handleActivityClick = (id: string) => {
    completeActivity(id);
    toast({
      title: "Activity Completed",
      description: "Great job! Your activity has been marked as completed.",
      duration: 3000,
    });
  };
  
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
            Good morning, <br />Alex
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
              value={healthData.water.toFixed(1)}
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
            <button className="text-sm text-primary font-medium">View all</button>
          </div>
          
          <div className="space-y-3">
            {healthData.activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                title={activity.title}
                description={activity.description}
                time={activity.time}
                duration={activity.duration}
                completed={activity.completed}
                onClick={() => !activity.completed && handleActivityClick(activity.id)}
              />
            ))}
          </div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Index;
