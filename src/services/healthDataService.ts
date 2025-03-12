
import { create } from 'zustand';

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
  activities: [
    {
      id: '1',
      title: 'Morning Meditation',
      description: 'Start your day mindfully',
      time: '8:00 AM',
      duration: '15 min',
      completed: true,
    },
    {
      id: '2',
      title: 'Drink Water',
      description: 'Stay hydrated throughout the day',
      time: 'Every 2 hours',
      completed: false,
    },
    {
      id: '3',
      title: 'Evening Walk',
      description: 'Light cardio exercise',
      time: '6:30 PM',
      duration: '30 min',
      completed: false,
    },
    {
      id: '4',
      title: 'Take Vitamins',
      description: 'Daily supplements',
      time: '9:00 PM',
      completed: false,
    },
  ],
  lastUpdated: new Date(),
};

// Create a store with the initial data
export const useHealthStore = create<{
  data: HealthData;
  updateHeartRate: (value: number) => void;
  incrementSteps: (steps: number) => void;
  updateSleep: (hours: number) => void;
  updateWater: (liters: number) => void;
  updateCaloriesBurned: (calories: number) => void;
  completeActivity: (id: string) => void;
}>((set) => ({
  data: initialHealthData,
  updateHeartRate: (value) => 
    set((state) => ({ 
      data: { 
        ...state.data, 
        heartRate: value,
        lastUpdated: new Date()
      } 
    })),
  incrementSteps: (steps) => 
    set((state) => ({ 
      data: { 
        ...state.data, 
        steps: state.data.steps + steps,
        lastUpdated: new Date()
      } 
    })),
  updateSleep: (hours) => 
    set((state) => ({ 
      data: { 
        ...state.data, 
        sleep: hours,
        lastUpdated: new Date()
      } 
    })),
  updateWater: (liters) => 
    set((state) => ({ 
      data: { 
        ...state.data, 
        water: liters,
        lastUpdated: new Date()
      } 
    })),
  updateCaloriesBurned: (calories) => 
    set((state) => ({ 
      data: { 
        ...state.data, 
        caloriesBurned: calories,
        lastUpdated: new Date()
      } 
    })),
  completeActivity: (id) => 
    set((state) => ({ 
      data: { 
        ...state.data, 
        activities: state.data.activities.map(activity => 
          activity.id === id ? { ...activity, completed: true } : activity
        ),
        lastUpdated: new Date()
      } 
    })),
}));

// Simulate real-time data updates
export const startHealthDataSimulation = () => {
  const store = useHealthStore.getState();

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

