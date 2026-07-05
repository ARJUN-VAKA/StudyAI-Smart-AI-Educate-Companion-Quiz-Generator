import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
}));

interface MaterialState {
  selectedMaterialId: string | null;
  selectedMaterialTitle: string;
  setSelectedMaterial: (id: string, title: string) => void;
}

export const useMaterialStore = create<MaterialState>()(
  persist(
    (set) => ({
      selectedMaterialId: null,
      selectedMaterialTitle: '',
      setSelectedMaterial: (id, title) =>
        set({ selectedMaterialId: id, selectedMaterialTitle: title }),
    }),
    { name: 'studyai-material' }
  )
);

export interface Task {
  time: string;
  topic: string;
  duration: string;
  priority: 'high' | 'medium' | 'low';
  tip: string;
}

export interface DayPlan {
  day: string;
  date: string;
  tasks: Task[];
}

interface ScheduleState {
  schedule: DayPlan[];
  setSchedule: (schedule: DayPlan[]) => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      schedule: [],
      setSchedule: (schedule) => set({ schedule }),
    }),
    { name: 'studyai-schedule' }
  )
);
