
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressCircle } from "@/components/ProgressCircle";
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart,
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useHealthStore } from "@/services/healthDataService";
import { useEffect, useState } from "react";

// Generate realistic sleep data based on current value
const generateSleepData = (currentHours: number) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map(day => {
    // Vary around the current hours with some randomness
    const variation = Math.random() * 2 - 1; // -1 to +1
    const hours = Math.max(5, Math.min(10, currentHours + variation));
    return { day, hours: Number(hours.toFixed(1)) };
  });
};

// Generate heart rate data throughout the day
const generateHeartRateData = (currentRate: number) => {
  const times = ["6am", "9am", "12pm", "3pm", "6pm", "9pm"];
  return times.map(time => {
    // Create a realistic pattern with morning lows and afternoon peaks
    let baseRate;
    if (time === "6am" || time === "9pm") {
      baseRate = currentRate - 10; // Lower at rest
    } else if (time === "12pm" || time === "6pm") {
      baseRate = currentRate + 10; // Higher during activity
    } else {
      baseRate = currentRate;
    }
    
    const variation = Math.floor(Math.random() * 5) - 2; // -2 to +2
    return { time, rate: Math.max(60, Math.min(100, baseRate + variation)) };
  });
};

// Generate exercise data for the week
const generateExerciseData = (stepsToday: number) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const todayIndex = today === 0 ? 6 : today - 1; // Convert to array index
  
  // Convert steps to approximate exercise minutes
  const minutesToday = Math.round(stepsToday / 100);
  
  return days.map((day, index) => {
    if (index === todayIndex) {
      // Today's actual value based on steps
      return { day, minutes: minutesToday };
    } else if (index > todayIndex) {
      // Future days - no data yet
      return { day, minutes: 0 };
    } else {
      // Past days - generate random realistic data
      const value = Math.floor(Math.random() * 60) + 30; // 30-90 minutes
      return { day, minutes: value };
    }
  });
};

