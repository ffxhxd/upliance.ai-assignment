import React, { useEffect, useRef } from 'react';
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
  Divider,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Close,
  Schedule,
  Thermostat,
  Speed
} from '@mui/icons-material';
import { type RootState } from '../store';
import {
  startSession,
  setCurrentStep,
  playSession,
  pauseSession,
  stopCurrentStep,
  nextStep,
  completeSession,
  endSession,
  selectActiveSession
} from '../store/sessionSlice';
import { addNotification } from '../store/notificationSlice';
import { useTimer } from '../hooks/useTimer';
import { CookingTimeline } from '../components/CookingTimeline';

export const CookingSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Prevent double-click issues
  const isProcessingStopRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const hasAutoAdvancedRef = useRef(false);  // NEW: Prevent double auto-advance

  const recipe = useSelector((state: RootState) => 
    state.recipes.recipes.find(r => r.id === id)
  );

  const session = useSelector(selectActiveSession);
  const activeRecipeId = useSelector((state: RootState) => state.session.activeRecipeId);

  useTimer(activeRecipeId, session?.isRunning || false);

  // Redirect if different recipe is cooking
  useEffect(() => {
    if (activeRecipeId && activeRecipeId !== id && session) {
      dispatch(addNotification({
        message: `⚠️ Another recipe is cooking. Redirecting...`,
        severity: 'warning',
        autoHideDuration: 3000
      }));
      setTimeout(() => {
        navigate(`/cook/${activeRecipeId}`);
      }, 1500);
    }
  }, [activeRecipeId, id, session, navigate, dispatch]);

  // Initialize session ONCE - CRITICAL FIX
  useEffect(() => {
    if (!recipe || hasInitializedRef.current) return;
    
    hasInitializedRef.current = true;

    const isFirstTime = !session || activeRecipeId !== recipe.id;

    if (isFirstTime) {
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
      }
    }
  }, [recipe?.id, dispatch]);

  // CRITICAL FIX: Auto-play IMMEDIATELY after init
  useEffect(() => {
    if (!session || !recipe) return;

    // Only play if initialized but not running yet
    if (!session.isRunning && session.currentStepIndex === 0 && session.stepRemainingSec > 0) {
      dispatch(playSession(recipe.id));
      dispatch(addNotification({
        message: '🎯 Cooking started!',
        severity: 'info',
        autoHideDuration: 3000
      }));
    }
  }, [session?.currentStepIndex, recipe?.id, dispatch]);

  // CRITICAL FIX: Auto-advance on natural step completion - SEPARATE effect
  useEffect(() => {
    if (!session || !recipe || session.isSessionComplete || isProcessingStopRef.current) return;

    // Only auto-advance once per step completion
    if (session.stepRemainingSec === 0 && session.isRunning && !hasAutoAdvancedRef.current) {
      hasAutoAdvancedRef.current = true;

      const nextIndex = session.currentStepIndex + 1;

      if (nextIndex < recipe.steps.length) {
        // More steps remain - auto-advance
        dispatch(nextStep({
          recipeId: recipe.id,
          nextStepDurationSec: recipe.steps[nextIndex].durationMinutes * 60
        }));
        
        dispatch(addNotification({
          message: `✅ Step ${session.currentStepIndex + 1} completed!`,
          severity: 'success',
          autoHideDuration: 2000
        }));

        // Reset for next step
        setTimeout(() => {
          hasAutoAdvancedRef.current = false;
        }, 100);
      } else {
        // Final step naturally completed - session ends
        dispatch(completeSession(recipe.id));
        dispatch(addNotification({
          message: '🎉 Recipe complete!',
          severity: 'success',
          autoHideDuration: 4000
        }));
      }
    }

    // Reset flag if timer is still running (hasn't reached 0 yet)
    if (session.stepRemainingSec > 0) {
      hasAutoAdvancedRef.current = false;
    }
  }, [session?.stepRemainingSec, session?.isRunning, session?.currentStepIndex, session?.isSessionComplete, recipe, dispatch]);

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
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  const totalSteps = recipe.steps.length;
  const isSessionComplete = session.isSessionComplete === true;
  
  // CRITICAL: Safety check - don't access step if session complete
  const currentStep = !isSessionComplete && session.currentStepIndex < totalSteps 
    ? recipe.steps[session.currentStepIndex] 
    : null;

  const totalDurationSec = recipe.steps.reduce((sum, s) => sum + s.durationMinutes * 60, 0);
  
  // Calculate per-step progress (only if current step exists)
  const stepDurationSec = (currentStep?.durationMinutes ?? 0) * 60;
  const stepElapsedSec = stepDurationSec > 0 
    ? Math.max(0, stepDurationSec - session.stepRemainingSec) 
    : 0;
  const stepProgressPercent = stepDurationSec > 0 
    ? Math.round((stepElapsedSec / stepDurationSec) * 100) 
    : 0;

  // Calculate overall progress
  const overallElapsedSec = totalDurationSec - session.overallRemainingSec;
  const overallProgressPercent = totalDurationSec > 0
    ? Math.round((overallElapsedSec / totalDurationSec) * 100) 
    : 100;

  const handlePlayPause = () => {
    if (isSessionComplete) return;
    
    if (session.isRunning) {
      dispatch(pauseSession(recipe.id));
      dispatch(addNotification({
        message: '⏸️ Paused',
        severity: 'info',
        autoHideDuration: 1500
      }));
    } else {
      dispatch(playSession(recipe.id));
      dispatch(addNotification({
        message: '▶️ Resumed',
        severity: 'info',
        autoHideDuration: 1500
      }));
    }
  };

  const handleStop = () => {
    // GUARD: Prevent multiple stops
    if (isProcessingStopRef.current || isSessionComplete) return;
    isProcessingStopRef.current = true;

    try {
      const isLastStep = session.currentStepIndex >= totalSteps - 1;

      if (isLastStep) {
        // Last step - STOP ends session
        dispatch(stopCurrentStep({
          recipeId: recipe.id,
          isLastStep: true
        }));

        dispatch(addNotification({
          message: `🛑 Final step ended. Recipe complete!`,
          severity: 'success',
          autoHideDuration: 3000
        }));
      } else {
        // Not last step - STOP and auto-advance
        const nextIndex = session.currentStepIndex + 1;
        const nextStepDurationSec = recipe.steps[nextIndex].durationMinutes * 60;
        
        const remainingAfterNextStep = recipe.steps
          .slice(nextIndex + 1)
          .reduce((sum, s) => sum + s.durationMinutes * 60, 0);
        
        const totalRemainingAfterStop = nextStepDurationSec + remainingAfterNextStep;

        dispatch(stopCurrentStep({
          recipeId: recipe.id,
          isLastStep: false,
          nextStepDurationSec,
          totalRemainingAfterStop
        }));

        dispatch(addNotification({
          message: `⏭️ Step ${session.currentStepIndex + 1} ended. Starting step ${nextIndex + 1}...`,
          severity: 'info',
          autoHideDuration: 2000
        }));
      }
    } finally {
      // Reset guard after 500ms
      setTimeout(() => {
        isProcessingStopRef.current = false;
      }, 500);
    }
  };

  const handleClose = () => {
    navigate('/recipes');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="bold">
            {recipe.title}
          </Typography>
          <IconButton onClick={handleClose} color="default" aria-label="Close">
            <Close />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1} mb={2}>
          <Chip
            label={recipe.difficulty}
            color={
              recipe.difficulty === 'Easy' ? 'success' :
              recipe.difficulty === 'Medium' ? 'warning' : 'error'
            }
            size="small"
          />
          <Chip
            icon={<Schedule />}
            label={`${Math.ceil(totalDurationSec / 60)} min`}
            size="small"
            variant="outlined"
          />
        </Stack>

        {/* Overall Progress */}
        <Box mb={2}>
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Overall: {formatTime(session.overallRemainingSec)} remaining
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {overallProgressPercent}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.min(overallProgressPercent, 100)}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </Paper>

      {/* Completion Screen */}
      {isSessionComplete ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', bgcolor: 'success.50' }}>
          <Typography variant="h4" fontWeight="bold" mb={2}>
            ✅ Recipe Complete!
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            {recipe.title} is ready! All steps completed.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              dispatch(endSession(recipe.id));
              navigate('/recipes');
            }}
          >
            Back to Recipes
          </Button>
        </Paper>
      ) : currentStep ? (
        // Active cooking step
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Stack spacing={2}>
            {/* Step Header */}
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Step {session.currentStepIndex + 1} of {totalSteps}
              </Typography>
              <Typography variant="body1">{currentStep.description}</Typography>
            </Box>

            <Divider />

            {/* Per-Step Circular Progress */}
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ position: 'relative', width: 180, height: 180, mx: 'auto', mb: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={stepProgressPercent}
                  size={180}
                  thickness={4}
                  sx={{
                    color: session.stepRemainingSec < 60 ? '#f44336' : '#1976d2'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="h4" fontWeight="bold">
                    {formatTime(session.stepRemainingSec)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stepProgressPercent}%
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Context Chips */}
            {currentStep.type === 'cooking' && currentStep.cookingSettings && (
              <Stack direction="row" spacing={2} sx={{ bgcolor: 'info.50', p: 2, borderRadius: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Thermostat color="error" />
                  <Typography variant="body2">
                    {currentStep.cookingSettings.temperature}°C
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Speed color="primary" />
                  <Typography variant="body2">
                    Speed {currentStep.cookingSettings.speed}
                  </Typography>
                </Stack>
              </Stack>
            )}

            {currentStep.type === 'instruction' && currentStep.ingredientIds && (
              <Box sx={{ bgcolor: 'success.50', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight="bold" mb={1}>
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

            {/* Controls */}
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

              <Button
                variant="contained"
                color="error"
                startIcon={<Stop />}
                size="large"
                onClick={handleStop}
                disabled={isProcessingStopRef.current}
              >
                STOP
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      {/* Timeline */}
      {!isSessionComplete && currentStep && (
        <CookingTimeline
          steps={recipe.steps}
          currentStepIndex={session.currentStepIndex}
          ingredients={recipe.ingredients}
        />
      )}
    </Container>
  );
};
