import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CreditBalance {
  userId: string;
  totalCredits: number;
  availableCredits: number;
  pendingCredits: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  lastUpdated: Date;
}

interface CreditTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'spent' | 'bonus' | 'penalty';
  amount: number;
  source: string;
  description: string;
  createdAt: Date;
}

interface CreditState {
  balance: CreditBalance | null;
  transactions: CreditTransaction[];
  loading: boolean;
  error: string | null;
  conversionRate: number;
  lastConversionTime: string | null;
}

const initialState: CreditState = {
  balance: null,
  transactions: [],
  loading: false,
  error: null,
  conversionRate: 0.01, // 1 credit per 100 steps
  lastConversionTime: null,
};

const creditSlice = createSlice({
  name: 'credits',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    updateCredits: (state, action: PayloadAction<CreditBalance>) => {
      state.balance = action.payload;
    },
    addTransaction: (state, action: PayloadAction<CreditTransaction>) => {
      state.transactions.unshift(action.payload);
      // Keep only last 50 transactions in memory
      if (state.transactions.length > 50) {
        state.transactions = state.transactions.slice(0, 50);
      }
    },
    setTransactions: (state, action: PayloadAction<CreditTransaction[]>) => {
      state.transactions = action.payload;
    },
    setConversionRate: (state, action: PayloadAction<number>) => {
      state.conversionRate = action.payload;
    },
    setLastConversionTime: (state, action: PayloadAction<string>) => {
      state.lastConversionTime = action.payload;
    },
    incrementCredits: (state, action: PayloadAction<number>) => {
      if (state.balance) {
        state.balance.availableCredits += action.payload;
        state.balance.totalCredits += action.payload;
        state.balance.lifetimeEarned += action.payload;
      }
    },
    decrementCredits: (state, action: PayloadAction<number>) => {
      if (state.balance && state.balance.availableCredits >= action.payload) {
        state.balance.availableCredits -= action.payload;
        state.balance.lifetimeSpent += action.payload;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetCredits: (state) => {
      state.balance = null;
      state.transactions = [];
      state.lastConversionTime = null;
    },
  },
});

export const {
  setLoading,
  updateCredits,
  addTransaction,
  setTransactions,
  setConversionRate,
  setLastConversionTime,
  incrementCredits,
  decrementCredits,
  setError,
  clearError,
  resetCredits,
} = creditSlice.actions;

export default creditSlice.reducer; 