const Insights = () => {
  const healthData = useHealthStore((state) => state.data);
  
  // Generate derived data for charts based on real-time values
  const [sleepData, setSleepData] = useState(() => generateSleepData(healthData.sleep));
  const [heartRateData, setHeartRateData] = useState(() => generateHeartRateData(healthData.heartRate));
  const [exerciseData, setExerciseData] = useState(() => generateExerciseData(healthData.steps));
  
  // Update chart data when health data changes
  useEffect(() => {
    setSleepData(generateSleepData(healthData.sleep));
    setHeartRateData(generateHeartRateData(healthData.heartRate));
    setExerciseData(generateExerciseData(healthData.steps));
  }, [healthData.heartRate, healthData.sleep, healthData.steps]);
  
  // Calculate overall health score based on multiple metrics
  const calculateHealthScore = () => {
    const sleepScore = Math.min(100, (healthData.sleep / 8) * 100);
    const stepsScore = Math.min(100, (healthData.steps / 10000) * 100);
    const waterScore = Math.min(100, (healthData.water / 2.5) * 100);
    
    // Weight the factors
    return Math.round((sleepScore * 0.3) + (stepsScore * 0.4) + (waterScore * 0.3));
  };
  
  const healthScore = calculateHealthScore();
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Insights" />
      
      <main className="px-5 pt-3 pb-24">
        {/* Overall Health Score */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="glass-card p-5 flex flex-col items-center">
            <h2 className="text-lg font-medium">Overall Health Score</h2>
            <p className="text-sm text-muted-foreground">Based on your recent activities</p>
            
            <div className="my-5">
              <ProgressCircle 
                value={healthScore} 
                size={150}
                strokeWidth={10}
                color="stroke-health-green"
                backgroundColor="stroke-muted"
                animate={true}
              >
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-semibold">{healthScore}</span>
                  <span className="text-sm text-muted-foreground">{
                    healthScore >= 90 ? 'Excellent' :
                    healthScore >= 80 ? 'Great' :
                    healthScore >= 70 ? 'Good' :
                    healthScore >= 60 ? 'Fair' :
                    'Needs Improvement'
                  }</span>
                </div>
              </ProgressCircle>
            </div>
            
            <div className="grid grid-cols-3 w-full gap-3 mt-3">
              <div className="flex flex-col items-center bg-health-softBlue rounded-lg p-2">
                <span className="text-sm font-medium">Sleep</span>
                <span className="text-xl font-medium text-health-blue">{Math.round((healthData.sleep / 8) * 100)}%</span>
              </div>
              <div className="flex flex-col items-center bg-health-softGreen rounded-lg p-2">
                <span className="text-sm font-medium">Activity</span>
                <span className="text-xl font-medium text-health-green">{Math.min(99, Math.round((healthData.steps / 10000) * 100))}%</span>
              </div>
              <div className="flex flex-col items-center bg-health-softPurple rounded-lg p-2">
                <span className="text-sm font-medium">Nutrition</span>
                <span className="text-xl font-medium text-health-purple">{Math.round((healthData.water / 2.5) * 100)}%</span>
              </div>
            </div>
          </div>
        </motion.section>
        
        {/* Detailed Health Insights */}
        <section>
          <Tabs defaultValue="sleep" className="w-full">
            <TabsList className="w-full mb-4 p-1 bg-muted rounded-full">
              <TabsTrigger value="sleep" className="rounded-full">Sleep</TabsTrigger>
              <TabsTrigger value="heartRate" className="rounded-full">Heart Rate</TabsTrigger>
              <TabsTrigger value="exercise" className="rounded-full">Exercise</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sleep">
              <motion.div 
                className="glass-card p-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium">Sleep Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">7-day sleep pattern</p>
                
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sleepData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="day" />
                      <YAxis tickCount={6} domain={[0, 10]} />
                      <Tooltip
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          padding: '10px'
                        }}
                      />
                      <Bar 
                        dataKey="hours" 
                        fill="#A78BFA" 
                        radius={[4, 4, 0, 0]} 
                        barSize={30} 
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 bg-health-softPurple rounded-lg p-3">
                  <h4 className="text-sm font-medium">Insight</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {healthData.sleep >= 8 
                      ? "Your sleep has been excellent. Keep maintaining this healthy sleep pattern."
                      : healthData.sleep >= 7
                      ? "Your sleep has been good. Try going to bed 30 minutes earlier to reach your optimal sleep goal."
                      : "Your sleep has been below target. Aim for 8 hours of sleep for optimal health and recovery."}
                  </p>
                </div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="heartRate">
              <motion.div 
                className="glass-card p-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium">Heart Rate Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">Today's heart rate pattern</p>
                
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={heartRateData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="time" />
                      <YAxis tickCount={6} domain={[50, 100]} />
                      <Tooltip
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          padding: '10px'
                        }}
                      />
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#58B7FF" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#58B7FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="rate" 
                        stroke="#58B7FF" 
                        fillOpacity={1} 
                        fill="url(#colorRate)" 
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 bg-health-softBlue rounded-lg p-3">
                  <h4 className="text-sm font-medium">Insight</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {healthData.heartRate > 80 
                      ? "Your heart rate is slightly elevated. Consider taking a moment to practice deep breathing."
                      : healthData.heartRate < 65
                      ? "Your resting heart rate is excellent, indicating good cardiovascular fitness."
                      : "Your heart rate is within a healthy range. It follows the normal pattern of being lower in the morning and evening."}
                  </p>
                </div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="exercise">
              <motion.div 
                className="glass-card p-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium">Exercise Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">7-day exercise minutes</p>
                
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={exerciseData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="day" />
                      <YAxis tickCount={6} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          padding: '10px'
                        }}
                      />
                      <Bar 
                        dataKey="minutes" 
                        fill="#36D399" 
                        radius={[4, 4, 0, 0]} 
                        barSize={30}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 bg-health-softGreen rounded-lg p-3">
                  <h4 className="text-sm font-medium">Insight</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {exerciseData.reduce((acc, curr) => acc + curr.minutes, 0) >= 150
                      ? "You've exceeded the recommended 150 minutes of moderate exercise per week. Excellent work!"
                      : healthData.steps >= 8000
                      ? "You're making good progress with your daily steps. Try to include more structured exercise for even better results."
                      : "Adding just 30 minutes of moderate exercise most days of the week can significantly improve your health metrics."}
                  </p>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Insights;
