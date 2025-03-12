import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface HealthData {
  heartRate: number;
  steps: number;
  sleep: number;
  water: number;
  caloriesBurned: number;
  activities: Activity[];
  lastUpdated: Date;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  duration?: string;
  completed: boolean;
}

// Initial mock data
const initialHealthData: HealthData = {
  heartRate: 72,
  steps: 7568,
  sleep: 7.5,
  water: 1.5,
  caloriesBurned: 350,
  activities: [],
  lastUpdated: new Date(),
};

// Create a store with the initial data and Supabase integration
export const useHealthStore = create<{
  data: HealthData;
  initialized: boolean;
  updateHeartRate: (value: number) => void;
  incrementSteps: (steps: number) => void;
  updateSleep: (hours: number) => void;
  updateWater: (liters: number) => void;
  updateCaloriesBurned: (calories: number) => void;
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Omit<Activity, 'id'>) => Promise<void>;
  completeActivity: (id: string) => Promise<void>;
  fetchUserData: (userId: string) => Promise<void>;
}>((set, get) => ({
  data: initialHealthData,
  initialized: false,
  
  updateHeartRate: (value) => 
    set((state) => {
      const newState = { 
        data: { 
          ...state.data, 
          heartRate: value,
          lastUpdated: new Date()
        }
      };
      updateHealthMetrics(newState.data);
      return newState;
    }),
    
  incrementSteps: (steps) => 
    set((state) => {
      const newState = { 
        data: { 
          ...state.data, 
          steps: state.data.steps + steps,
          lastUpdated: new Date()
        }
      };
      updateHealthMetrics(newState.data);
      return newState;
    }),
    
  updateSleep: (hours) => 
    set((state) => {
      const newState = { 
        data: { 
          ...state.data, 
          sleep: hours,
          lastUpdated: new Date()
        }
      };
      updateHealthMetrics(newState.data);
      return newState;
    }),
    
  updateWater: (liters) => 
    set((state) => {
      const newState = { 
        data: { 
          ...state.data, 
          water: liters,
          lastUpdated: new Date()
        }
      };
      updateHealthMetrics(newState.data);
      return newState;
    }),
    
  updateCaloriesBurned: (calories) => 
    set((state) => {
      const newState = { 
        data: { 
          ...state.data, 
          caloriesBurned: calories,
          lastUpdated: new Date()
        }
      };
      updateHealthMetrics(newState.data);
      return newState; 
    }),
    
  setActivities: (activities) => 
    set((state) => ({ 
      data: { 
        ...state.data, 
        activities,
        lastUpdated: new Date()
      } 
    })),
    
  addActivity: async (activityData) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          user_id: userData.user.id,
          title: activityData.title,
          description: activityData.description || null,
          time: activityData.time || null,
          duration: activityData.duration || null,
          completed: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      set((state) => ({
        data: {
          ...state.data,
          activities: [...state.data.activities, {
            id: data.id,
            title: data.title,
            description: data.description || '',
            time: data.time || '',
            duration: data.duration || undefined,
            completed: data.completed
          }],
          lastUpdated: new Date()
        }
      }));
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  },
    
  completeActivity: async (id) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ completed: true })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      set((state) => ({
        data: {
          ...state.data,
          activities: state.data.activities.map(activity => 
            activity.id === id ? { ...activity, completed: true } : activity
          ),
          lastUpdated: new Date()
        }
      }));
    } catch (error) {
      console.error('Error completing activity:', error);
    }
  },
  
  fetchUserData: async (userId) => {
    try {
      // Fetch latest health metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();
      
      if (metricsError && metricsError.code !== 'PGRST116') {
        // PGRST116 is the error code for no rows returned
        console.error('Error fetching health metrics:', metricsError);
      }
      
      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
      }
      
      set((state) => ({
        initialized: true,
        data: {
          ...state.data,
          heartRate: metricsData?.heart_rate || state.data.heartRate,
          steps: metricsData?.steps || state.data.steps,
          sleep: metricsData?.sleep || state.data.sleep,
          water: metricsData?.water || state.data.water,
          caloriesBurned: metricsData?.calories_burned || state.data.caloriesBurned,
          activities: activitiesData ? activitiesData.map(a => ({
            id: a.id,
            title: a.title,
            description: a.description || '',
            time: a.time || '',
            duration: a.duration || undefined,
            completed: a.completed
          })) : state.data.activities,
          lastUpdated: metricsData?.recorded_at ? new Date(metricsData.recorded_at) : new Date()
        }
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }
}));

// Helper function to update health metrics in Supabase
const updateHealthMetrics = async (data: HealthData) => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;
  
  try {
    await supabase
      .from('health_metrics')
      .insert({
        user_id: userData.user.id,
        heart_rate: data.heartRate,
        steps: data.steps,
        sleep: data.sleep, 
        water: data.water,
        calories_burned: data.caloriesBurned,
        recorded_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error updating health metrics:', error);
  }
};

// Simulate real-time data updates
export const startHealthDataSimulation = async () => {
  const store = useHealthStore.getState();
  const { data: sessionData } = await supabase.auth.getSession();
  
  // If user is logged in, fetch their data first
  if (sessionData?.session?.user) {
    store.fetchUserData(sessionData.session.user.id);
  }

  // Update heart rate every 3 seconds within a realistic range
  setInterval(() => {
    const currentRate = store.data.heartRate;
    const change = Math.floor(Math.random() * 5) - 2; // -2 to +2 change
    const newRate = Math.max(60, Math.min(90, currentRate + change));
    store.updateHeartRate(newRate);
  }, 3000);

  // Add steps periodically
  setInterval(() => {
    const stepIncrement = Math.floor(Math.random() * 30) + 10; // 10-40 steps
    store.incrementSteps(stepIncrement);
  }, 15000);

  // Update water intake periodically (small sips)
  setInterval(() => {
    if (Math.random() > 0.6) { // 40% chance to drink water
      const currentWater = store.data.water;
      store.updateWater(Math.min(2.5, currentWater + 0.1));
    }
  }, 20000);

  // Update calories burned
  setInterval(() => {
    const currentCalories = store.data.caloriesBurned;
    const increment = Math.floor(Math.random() * 10) + 5;
    store.updateCaloriesBurned(currentCalories + increment);
  }, 25000);
};

// Listen for real-time updates on activities
export const setupRealtimeSubscriptions = (userId: string) => {
  const store = useHealthStore.getState();
  
  const activityChannel = supabase
    .channel('public:activities')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'activities',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      console.log('Activity change received:', payload);
      store.fetchUserData(userId);
    })
    .subscribe();
    
  const metricsChannel = supabase
    .channel('public:health_metrics')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'health_metrics',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      console.log('Health metrics change received:', payload);
      store.fetchUserData(userId);
    })
    .subscribe();
    
  return () => {
    supabase.removeChannel(activityChannel);
    supabase.removeChannel(metricsChannel);
  };
};
