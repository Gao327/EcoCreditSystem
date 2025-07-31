import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

interface User {
  id: number;
  username: string;
  email: string;
  isGuest: boolean;
  lastLogin: string;
  profile?: UserProfile;
  credits?: {
    availableCredits: number;
    lifetimeEarned: number;
    lifetimeSpent: number;
  };
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user && state.user.profile) {
        state.user.profile = { ...state.user.profile, ...action.payload };
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setUser,
  updateUser,
  updateProfile,
  setError,
  clearError,
  logout,
} = userSlice.actions;

export default userSlice.reducer;