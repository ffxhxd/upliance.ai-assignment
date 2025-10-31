import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  Chip,
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Star,
  StarBorder,
  Edit,
  Delete,
  PlayArrow,
  Restaurant,
  Schedule,
  Inventory,
} from '@mui/icons-material';
import FlatwareIcon from '@mui/icons-material/Flatware';
import {type Recipe } from '../types/recipe.types';
import { toggleFavorite, deleteRecipe } from '../store/recipesSlice';
import { addNotification } from '../store/notificationSlice';
import {type RootState } from '../store';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onEdit }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const activeRecipeId = useSelector((state: RootState) => state.session.activeRecipeId);
  const session = useSelector((state: RootState) => {
    if (!activeRecipeId) return null;
    return state.session.byRecipeId[activeRecipeId] || null;
  });

  const isCurrentlyActive = activeRecipeId === recipe.id && !session?.isSessionComplete;

  const totalMinutes = recipe.steps.reduce((sum, step) => sum + step.durationMinutes, 0);
  const handleFavoriteClick = () => {
    dispatch(toggleFavorite(recipe.id));
  };

  const handleDeleteClick = () => {
    if (isCurrentlyActive) {
      dispatch(addNotification({
        message: '⚠️ Cannot delete recipe while it\'s cooking',
        severity: 'warning',
        autoHideDuration: 2000
      }));
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    dispatch(deleteRecipe(recipe.id));
    setDeleteDialogOpen(false);
    dispatch(addNotification({
      message: '🗑️ Recipe deleted',
      severity: 'success',
      autoHideDuration: 2000
    }));
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleEditClick = () => {
    if (isCurrentlyActive) {
      dispatch(addNotification({
        message: '⚠️ Cannot edit recipe while it\'s cooking',
        severity: 'warning',
        autoHideDuration: 2000
      }));
      return;
    }
    onEdit(recipe);
  };

  const handleStartCooking = () => {
    if (isCurrentlyActive) {
      navigate(`/cook/${recipe.id}`);
      return;
    }

    if (activeRecipeId && activeRecipeId !== recipe.id) {
      dispatch(addNotification({
        message: `⚠️ Another recipe is already cooking. Please complete or pause it first.`,
        severity: 'warning',
        autoHideDuration: 4000
      }));
      return;
    }

    navigate(`/cook/${recipe.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          border: isCurrentlyActive ? '2px solid' : 'none',
          borderColor: 'primary.main',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6
          }
        }}
      >
        <Box sx={{ position: 'relative', p: 2, pb: 1 }}>
          <IconButton
            onClick={handleFavoriteClick}
            sx={{ position: 'absolute', top: 8, right: 8 }}
            aria-label={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {recipe.isFavorite ? (
              <Star sx={{ color: 'warning.main' }} />
            ) : (
              <StarBorder />
            )}
          </IconButton>

          <Typography variant="h6" component="h3" sx={{ pr: 5, mb: 1 }}>
            {recipe.title}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
            {recipe.cuisine && (
              <Chip
                icon={<Restaurant fontSize="small" />}
                label={recipe.cuisine}
                size="small"
                variant="outlined"
              />
            )}
            <Chip
              label={recipe.difficulty}
              size="small"
              color={getDifficultyColor(recipe.difficulty) as any}
            />
            <Chip
              icon={<Schedule fontSize="small" />}
              label={`${totalMinutes} min`}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Box>

        <CardContent sx={{ flexGrow: 1, pt: 1 }}>
          <Stack direction="row" spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Inventory fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {recipe.ingredients.length} ingredients
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {recipe.steps.length} steps
              </Typography>
            </Box>
          </Stack>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          {isCurrentlyActive ? (
            <Button
              variant="contained"
              color="error"
              startIcon={<FlatwareIcon />}
              onClick={handleStartCooking}
              fullWidth
              sx={{ mr: 1, animation: 'pulse 2s infinite' }}
            >
              Cooking in Progress
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              startIcon={<PlayArrow />}
              onClick={handleStartCooking}
              fullWidth
              sx={{ mr: 1 }}
              disabled={!!activeRecipeId}
            >
              Start Cooking
            </Button>
          )}

          <IconButton
            color="primary"
            onClick={handleEditClick}
            aria-label="Edit recipe"
            disabled={isCurrentlyActive}
          >
            <Edit />
          </IconButton>

          <IconButton
            color="error"
            onClick={handleDeleteClick}
            aria-label="Delete recipe"
            disabled={isCurrentlyActive}
          >
            <Delete />
          </IconButton>
        </CardActions>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Recipe?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{recipe.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
