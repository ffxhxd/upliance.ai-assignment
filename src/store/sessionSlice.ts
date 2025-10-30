// src/store/sessionSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type SessionState } from '../types/recipe.types';
import { type RootState } from './index';

const initialState: SessionState = {
  activeRecipeId: null,
  byRecipeId: {}
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<{ recipeId: string; totalDurationSec: number }>) => {
      const { recipeId, totalDurationSec } = action.payload;
      
      state.activeRecipeId = recipeId;
      state.byRecipeId[recipeId] = {
        currentStepIndex: 0,
        isRunning: false,
        stepRemainingSec: 0,
        overallRemainingSec: totalDurationSec,
        lastTickTs: Date.now(),
        isCompleted: false
      };
    },

    setCurrentStep: (state, action: PayloadAction<{ recipeId: string; stepIndex: number; stepDurationSec: number }>) => {
      const { recipeId, stepIndex, stepDurationSec } = action.payload;
      const session = state.byRecipeId[recipeId];
      
      if (session) {
        session.currentStepIndex = stepIndex;
        session.stepRemainingSec = stepDurationSec;
        session.lastTickTs = Date.now();
        session.isCompleted = false;
      }
    },

    playSession: (state, action: PayloadAction<string>) => {
      const session = state.byRecipeId[action.payload];
      if (session && !session.isCompleted) {
        session.isRunning = true;
        session.lastTickTs = Date.now();
      }
    },

    pauseSession: (state, action: PayloadAction<string>) => {
      const session = state.byRecipeId[action.payload];
      if (session) {
        session.isRunning = false;
      }
    },

    tickSession: (state, action: PayloadAction<string>) => {
      const session = state.byRecipeId[action.payload];
      
      if (session && session.isRunning && !session.isCompleted) {
        const now = Date.now();
        const elapsed = Math.floor((now - (session.lastTickTs || now)) / 1000);
        
        if (elapsed >= 1) {
          session.stepRemainingSec = Math.max(0, session.stepRemainingSec - elapsed);
          session.overallRemainingSec = Math.max(0, session.overallRemainingSec - elapsed);
          session.lastTickTs = now;
        }
      }
    },

    nextStep: (state, action: PayloadAction<{ recipeId: string; nextStepDurationSec: number }>) => {
      const { recipeId, nextStepDurationSec } = action.payload;
      const session = state.byRecipeId[recipeId];
      
      if (session && !session.isCompleted) {
        session.currentStepIndex += 1;
        session.stepRemainingSec = nextStepDurationSec;
        session.lastTickTs = Date.now();
      }
    },

    markSessionComplete: (state, action: PayloadAction<string>) => {
      const session = state.byRecipeId[action.payload];
      if (session) {
        session.isRunning = false;
        session.isCompleted = true;
      }
    },

    endSession: (state, action: PayloadAction<string>) => {
      const recipeId = action.payload;
      delete state.byRecipeId[recipeId];
      if (state.activeRecipeId === recipeId) {
        state.activeRecipeId = null;
      }
    }
  }
});

export const selectActiveSession = (state: RootState) => {
  const { activeRecipeId, byRecipeId } = state.session;
  return activeRecipeId ? byRecipeId[activeRecipeId] : null;
};

export const selectSessionByRecipeId = (recipeId: string) => (state: RootState) => {
  return state.session.byRecipeId[recipeId];
};

export const {
  startSession,
  setCurrentStep,
  playSession,
  pauseSession,
  tickSession,
  nextStep,
  markSessionComplete,
  endSession
} = sessionSlice.actions;

export default sessionSlice.reducer;
