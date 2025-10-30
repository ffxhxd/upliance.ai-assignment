export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface CookSettings {
  temperature: number;
  speed: number;
}

export interface RecipeStep {
  id: string;
  description: string;
  type: 'cooking' | 'instruction';
  durationMinutes: number;
  cookingSettings?: CookSettings;
  ingredientIds?: string[];
}

export interface Recipe {
  id: string;
  title: string;
  cuisine?: string;
  difficulty: Difficulty;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionState {
  activeRecipeId: string | null;
  byRecipeId: Record<string, {
    currentStepIndex: number;
    isRunning: boolean;
    stepRemainingSec: number;
    overallRemainingSec: number;
    lastTickTs?: number;
    isCompleted?: boolean;
  }>;
}

export interface RecipesState {
  recipes: Recipe[];
}
