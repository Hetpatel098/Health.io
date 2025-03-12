
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { HealthMetricCard } from "@/components/HealthMetricCard";
import { ActivityCard } from "@/components/ActivityCard";
import { HeartPulse, Flame, Moon, Droplets, Bell } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        rightElement={
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent">
            <Bell className="w-5 h-5" />
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
              value={72}
              unit="bpm"
              target={60}
              progress={80}
              icon={<HeartPulse className="w-5 h-5 text-health-blue" />}
              variant="primary"
            />
            <HealthMetricCard
              title="Steps"
              value={7568}
              target={10000}
              progress={75}
              icon={<Flame className="w-5 h-5 text-health-green" />}
              variant="success"
            />
            <HealthMetricCard
              title="Sleep"
              value={7.5}
              unit="hrs"
              target={8}
              progress={93}
              icon={<Moon className="w-5 h-5 text-health-purple" />}
              variant="purple"
            />
            <HealthMetricCard
              title="Water"
              value={1.5}
              unit="L"
              target={2.5}
              progress={60}
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
            <ActivityCard
              title="Morning Meditation"
              description="Start your day mindfully"
              time="8:00 AM"
              duration="15 min"
              completed={true}
            />
            <ActivityCard
              title="Drink Water"
              description="Stay hydrated throughout the day"
              time="Every 2 hours"
            />
            <ActivityCard
              title="Evening Walk"
              description="Light cardio exercise"
              time="6:30 PM"
              duration="30 min"
            />
            <ActivityCard
              title="Take Vitamins"
              description="Daily supplements"
              time="9:00 PM"
            />
          </div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Index;
