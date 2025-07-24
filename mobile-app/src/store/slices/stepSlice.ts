import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StepState {
  steps: number;
  todaySteps: number;
  weeklySteps: number;
  loading: boolean;
  error: string | null;
  lastSyncTime: string | null;
  dailyGoal: number;
  streakDays: number;
}

const initialState: StepState = {
  steps: 0,
  todaySteps: 0,
  weeklySteps: 0,
  loading: false,
  error: null,
  lastSyncTime: null,
  dailyGoal: 10000,
  streakDays: 0,
};

const stepSlice = createSlice({
  name: 'steps',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    updateSteps: (state, action: PayloadAction<number>) => {
      state.steps = action.payload;
      state.todaySteps = action.payload;
    },
    updateWeeklySteps: (state, action: PayloadAction<number>) => {
      state.weeklySteps = action.payload;
    },
    setDailyGoal: (state, action: PayloadAction<number>) => {
      state.dailyGoal = action.payload;
    },
    updateStreakDays: (state, action: PayloadAction<number>) => {
      state.streakDays = action.payload;
    },
    setSyncTime: (state, action: PayloadAction<string>) => {
      state.lastSyncTime = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetSteps: (state) => {
      state.steps = 0;
      state.todaySteps = 0;
    },
  },
});

export const {
  setLoading,
  updateSteps,
  updateWeeklySteps,
  setDailyGoal,
  updateStreakDays,
  setSyncTime,
  setError,
  clearError,
  resetSteps,
} = stepSlice.actions;

export default stepSlice.reducer; 