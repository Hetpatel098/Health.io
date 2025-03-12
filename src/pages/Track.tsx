
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ActivityCard } from "@/components/ActivityCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

const trackingOptions = [
  {
    title: "Track Exercise",
    description: "Log your workout activities",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    title: "Track Sleep",
    description: "Record your sleep duration and quality",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    title: "Track Water",
    description: "Log your water intake",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    title: "Track Mood",
    description: "Record how you're feeling",
    image: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    title: "Track Meal",
    description: "Log your food intake",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    title: "Track Medication",
    description: "Record your medication intake",
    image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
];

const Track = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Track" />
      
      <main className="px-5 pt-3 pb-24">
        {/* Recent Activities */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Recent Activities</h2>
            <button className="text-sm text-primary font-medium">See history</button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-full">Today</Button>
            <Button variant="outline" className="rounded-full">Yesterday</Button>
            <Button variant="outline" className="rounded-full">This Week</Button>
          </div>
          
          <div className="mt-4 space-y-3">
            <ActivityCard
              title="Morning Run"
              description="Outdoor running"
              time="8:30 AM"
              duration="30 min"
              completed={true}
            />
            <ActivityCard
              title="Breakfast"
              description="Oatmeal with fruits"
              time="9:15 AM"
              completed={true}
            />
          </div>
        </motion.section>
        
        {/* Track New Activity */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Track New Activity</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {trackingOptions.map((option, index) => (
              <motion.div
                key={option.title}
                className="glass-card p-4 flex flex-col h-40 overflow-hidden relative group cursor-pointer hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 z-0">
                  <img 
                    src={option.image} 
                    alt={option.title} 
                    className="w-full h-full object-cover opacity-20 transition-opacity group-hover:opacity-30" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/10" />
                </div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <h3 className="font-medium text-base">{option.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                  
                  <div className="self-end mt-auto">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Track;
