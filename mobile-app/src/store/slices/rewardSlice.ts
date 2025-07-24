import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: string;
  type: string;
  availability: {
    quantity?: number;
    userLimit?: number;
  };
  metadata: {
    images: string[];
    instructions?: string;
  };
}

interface RewardRedemption {
  id: string;
  rewardId: string;
  cost: number;
  status: 'pending' | 'processing' | 'fulfilled' | 'cancelled';
  redeemedAt: Date;
  reward?: Partial<Reward>;
}

interface RewardState {
  rewards: Reward[];
  redemptions: RewardRedemption[];
  loading: boolean;
  error: string | null;
  selectedReward: Reward | null;
}

const initialState: RewardState = {
  rewards: [],
  redemptions: [],
  loading: false,
  error: null,
  selectedReward: null,
};

const rewardSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setRewards: (state, action: PayloadAction<Reward[]>) => {
      state.rewards = action.payload;
      state.loading = false;
    },
    addReward: (state, action: PayloadAction<Reward>) => {
      state.rewards.push(action.payload);
    },
    setRedemptions: (state, action: PayloadAction<RewardRedemption[]>) => {
      state.redemptions = action.payload;
    },
    addRedemption: (state, action: PayloadAction<RewardRedemption>) => {
      state.redemptions.unshift(action.payload);
    },
    setSelectedReward: (state, action: PayloadAction<Reward | null>) => {
      state.selectedReward = action.payload;
    },
    updateRedemptionStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const redemption = state.redemptions.find(r => r.id === action.payload.id);
      if (redemption) {
        redemption.status = action.payload.status as any;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearRewards: (state) => {
      state.rewards = [];
      state.redemptions = [];
      state.selectedReward = null;
    },
  },
});

export const {
  setLoading,
  setRewards,
  addReward,
  setRedemptions,
  addRedemption,
  setSelectedReward,
  updateRedemptionStatus,
  setError,
  clearError,
  clearRewards,
} = rewardSlice.actions;

export default rewardSlice.reducer;