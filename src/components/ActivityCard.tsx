
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface ActivityCardProps {
  title: string;
  description?: string;
  time?: string;
  duration?: string;
  completed?: boolean;
  image?: string;
  onClick?: () => void;
  className?: string;
}

export const ActivityCard = ({ 
  title, 
  description, 
  time, 
  duration,
  completed, 
  image,
  onClick,
  className 
}: ActivityCardProps) => {
  return (
    <motion.div 
      className={cn(
        "glass-card p-4 flex items-center gap-4 cursor-pointer hover:shadow-md active:scale-98 transition-all",
        className
      )}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileTap={{ scale: 0.98 }}
    >
      {image ? (
        <div className="relative w-14 h-14 bg-muted rounded-xl overflow-hidden flex-shrink-0">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
          {completed ? (
            <div className="w-8 h-8 bg-health-green rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
          ) : (
            <Clock className="w-6 h-6 text-primary" />
          )}
        </div>
      )}
      
      <div className="flex-1">
        <h3 className="font-medium text-sm">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
        
        <div className="flex items-center gap-2 mt-1">
          {time && (
            <span className="text-xs bg-accent px-2 py-0.5 rounded-full">
              {time}
            </span>
          )}
          {duration && (
            <span className="text-xs bg-accent px-2 py-0.5 rounded-full">
              {duration}
            </span>
          )}
        </div>
      </div>
      
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </motion.div>
  );
};
