import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    IconButton,
    Stack,
    Paper,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    OutlinedInput,
    type SelectChangeEvent
} from '@mui/material';
import {
    Add,
    Delete,
    Edit,
    Save,
    Cancel
} from '@mui/icons-material';
import { nanoid } from '@reduxjs/toolkit';
import { type RecipeStep, type Ingredient } from '../types/recipe.types';

interface StepFormProps {
    steps: RecipeStep[];
    ingredients: Ingredient[];
    onChange: (steps: RecipeStep[]) => void;
}

export const StepForm: React.FC<StepFormProps> = ({
    steps,
    ingredients,
    onChange
}) => {
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'cooking' | 'instruction'>('instruction');
    const [durationMinutes, setDurationMinutes] = useState<number>(5);
    const [temperature, setTemperature] = useState<number>(100);
    const [speed, setSpeed] = useState<number>(3);
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const resetForm = () => {
        setDescription('');
        setType('instruction');
        setDurationMinutes(5);
        setTemperature(100);
        setSpeed(3);
        setSelectedIngredients([]);
        setEditingId(null);
    };

    const handleAdd = () => {
        if (!description.trim()) {
            alert('Step description is required');
            return;
        }
        if (durationMinutes <= 0 || !Number.isInteger(durationMinutes)) {
            alert('Duration must be a positive integer');
            return;
        }

        if (type === 'cooking') {
            if (temperature < 40 || temperature > 200) {
                alert('Temperature must be between 40-200°C');
                return;
            }
            if (speed < 1 || speed > 5) {
                alert('Speed must be between 1-5');
                return;
            }
        } else {
            if (selectedIngredients.length === 0) {
                alert('Instruction steps must have at least one ingredient');
                return;
            }
        }

        const newStep: RecipeStep = {
            id: nanoid(),
            description: description.trim(),
            type,
            durationMinutes,
            ...(type === 'cooking'
                ? { cookingSettings: { temperature, speed } }
                : { ingredientIds: selectedIngredients }
            )
        };

        onChange([...steps, newStep]);
        resetForm();
    };

    const handleEdit = (step: RecipeStep) => {
        setDescription(step.description);
        setType(step.type);
        setDurationMinutes(step.durationMinutes);

        if (step.type === 'cooking' && step.cookingSettings) {
            setTemperature(step.cookingSettings.temperature);
            setSpeed(step.cookingSettings.speed);
            setSelectedIngredients([]);
        } else if (step.type === 'instruction' && step.ingredientIds) {
            setSelectedIngredients(step.ingredientIds);
            setTemperature(100);
            setSpeed(3);
        }

        setEditingId(step.id);
    };

    const handleUpdate = () => {
        if (!description.trim()) {
            alert('Step description is required');
            return;
        }
        if (durationMinutes <= 0 || !Number.isInteger(durationMinutes)) {
            alert('Duration must be a positive integer');
            return;
        }

        if (type === 'cooking') {
            if (temperature < 40 || temperature > 200) {
                alert('Temperature must be between 40-200°C');
                return;
            }
            if (speed < 1 || speed > 5) {
                alert('Speed must be between 1-5');
                return;
            }
        } else {
            if (selectedIngredients.length === 0) {
                alert('Instruction steps must have at least one ingredient');
                return;
            }
        }

        const updated = steps.map(step =>
            step.id === editingId
                ? {
                    ...step,
                    description: description.trim(),
                    type,
                    durationMinutes,
                    ...(type === 'cooking'
                        ? {
                            cookingSettings: { temperature, speed },
                            ingredientIds: undefined
                        }
                        : {
                            ingredientIds: selectedIngredients,
                            cookingSettings: undefined
                        }
                    )
                }
                : step
        );

        onChange(updated);
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this step?')) {
            onChange(steps.filter(step => step.id !== id));
        }
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    const handleIngredientChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        setSelectedIngredients(typeof value === 'string' ? value.split(',') : value);
    };

    const getIngredientName = (id: string): string => {
        return ingredients.find(ing => ing.id === id)?.name || 'Unknown';
    };

    return (
        <Box>
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Stack spacing={2}>
                    <TextField
                        label="Step Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Describe what to do in this step..."
                    />

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Step Type</InputLabel>
                                <Select
                                    value={type}
                                    label="Step Type"
                                    onChange={(e) => setType(e.target.value as 'cooking' | 'instruction')}
                                >
                                    <MenuItem value="instruction">Instruction (Manual)</MenuItem>
                                    <MenuItem value="cooking">Cooking (Automated)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Duration (minutes)"
                                type="number"
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                                fullWidth
                                size="small"
                                inputProps={{ min: 1, step: 1 }}
                            />
                        </Grid>
                    </Grid>

                    {type === 'cooking' ? (
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Temperature (°C)"
                                    type="number"
                                    value={temperature}
                                    onChange={(e) => setTemperature(Number(e.target.value))}
                                    fullWidth
                                    size="small"
                                    inputProps={{ min: 40, max: 200 }}
                                    helperText="Range: 40-200°C"
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Speed"
                                    type="number"
                                    value={speed}
                                    onChange={(e) => setSpeed(Number(e.target.value))}
                                    fullWidth
                                    size="small"
                                    inputProps={{ min: 1, max: 5 }}
                                    helperText="Range: 1-5"
                                />
                            </Grid>
                        </Grid>
                    ) : (
                        <FormControl fullWidth size="small">
                            <InputLabel>Required Ingredients</InputLabel>
                            <Select
                                multiple
                                value={selectedIngredients}
                                onChange={handleIngredientChange}
                                input={<OutlinedInput label="Required Ingredients" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((id) => (
                                            <Chip key={id} label={getIngredientName(id)} size="small" />
                                        ))}
                                    </Box>
                                )}
                            >
                                {ingredients.length === 0 ? (
                                    <MenuItem disabled>No ingredients available</MenuItem>
                                ) : (
                                    ingredients.map((ingredient) => (
                                        <MenuItem key={ingredient.id} value={ingredient.id}>
                                            {ingredient.name} ({ingredient.quantity} {ingredient.unit})
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    )}

                    <Box>
                        {editingId ? (
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="contained"
                                    startIcon={<Save />}
                                    onClick={handleUpdate}
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Cancel />}
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </Button>
                            </Stack>
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleAdd}
                            >
                                Add Step
                            </Button>
                        )}
                    </Box>
                </Stack>
            </Paper>

            {steps.length === 0 ? (
                <Paper
                    variant="outlined"
                    sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}
                >
                    <Typography color="text.secondary">
                        No steps added yet. Add your first step above.
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {steps.map((step, index) => (
                        <Paper
                            key={step.id}
                            variant="outlined"
                            sx={{
                                p: 2,
                                bgcolor: editingId === step.id ? 'primary.50' : 'white',
                                border: editingId === step.id ? '2px solid' : '1px solid',
                                borderColor: editingId === step.id ? 'primary.main' : 'grey.300'
                            }}
                        >
                            <Stack direction="row" spacing={2}>
                                <Box sx={{ minWidth: '40px', pt: 0.5 }}>
                                    <Typography variant="h6" color="primary">
                                        {index + 1}
                                    </Typography>
                                </Box>

                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body1" fontWeight="medium" gutterBottom>
                                        {step.description}
                                    </Typography>

                                    <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                                        <Chip
                                            label={step.type === 'cooking' ? 'Cooking' : 'Instruction'}
                                            size="small"
                                            color={step.type === 'cooking' ? 'success' : 'info'}
                                        />
                                        <Chip
                                            label={`${step.durationMinutes} min`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Stack>

                                    {step.type === 'cooking' && step.cookingSettings && (
                                        <Typography variant="body2" color="text.secondary">
                                            🌡️ {step.cookingSettings.temperature}°C •
                                            ⚡ Speed {step.cookingSettings.speed}
                                        </Typography>
                                    )}

                                    {step.type === 'instruction' && step.ingredientIds && (
                                        <Typography variant="body2" color="text.secondary">
                                            📦 Ingredients: {step.ingredientIds.map(getIngredientName).join(', ')}
                                        </Typography>
                                    )}
                                </Box>

                                <Stack direction="row" spacing={1}>
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => handleEdit(step)}
                                        disabled={editingId !== null}
                                        aria-label="Edit step"
                                    >
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(step.id)}
                                        disabled={editingId !== null}
                                        aria-label="Delete step"
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}

            {steps.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Total: {steps.length} step{steps.length !== 1 ? 's' : ''} •
                    Duration: {steps.reduce((sum, s) => sum + s.durationMinutes, 0)} minutes
                </Typography>
            )}
        </Box>
    );
};
