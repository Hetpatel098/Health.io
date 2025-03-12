
import { cn } from "@/lib/utils";
import { ProgressCircle } from "./ProgressCircle";
import { motion } from "framer-motion";

type HealthMetricVariant = "primary" | "success" | "info" | "purple";

const variantStyles = {
  primary: {
    bg: "bg-health-softBlue",
    text: "text-blue-700",
    progress: "stroke-health-blue",
    progressBg: "stroke-blue-100",
    iconBg: "bg-blue-50",
  },
  success: {
    bg: "bg-health-softGreen",
    text: "text-green-700",
    progress: "stroke-health-green",
    progressBg: "stroke-green-100",
    iconBg: "bg-green-50",
  },
  info: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    progress: "stroke-sky-500",
    progressBg: "stroke-sky-100",
    iconBg: "bg-sky-50",
  },
  purple: {
    bg: "bg-health-softPurple",
    text: "text-purple-700",
    progress: "stroke-health-purple",
    progressBg: "stroke-purple-100",
    iconBg: "bg-purple-50",
  },
};

interface HealthMetricCardProps {
  title: string;
  value: number;
  unit?: string;
  target?: number;
  progress?: number;
  icon?: React.ReactNode;
  variant?: HealthMetricVariant;
  description?: string;
  className?: string;
}

export const HealthMetricCard = ({ 
  title, 
  value, 
  unit = "", 
  target, 
  progress = 0, 
  icon,
  variant = "primary",
  description,
  className 
}: HealthMetricCardProps) => {
  const styles = variantStyles[variant];
  
  return (
    <motion.div 
      className={cn(
        "glass-card p-5 flex flex-col gap-3",
        styles.bg,
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={cn("font-medium text-sm", styles.text)}>{title}</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-semibold">{value}</span>
            {unit && <span className="text-sm ml-1 opacity-70">{unit}</span>}
          </div>
          {target && (
            <p className="text-xs text-muted-foreground mt-1">
              Target: {target}{unit}
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-2">
              {description}
            </p>
          )}
        </div>
        
        <div className="flex-shrink-0">
          {progress > 0 ? (
            <ProgressCircle 
              value={progress} 
              size={60}
              strokeWidth={5}
              color={styles.progress}
              backgroundColor={styles.progressBg}
            />
          ) : icon ? (
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", styles.iconBg)}>
              {icon}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};
