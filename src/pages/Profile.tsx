
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { User, Settings, Shield, Bell, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

interface ProfileOptionProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
}

const ProfileOption = ({ icon, title, description, onClick }: ProfileOptionProps) => (
  <motion.div 
    className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent cursor-pointer"
    onClick={onClick}
    whileHover={{ x: 5 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="font-medium text-base">{title}</h3>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  </motion.div>
);

const Profile = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Profile" />
      
      <main className="px-5 pt-3 pb-24">
        {/* Profile Header */}
        <motion.section 
          className="mb-8 flex flex-col items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
              <User className="w-4 h-4" />
            </button>
          </div>
          
          <h1 className="text-xl font-medium mt-4">Alex Johnson</h1>
          <p className="text-sm text-muted-foreground">alex.johnson@example.com</p>
          
          <Button variant="outline" className="mt-4 rounded-full px-6">
            Edit Profile
          </Button>
        </motion.section>
        
        {/* Health Summary */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="glass-card p-5">
            <h2 className="text-lg font-medium mb-3">Health Overview</h2>
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="text-lg font-medium">5'11" (180cm)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="text-lg font-medium">165 lbs (75kg)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Type</p>
                <p className="text-lg font-medium">O+</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="text-lg font-medium">32 years</p>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-4">
              View Health Details
            </Button>
          </div>
        </motion.section>
        
        {/* Profile Options */}
        <section>
          <h2 className="text-lg font-medium mb-3">Settings</h2>
          
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <ProfileOption 
              icon={<Settings className="w-5 h-5 text-primary" />}
              title="App Settings"
              description="Notification, theme, and app preferences"
            />
            
            <ProfileOption 
              icon={<Shield className="w-5 h-5 text-primary" />}
              title="Privacy Settings"
              description="Manage your data and permissions"
            />
            
            <ProfileOption 
              icon={<Bell className="w-5 h-5 text-primary" />}
              title="Reminders"
              description="Set up health and medication reminders"
            />
            
            <ProfileOption 
              icon={<HelpCircle className="w-5 h-5 text-primary" />}
              title="Help & Support"
              description="FAQs, contact support, and documentation"
            />
            
            <Separator className="my-4" />
            
            <ProfileOption 
              icon={<LogOut className="w-5 h-5 text-destructive" />}
              title="Log Out"
            />
          </motion.div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Profile;
