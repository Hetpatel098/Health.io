
import { ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
  className?: string;
}

export const Header = ({
  title,
  showBackButton = false,
  rightElement,
  className,
}: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Only show title if provided or if we're not on the home page
  const showTitle = title || location.pathname !== "/";
  
  return (
    <motion.header
      className={cn(
        "sticky top-0 z-50 safe-top px-4 py-3 flex items-center justify-between bg-background/80 backdrop-blur-lg",
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-accent active:bg-accent/80 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        {showTitle && (
          <motion.h1 
            className="text-lg font-medium"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {title || location.pathname.substring(1)}
          </motion.h1>
        )}
      </div>
      
      {rightElement && (
        <div className="flex items-center">{rightElement}</div>
      )}
    </motion.header>
  );
};
