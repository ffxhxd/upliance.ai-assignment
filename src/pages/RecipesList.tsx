import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Typography,
    Button,
    Box,
    ToggleButtonGroup,
    ToggleButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Paper,
    Chip
} from '@mui/material';
import {
    Add,
    Favorite,
    ViewList
} from '@mui/icons-material';
import { type RootState } from '../store';
import { type Recipe } from '../types/recipe.types';
import { RecipeCard } from '../components/RecipeCard';

type FilterType = 'all' | 'favorites';
type SortType = 'recent' | 'oldest' | 'title' | 'duration';

export const RecipesList: React.FC = () => {
    const navigate = useNavigate();
    const recipes = useSelector((state: RootState) => state.recipes.recipes);

    const [filterType, setFilterType] = useState<FilterType>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortType>('recent');

    const handleCreateNew = () => {
        navigate('/create');
    };

    const handleEditRecipe = (recipe: Recipe) => {
        navigate('/create', { state: { recipe } });
    };

    let filteredRecipes = [...recipes];

    if (filterType === 'favorites') {
        filteredRecipes = filteredRecipes.filter(r => r.isFavorite);
    }

    if (difficultyFilter !== 'all') {
        filteredRecipes = filteredRecipes.filter(r => r.difficulty === difficultyFilter);
    }

    filteredRecipes.sort((a, b) => {
        switch (sortBy) {
            case 'recent':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'oldest':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'title':
                return a.title.localeCompare(b.title);
            case 'duration':
                const aDuration = a.steps.reduce((sum, step) => sum + step.durationMinutes, 0);
                const bDuration = b.steps.reduce((sum, step) => sum + step.durationMinutes, 0);
                return aDuration - bDuration;
            default:
                return 0;
        }
    });

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        My Recipes
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<Add />}
                        onClick={handleCreateNew}
                    >
                        Create Recipe
                    </Button>
                </Stack>

                <Typography variant="body1" color="text.secondary">
                    {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} saved
                </Typography>
            </Box>

            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                    <ToggleButtonGroup
                        value={filterType}
                        exclusive
                        onChange={(_, value) => value && setFilterType(value)}
                        size="small"
                    >
                        <ToggleButton value="all">
                            <ViewList sx={{ mr: 1 }} />
                            All Recipes
                        </ToggleButton>
                        <ToggleButton value="favorites">
                            <Favorite sx={{ mr: 1 }} />
                            Favorites
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Difficulty</InputLabel>
                        <Select
                            value={difficultyFilter}
                            label="Difficulty"
                            onChange={(e) => setDifficultyFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Levels</MenuItem>
                            <MenuItem value="Easy">Easy</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="Hard">Hard</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sortBy}
                            label="Sort By"
                            onChange={(e) => setSortBy(e.target.value as SortType)}
                        >
                            <MenuItem value="recent">Newest First</MenuItem>
                            <MenuItem value="oldest">Oldest First</MenuItem>
                            <MenuItem value="title">Title (A-Z)</MenuItem>
                            <MenuItem value="duration">Duration</MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{ ml: 'auto' }}>
                        <Chip
                            label={`${filteredRecipes.length} shown`}
                            color="primary"
                            variant="outlined"
                        />
                    </Box>
                </Stack>
            </Paper>

            {filteredRecipes.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        bgcolor: 'grey.50',
                        border: '2px dashed',
                        borderColor: 'grey.300'
                    }}
                >
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {filterType === 'favorites'
                            ? 'No favorite recipes yet'
                            : 'No recipes yet'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        {filterType === 'favorites'
                            ? 'Mark recipes as favorites to see them here'
                            : 'Create your first recipe to get started'}
                    </Typography>
                    {filterType === 'all' && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleCreateNew}
                        >
                            Create Your First Recipe
                        </Button>
                    )}
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredRecipes.map((recipe) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={recipe.id}>
                            <RecipeCard recipe={recipe} onEdit={handleEditRecipe} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};
