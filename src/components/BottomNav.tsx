
import { Home, Activity, PieChart, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  {
    name: "Home",
    path: "/",
    icon: Home,
  },
  {
    name: "Track",
    path: "/track",
    icon: Activity,
  },
  {
    name: "Insights",
    path: "/insights",
    icon: PieChart,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: User,
  },
];

interface BottomNavProps {
  className?: string;
}

export const BottomNav = ({ className }: BottomNavProps) => {
  return (
    <motion.nav
      className={cn(
        "fixed bottom-0 inset-x-0 z-50 glass border-t border-gray-200 safe-bottom",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground/80"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-5 h-5", isActive && "animate-scale-in")} />
                <span className="text-xs mt-1">{item.name}</span>
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 w-10 h-0.5 bg-primary rounded-t-full"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
};
