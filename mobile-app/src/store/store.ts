import { configureStore } from '@reduxjs/toolkit';
import stepSlice from './slices/stepSlice';
import creditSlice from './slices/creditSlice';
import userSlice from './slices/userSlice';
import rewardSlice from './slices/rewardSlice';

export const store = configureStore({
  reducer: {
    steps: stepSlice,
    credits: creditSlice,
    user: userSlice,
    rewards: rewardSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 