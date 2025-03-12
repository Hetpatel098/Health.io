
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

const sleepData = [
  { day: "Mon", hours: 7.5 },
  { day: "Tue", hours: 6.8 },
  { day: "Wed", hours: 8.2 },
  { day: "Thu", hours: 7.0 },
  { day: "Fri", hours: 6.5 },
  { day: "Sat", hours: 8.0 },
  { day: "Sun", hours: 7.8 },
];

const heartRateData = [
  { time: "6am", rate: 68 },
  { time: "9am", rate: 72 },
  { time: "12pm", rate: 80 },
  { time: "3pm", rate: 76 },
  { time: "6pm", rate: 82 },
  { time: "9pm", rate: 70 },
];

const exerciseData = [
  { day: "Mon", minutes: 45 },
  { day: "Tue", minutes: 30 },
  { day: "Wed", minutes: 0 },
  { day: "Thu", minutes: 60 },
  { day: "Fri", minutes: 45 },
  { day: "Sat", minutes: 90 },
  { day: "Sun", minutes: 30 },
];

const Insights = () => {
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
                value={82} 
                size={150}
                strokeWidth={10}
                color="stroke-health-green"
                backgroundColor="stroke-muted"
                animate={true}
              >
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-semibold">82</span>
                  <span className="text-sm text-muted-foreground">Great</span>
                </div>
              </ProgressCircle>
            </div>
            
            <div className="grid grid-cols-3 w-full gap-3 mt-3">
              <div className="flex flex-col items-center bg-health-softBlue rounded-lg p-2">
                <span className="text-sm font-medium">Sleep</span>
                <span className="text-xl font-medium text-health-blue">85%</span>
              </div>
              <div className="flex flex-col items-center bg-health-softGreen rounded-lg p-2">
                <span className="text-sm font-medium">Activity</span>
                <span className="text-xl font-medium text-health-green">79%</span>
              </div>
              <div className="flex flex-col items-center bg-health-softPurple rounded-lg p-2">
                <span className="text-sm font-medium">Nutrition</span>
                <span className="text-xl font-medium text-health-purple">83%</span>
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
                    Your sleep has been consistent this week. Try going to bed 30 minutes earlier to reach your optimal sleep goal.
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
                    Your heart rate peaked around noon and 6pm, which correlates with physical activity. Overall, your heart rate is within a healthy range.
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
                    You've exercised for 300 minutes this week, which is excellent! Try to maintain consistency by adding a short workout on Wednesday.
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
