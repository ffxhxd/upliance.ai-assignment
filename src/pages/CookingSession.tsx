import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Stack,
  IconButton,
  LinearProgress,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  Close,
  CheckCircle,
  Schedule,
  Thermostat,
  Speed,
  Refresh
} from '@mui/icons-material';
import { type RootState } from '../store';
import {
  startSession,
  setCurrentStep,
  playSession,
  pauseSession,
  nextStep,
  endSession,
  markSessionComplete,
  selectActiveSession
} from '../store/sessionSlice';
import { addNotification } from '../store/notificationSlice';
import { useTimer } from '../hooks/useTimer';
import { CookingTimeline } from '../components/CookingTimeline';

export const CookingSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const recipe = useSelector((state: RootState) => 
    state.recipes.recipes.find(r => r.id === id)
  );

  const session = useSelector(selectActiveSession);
  const activeRecipeId = useSelector((state: RootState) => state.session.activeRecipeId);

  useTimer(activeRecipeId, session?.isRunning || false);

  // Redirect if trying to access different recipe while another is active
  useEffect(() => {
    if (activeRecipeId && activeRecipeId !== id && session && !session.isCompleted) {
      dispatch(addNotification({
        message: `⚠️ Another recipe is already cooking. Redirecting...`,
        severity: 'warning',
        autoHideDuration: 3000
      }));
      setTimeout(() => {
        navigate(`/cook/${activeRecipeId}`);
      }, 1500);
    }
  }, [activeRecipeId, id, session, navigate, dispatch]);

  // Initialize session on mount
  useEffect(() => {
    if (!recipe) return;

    if (activeRecipeId !== recipe.id) {
      const totalDurationSec = recipe.steps.reduce(
        (sum, step) => sum + step.durationMinutes * 60,
        0
      );

      dispatch(startSession({ recipeId: recipe.id, totalDurationSec }));
      
      if (recipe.steps.length > 0) {
        dispatch(setCurrentStep({
          recipeId: recipe.id,
          stepIndex: 0,
          stepDurationSec: recipe.steps[0].durationMinutes * 60
        }));
        
        setTimeout(() => {
          dispatch(playSession(recipe.id));
          dispatch(addNotification({
            message: '🎯 Cooking started! Follow the steps below.',
            severity: 'info',
            autoHideDuration: 3000
          }));
        }, 300);
      }
    }
  }, [recipe, activeRecipeId, dispatch]);

  // Auto-advance to next step when timer reaches 0
  useEffect(() => {
    if (!session || !recipe || session.isCompleted) return;

    if (session.stepRemainingSec === 0 && session.isRunning) {
      const nextIndex = session.currentStepIndex + 1;

      if (nextIndex < recipe.steps.length) {
        dispatch(addNotification({
          message: `✅ Step ${session.currentStepIndex + 1} completed! Moving to step ${nextIndex + 1}...`,
          severity: 'success',
          autoHideDuration: 4000
        }));

        dispatch(pauseSession(recipe.id));
        
        setTimeout(() => {
          dispatch(nextStep({
            recipeId: recipe.id,
            nextStepDurationSec: recipe.steps[nextIndex].durationMinutes * 60
          }));
          dispatch(playSession(recipe.id));
        }, 500);
      } else {
        // Mark as completed
        dispatch(markSessionComplete(recipe.id));
        dispatch(addNotification({
          message: '🎉 All steps completed! Your dish is ready to serve!',
          severity: 'success',
          autoHideDuration: 5000
        }));
      }
    }
  }, [session?.stepRemainingSec, session?.isRunning, session?.currentStepIndex, session?.isCompleted, recipe, dispatch]);

  if (!recipe) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Recipe not found. Please return to the recipes list.
        </Alert>
        <Button onClick={() => navigate('/recipes')} sx={{ mt: 2 }}>
          Back to Recipes
        </Button>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading session...</Typography>
      </Container>
    );
  }

  const currentStep = recipe.steps[session.currentStepIndex];
  const isLastStep = session.currentStepIndex === recipe.steps.length - 1;
  const allStepsComplete = session.isCompleted || session.currentStepIndex >= recipe.steps.length;

  const handlePlayPause = () => {
    if (session.isRunning) {
      dispatch(pauseSession(recipe.id));
      dispatch(addNotification({
        message: '⏸️ Cooking paused',
        severity: 'warning',
        autoHideDuration: 2000
      }));
    } else {
      dispatch(playSession(recipe.id));
      dispatch(addNotification({
        message: '▶️ Cooking resumed',
        severity: 'info',
        autoHideDuration: 2000
      }));
    }
  };

  const handleNext = () => {
    const nextIndex = session.currentStepIndex + 1;
    if (nextIndex < recipe.steps.length) {
      dispatch(addNotification({
        message: `⏭️ Skipped to step ${nextIndex + 1}`,
        severity: 'info',
        autoHideDuration: 2000
      }));
      
      dispatch(nextStep({
        recipeId: recipe.id,
        nextStepDurationSec: recipe.steps[nextIndex].durationMinutes * 60
      }));
    }
  };

  const handleCloseSession = () => {
    dispatch(pauseSession(recipe.id));
    dispatch(addNotification({
      message: '⏸️ Cooking paused - Resume anytime from the recipes list',
      severity: 'info',
      autoHideDuration: 2500
    }));
    setTimeout(() => {
      navigate('/recipes');
    }, 500);
  };

  const handleRestartCookingFromCompletion = () => {
    dispatch(endSession(recipe.id));
    
    setTimeout(() => {
      const totalDurationSec = recipe.steps.reduce(
        (sum, step) => sum + step.durationMinutes * 60,
        0
      );

      dispatch(startSession({ recipeId: recipe.id, totalDurationSec }));
      
      if (recipe.steps.length > 0) {
        dispatch(setCurrentStep({
          recipeId: recipe.id,
          stepIndex: 0,
          stepDurationSec: recipe.steps[0].durationMinutes * 60
        }));
        
        setTimeout(() => {
          dispatch(playSession(recipe.id));
          dispatch(addNotification({
            message: '🔄 Cooking restarted from the beginning!',
            severity: 'info',
            autoHideDuration: 3000
          }));
        }, 300);
      }
    }, 100);
  };

  const handleCompleteAndEnd = () => {
    dispatch(pauseSession(recipe.id));
    navigate('/recipes');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSteps = recipe.steps.length;
  const completedSteps = allStepsComplete ? totalSteps : session.currentStepIndex + (session.stepRemainingSec === 0 ? 1 : 0);
  const progressPercent = (completedSteps / totalSteps) * 100;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="bold">
            {recipe.title}
          </Typography>
          <IconButton 
            onClick={handleCloseSession} 
            color="default"
            aria-label="Minimize session"
            title="Pause and return to recipes list"
          >
            <Close />
          </IconButton>
        </Stack>

        <Box mb={2}>
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Step {Math.min(completedSteps, totalSteps)} of {totalSteps}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(progressPercent)}% Complete
            </Typography>
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={progressPercent} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {!allStepsComplete && (
          <Chip
            icon={<Schedule />}
            label={`${formatTime(session.overallRemainingSec)} remaining`}
            color="primary"
            variant="outlined"
          />
        )}
      </Paper>

      {allStepsComplete ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', bgcolor: 'success.50' }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Cooking Complete!
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Your {recipe.title} is ready to serve. Enjoy your meal!
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<Refresh />}
              onClick={handleRestartCookingFromCompletion}
            >
              Cook Again
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleCompleteAndEnd}
            >
              Back to Recipes
            </Button>
          </Stack>
        </Paper>
      ) : (
        <>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Stack spacing={2}>
              <Box>
                <Chip
                  label={currentStep.type === 'cooking' ? 'Cooking Step' : 'Instruction Step'}
                  color={currentStep.type === 'cooking' ? 'success' : 'info'}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="h6" fontWeight="bold">
                  Step {session.currentStepIndex + 1}
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                {currentStep.description}
              </Typography>

              <Divider />

              {currentStep.type === 'cooking' && currentStep.cookingSettings && (
                <Stack direction="row" spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Thermostat color="error" />
                    <Typography variant="body2">
                      {currentStep.cookingSettings.temperature}°C
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Speed color="primary" />
                    <Typography variant="body2">
                      Speed {currentStep.cookingSettings.speed}
                    </Typography>
                  </Box>
                </Stack>
              )}

              {currentStep.type === 'instruction' && currentStep.ingredientIds && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Required Ingredients:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {currentStep.ingredientIds.map(ingId => {
                      const ingredient = recipe.ingredients.find(i => i.id === ingId);
                      return ingredient ? (
                        <Chip
                          key={ingId}
                          label={`${ingredient.name} (${ingredient.quantity} ${ingredient.unit})`}
                          size="small"
                          variant="outlined"
                        />
                      ) : null;
                    })}
                  </Stack>
                </Box>
              )}

              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography 
                  variant="h2" 
                  fontWeight="bold"
                  color={session.stepRemainingSec < 60 ? 'error.main' : 'primary.main'}
                >
                  {formatTime(session.stepRemainingSec)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Time Remaining
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} justifyContent="center">
                <IconButton
                  onClick={handlePlayPause}
                  color="primary"
                  size="large"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    width: 64,
                    height: 64
                  }}
                  aria-label={session.isRunning ? 'Pause' : 'Play'}
                >
                  {session.isRunning ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
                </IconButton>

                {!isLastStep && (
                  <Button
                    variant="outlined"
                    startIcon={<SkipNext />}
                    onClick={handleNext}
                    size="large"
                  >
                    Skip to Next Step
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>

          <CookingTimeline
            steps={recipe.steps}
            currentStepIndex={session.currentStepIndex}
            ingredients={recipe.ingredients}
          />
        </>
      )}
    </Container>
  );
};
