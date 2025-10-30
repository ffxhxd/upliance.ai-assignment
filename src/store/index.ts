import { configureStore } from '@reduxjs/toolkit';
import recipesReducer from './recipesSlice';
import sessionReducer from './sessionSlice';
import notificationReducer from './notificationSlice';
import { loadRecipes, saveRecipes } from '../utils/localStorage';

const preloadedState = {
  recipes: {
    recipes: loadRecipes()
  }
};

export const store = configureStore({
  reducer: {
    recipes: recipesReducer,
    session: sessionReducer,
    notifications: notificationReducer
  },
  preloadedState
});

store.subscribe(() => {
  const state = store.getState();
  saveRecipes(state.recipes.recipes);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
