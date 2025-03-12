
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProgressCircleProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  animate?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const ProgressCircle = ({
  value,
  size = 120,
  strokeWidth = 6,
  color = "stroke-health-blue",
  backgroundColor = "stroke-health-softBlue",
  animate = true,
  className,
  children,
}: ProgressCircleProps) => {
  const [progress, setProgress] = useState(0);
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  
  useEffect(() => {
    if (animate) {
      // Start at 0 and animate to the actual value
      setProgress(0);
      const timer = setTimeout(() => {
        setProgress(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setProgress(value);
    }
  }, [value, animate]);

  return (
    <div 
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ height: size, width: size }}
    >
      <svg
        className="transform -rotate-90"
        height={size}
        width={size}
      >
        <circle
          className={cn("transition-all duration-300", backgroundColor)}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          className={cn("transition-all duration-700", color)}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          style={{
            transition: animate ? "stroke-dashoffset 1s ease-in-out" : "none",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <span className="text-xl font-medium">{Math.round(progress)}%</span>
        )}
      </div>
    </div>
  );
};
