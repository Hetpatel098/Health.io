
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

interface RealTimeIndicatorProps {
  lastUpdated: Date;
  className?: string;
}

export const RealTimeIndicator = ({ lastUpdated, className }: RealTimeIndicatorProps) => {
  const [timeAgo, setTimeAgo] = useState<string>("");
  
  useEffect(() => {
    // Update the relative time display
    const updateTimeAgo = () => {
      setTimeAgo(formatDistanceToNow(lastUpdated, { addSuffix: true }));
    };
    
    // Initial calculation
    updateTimeAgo();
    
    // Set up an interval to update the time every 5 seconds
    const interval = setInterval(updateTimeAgo, 5000);
    
    return () => clearInterval(interval);
  }, [lastUpdated]);
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <motion.div
        className="w-2 h-2 bg-health-green rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-xs text-muted-foreground">
        Updated {timeAgo}
      </span>
    </div>
  );
};
