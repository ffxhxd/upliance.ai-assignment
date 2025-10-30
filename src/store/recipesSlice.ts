import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Recipe, type RecipesState } from '../types/recipe.types';
import { nanoid } from '@reduxjs/toolkit';

const initialState: RecipesState = {
  recipes: []
};

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    addRecipe: (state, action: PayloadAction<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const now = new Date().toISOString();
      const newRecipe: Recipe = {
        ...action.payload,
        id: nanoid(),
        createdAt: now,
        updatedAt: now,
        isFavorite: false
      };
      state.recipes.push(newRecipe);
    },

    updateRecipe: (state, action: PayloadAction<Recipe>) => {
      const index = state.recipes.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.recipes[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
      }
    },

    deleteRecipe: (state, action: PayloadAction<string>) => {
      state.recipes = state.recipes.filter(r => r.id !== action.payload);
    },

    toggleFavorite: (state, action: PayloadAction<string>) => {
      const recipe = state.recipes.find(r => r.id === action.payload);
      if (recipe) {
        recipe.isFavorite = !recipe.isFavorite;
        recipe.updatedAt = new Date().toISOString();
      }
    }
  }
});

export const { addRecipe, updateRecipe, deleteRecipe, toggleFavorite } = recipesSlice.actions;
export default recipesSlice.reducer;
