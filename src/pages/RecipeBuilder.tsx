import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Alert
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { nanoid } from '@reduxjs/toolkit';
import { addRecipe, updateRecipe } from '../store/recipesSlice';
import { type Recipe, type Difficulty, type Ingredient, type RecipeStep } from '../types/recipe.types';
import { IngredientForm } from '../components/IngredientForm';
import { StepForm } from '../components/StepForm';

export const RecipeBuilder: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const editingRecipe = location.state?.recipe as Recipe | undefined;
    const isEditMode = !!editingRecipe;

    const [title, setTitle] = useState(editingRecipe?.title || '');
    const [cuisine, setCuisine] = useState(editingRecipe?.cuisine || '');
    const [difficulty, setDifficulty] = useState<Difficulty>(editingRecipe?.difficulty || 'Easy');
    const [ingredients, setIngredients] = useState<Ingredient[]>(editingRecipe?.ingredients || []);
    const [steps, setSteps] = useState<RecipeStep[]>(editingRecipe?.steps || []);

    const [errors, setErrors] = useState<string[]>([]);

    const validateForm = (): boolean => {
        const newErrors: string[] = [];

        if (!title.trim()) {
            newErrors.push('Recipe title is required');
        }

        if (ingredients.length === 0) {
            newErrors.push('At least one ingredient is required');
        }

        ingredients.forEach((ing, index) => {
            if (!ing.name.trim()) {
                newErrors.push(`Ingredient ${index + 1}: Name is required`);
            }
            if (ing.quantity <= 0) {
                newErrors.push(`Ingredient ${index + 1}: Quantity must be greater than 0`);
            }
            if (!ing.unit.trim()) {
                newErrors.push(`Ingredient ${index + 1}: Unit is required`);
            }
        });

        if (steps.length === 0) {
            newErrors.push('At least one step is required');
        }

        steps.forEach((step, index) => {
            if (!step.description.trim()) {
                newErrors.push(`Step ${index + 1}: Description is required`);
            }
            if (step.durationMinutes <= 0 || !Number.isInteger(step.durationMinutes)) {
                newErrors.push(`Step ${index + 1}: Duration must be a positive integer`);
            }

            if (step.type === 'cooking') {
                if (!step.cookingSettings) {
                    newErrors.push(`Step ${index + 1}: Cooking settings are required for cooking steps`);
                } else {
                    if (step.cookingSettings.temperature < 40 || step.cookingSettings.temperature > 200) {
                        newErrors.push(`Step ${index + 1}: Temperature must be between 40-200°C`);
                    }
                    if (step.cookingSettings.speed < 1 || step.cookingSettings.speed > 5) {
                        newErrors.push(`Step ${index + 1}: Speed must be between 1-5`);
                    }
                }
                if (step.ingredientIds && step.ingredientIds.length > 0) {
                    newErrors.push(`Step ${index + 1}: Cooking steps cannot have ingredientIds`);
                }
            }

            if (step.type === 'instruction') {
                if (!step.ingredientIds || step.ingredientIds.length === 0) {
                    newErrors.push(`Step ${index + 1}: Instruction steps must have at least one ingredient`);
                }
                if (step.cookingSettings) {
                    newErrors.push(`Step ${index + 1}: Instruction steps cannot have cooking settings`);
                }
            }
        });

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSave = () => {
        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const recipeData: Recipe = {
            id: editingRecipe?.id || nanoid(),
            title: title.trim(),
            cuisine: cuisine.trim() || undefined,
            difficulty,
            ingredients,
            steps,
            isFavorite: editingRecipe?.isFavorite || false,
            createdAt: editingRecipe?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (isEditMode) {
            dispatch(updateRecipe(recipeData));
        } else {
            dispatch(addRecipe(recipeData));
        }

        navigate('/recipes');
    };

    const handleCancel = () => {
        navigate('/recipes');
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={2} sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" mb={3}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={handleCancel}
                        sx={{ mr: 2 }}
                    >
                        Back
                    </Button>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        {isEditMode ? 'Edit Recipe' : 'Create New Recipe'}
                    </Typography>
                </Stack>

                {errors.length > 0 && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrors([])}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                            Please fix the following errors:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </Alert>
                )}

                <Stack spacing={3} mb={4}>
                    <TextField
                        label="Recipe Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        fullWidth
                        placeholder="e.g., Creamy Tomato Pasta"
                    />

                    <TextField
                        label="Cuisine"
                        value={cuisine}
                        onChange={(e) => setCuisine(e.target.value)}
                        fullWidth
                        placeholder="e.g., Italian, Indian, Mexican"
                    />

                    <FormControl fullWidth required>
                        <InputLabel>Difficulty</InputLabel>
                        <Select
                            value={difficulty}
                            label="Difficulty"
                            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                        >
                            <MenuItem value="Easy">Easy</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="Hard">Hard</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                <Divider sx={{ my: 4 }} />

                <Box mb={4}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                        Ingredients
                    </Typography>
                    <IngredientForm
                        ingredients={ingredients}
                        onChange={setIngredients}
                    />
                </Box>

                <Divider sx={{ my: 4 }} />

                <Box mb={4}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                        Cooking Steps
                    </Typography>
                    <StepForm
                        steps={steps}
                        ingredients={ingredients}
                        onChange={setSteps}
                    />
                </Box>

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<Save />}
                        onClick={handleSave}
                    >
                        {isEditMode ? 'Update Recipe' : 'Save Recipe'}
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
};
