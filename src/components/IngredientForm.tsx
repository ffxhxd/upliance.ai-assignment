import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    IconButton,
    Stack,
    Paper,
    Typography,
    Grid
} from '@mui/material';
import {
    Add,
    Delete,
    Edit,
    Save,
    Cancel
} from '@mui/icons-material';
import { nanoid } from '@reduxjs/toolkit';
import { type Ingredient } from '../types/recipe.types';

interface IngredientFormProps {
    ingredients: Ingredient[];
    onChange: (ingredients: Ingredient[]) => void;
}

export const IngredientForm: React.FC<IngredientFormProps> = ({
    ingredients,
    onChange
}) => {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState<number>(1);
    const [unit, setUnit] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const resetForm = () => {
        setName('');
        setQuantity(1);
        setUnit('');
        setEditingId(null);
    };

    const handleAdd = () => {
        if (!name.trim() || !unit.trim() || quantity <= 0) {
            alert('Please fill all fields with valid values');
            return;
        }

        const newIngredient: Ingredient = {
            id: nanoid(),
            name: name.trim(),
            quantity,
            unit: unit.trim()
        };

        onChange([...ingredients, newIngredient]);
        resetForm();
    };

    const handleEdit = (ingredient: Ingredient) => {
        setName(ingredient.name);
        setQuantity(ingredient.quantity);
        setUnit(ingredient.unit);
        setEditingId(ingredient.id);
    };

    const handleUpdate = () => {
        if (!name.trim() || !unit.trim() || quantity <= 0) {
            alert('Please fill all fields with valid values');
            return;
        }

        const updated = ingredients.map(ing =>
            ing.id === editingId
                ? { ...ing, name: name.trim(), quantity, unit: unit.trim() }
                : ing
        );

        onChange(updated);
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this ingredient?')) {
            onChange(ingredients.filter(ing => ing.id !== id));
        }
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    return (
        <Box>
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                            label="Ingredient Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            size="small"
                            placeholder="e.g., Tomatoes"
                        />
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                            label="Quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            fullWidth
                            size="small"
                            inputProps={{ min: 0.01, step: 0.1 }}
                        />
                    </Grid>

                    <Grid size={{ xs: 6, sm: 2 }}>
                        <TextField
                            label="Unit"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            fullWidth
                            size="small"
                            placeholder="g, ml, pcs"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }}>
                        {editingId ? (
                            <Stack direction="row" spacing={1}>
                                <IconButton
                                    color="primary"
                                    onClick={handleUpdate}
                                    aria-label="Save changes"
                                >
                                    <Save />
                                </IconButton>
                                <IconButton
                                    color="default"
                                    onClick={handleCancelEdit}
                                    aria-label="Cancel edit"
                                >
                                    <Cancel />
                                </IconButton>
                            </Stack>
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleAdd}
                                fullWidth
                            >
                                Add
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            {ingredients.length === 0 ? (
                <Paper
                    variant="outlined"
                    sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}
                >
                    <Typography color="text.secondary">
                        No ingredients added yet. Add your first ingredient above.
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={1}>
                    {ingredients.map((ingredient, index) => (
                        <Paper
                            key={ingredient.id}
                            variant="outlined"
                            sx={{
                                p: 2,
                                bgcolor: editingId === ingredient.id ? 'primary.50' : 'white',
                                border: editingId === ingredient.id ? '2px solid' : '1px solid',
                                borderColor: editingId === ingredient.id ? 'primary.main' : 'grey.300'
                            }}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Box>
                                    <Typography variant="body1" fontWeight="medium">
                                        {index + 1}. {ingredient.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {ingredient.quantity} {ingredient.unit}
                                    </Typography>
                                </Box>

                                <Stack direction="row" spacing={1}>
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => handleEdit(ingredient)}
                                        disabled={editingId !== null}
                                        aria-label="Edit ingredient"
                                    >
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(ingredient.id)}
                                        disabled={editingId !== null}
                                        aria-label="Delete ingredient"
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}

            {ingredients.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Total: {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
                </Typography>
            )}
        </Box>
    );
};
