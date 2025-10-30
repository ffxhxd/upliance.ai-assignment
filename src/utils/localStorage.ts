import { type Recipe } from '../types/recipe.types';

const STORAGE_KEY = 'upliance_recipes';

export const saveRecipes = (recipes: Recipe[]): void => {
  try {
    const serialized = JSON.stringify(recipes);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save recipes to localStorage:', error);
  }
};

export const loadRecipes = (): Recipe[] => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    
    if (serialized === null) {
      return [];
    }
    
    const parsed = JSON.parse(serialized);
    
    if (!Array.isArray(parsed)) {
      console.warn('Invalid recipes data in localStorage, resetting to empty array');
      return [];
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load recipes from localStorage:', error);
    return [];
  }
};

export const clearRecipes = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear recipes from localStorage:', error);
  }
};
