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
        isSessionComplete: false  // NEW: Track completion explicitly
      };
    },

    setCurrentStep: (state, action: PayloadAction<{ recipeId: string; stepIndex: number; stepDurationSec: number }>) => {
      const { recipeId, stepIndex, stepDurationSec } = action.payload;
      const session = state.byRecipeId[recipeId];
      
      if (session) {
        session.currentStepIndex = stepIndex;
        session.stepRemainingSec = stepDurationSec;
        session.lastTickTs = Date.now();
        session.isSessionComplete = false;
      }
    },

    playSession: (state, action: PayloadAction<string>) => {
      const session = state.byRecipeId[action.payload];
      if (session && !session.isSessionComplete) {
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
      
      if (session && session.isRunning && !session.isSessionComplete) {
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
      
      if (session && !session.isSessionComplete) {
        session.currentStepIndex += 1;
        session.stepRemainingSec = nextStepDurationSec;
        session.isRunning = true;
        session.lastTickTs = Date.now();
      }
    },

    // CRITICAL FIX: Handles STOP button correctly
    stopCurrentStep: (state, action: PayloadAction<{ 
      recipeId: string;
      isLastStep: boolean;
      nextStepDurationSec?: number;
      totalRemainingAfterStop?: number;
    }>) => {
      const { 
        recipeId, 
        isLastStep, 
        nextStepDurationSec, 
        totalRemainingAfterStop 
      } = action.payload;
      
      const session = state.byRecipeId[recipeId];
      if (!session || session.isSessionComplete) return;
      
      session.isRunning = false;
      
      if (isLastStep) {
        // Last step STOP → Mark session as complete
        session.isSessionComplete = true;
        session.currentStepIndex += 1;  // Move past last index
        session.stepRemainingSec = 0;
        session.overallRemainingSec = 0;
      } else {
        // Not last step → Auto-advance immediately
        session.currentStepIndex += 1;
        session.stepRemainingSec = nextStepDurationSec || 0;
        session.overallRemainingSec = totalRemainingAfterStop || 0;
        session.isRunning = true;
        session.lastTickTs = Date.now();
      }
    },

    // CRITICAL FIX: Ends session completely
    completeSession: (state, action: PayloadAction<string>) => {
      const session = state.byRecipeId[action.payload];
      if (session) {
        session.isSessionComplete = true;
        session.isRunning = false;
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

export const {
  startSession,
  setCurrentStep,
  playSession,
  pauseSession,
  tickSession,
  nextStep,
  stopCurrentStep,
  completeSession,
  endSession
} = sessionSlice.actions;

export default sessionSlice.reducer;
