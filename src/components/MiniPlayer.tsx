import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Stack,
  Slide
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  OpenInFull
} from '@mui/icons-material';
import { type RootState } from '../store';
import {
  playSession,
  pauseSession,
  stopCurrentStep,
  selectActiveSession
} from '../store/sessionSlice';
import { addNotification } from '../store/notificationSlice';
import { useTimer } from '../hooks/useTimer';

export const MiniPlayer: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isProcessingStopRef = useRef(false);

  const activeRecipeId = useSelector((state: RootState) => state.session.activeRecipeId);
  const session = useSelector(selectActiveSession);
  const recipe = useSelector((state: RootState) =>
    state.recipes.recipes.find(r => r.id === activeRecipeId)
  );

  useTimer(activeRecipeId, session?.isRunning || false);

  const isOnCookingPage = location.pathname === `/cook/${activeRecipeId}`;
  const isSessionComplete = session?.isSessionComplete === true;

  // Hide mini player when session complete OR on cooking page
  if (!session || !recipe || isOnCookingPage || isSessionComplete) {
    return null;
  }

  const totalSteps = recipe.steps.length;
  const currentStep = session.currentStepIndex < totalSteps 
    ? recipe.steps[session.currentStepIndex] 
    : null;

  if (!currentStep) return null;

  const stepDurationSec = currentStep.durationMinutes * 60;
  const stepElapsedSec = Math.max(0, stepDurationSec - session.stepRemainingSec);
  const stepProgressPercent = stepDurationSec > 0 
    ? Math.round((stepElapsedSec / stepDurationSec) * 100) 
    : 0;

  const handlePlayPause = () => {
    if (session.isRunning) {
      dispatch(pauseSession(recipe.id));
    } else {
      dispatch(playSession(recipe.id));
    }
  };

  const handleStop = () => {
    if (isProcessingStopRef.current || isSessionComplete) return;
    isProcessingStopRef.current = true;

    try {
      const isLastStep = session.currentStepIndex >= totalSteps - 1;

      if (isLastStep) {
        // Last step - end session
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
        // Auto-advance
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
      setTimeout(() => {
        isProcessingStopRef.current = false;
      }, 500);
    }
  };

  const handleExpand = () => {
    navigate(`/cook/${recipe.id}`);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          borderRadius: '16px 16px 0 0',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            {/* Per-Step Circular Progress (small) */}
            <Box sx={{ position: 'relative', width: 60, height: 60, flexShrink: 0 }}>
              <CircularProgress
                variant="determinate"
                value={Math.min(stepProgressPercent, 100)}
                size={60}
                thickness={5}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="caption" fontWeight="bold">
                  {stepProgressPercent}%
                </Typography>
              </Box>
            </Box>

            {/* Info */}
            <Box 
              sx={{ 
                flexGrow: 1, 
                cursor: 'pointer',
                minWidth: 0,
                '&:hover': { opacity: 0.8 }
              }} 
              onClick={handleExpand}
            >
              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                {recipe.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Step {session.currentStepIndex + 1} of {totalSteps} · {formatTime(session.stepRemainingSec)}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {session.isRunning ? '▶️ Running' : '⏸️ Paused'}
              </Typography>
            </Box>

            {/* Controls */}
            <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
              <IconButton
                onClick={handlePlayPause}
                color="primary"
                size="small"
                aria-label={session.isRunning ? 'Pause' : 'Play'}
              >
                {session.isRunning ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
              </IconButton>

              <IconButton
                onClick={handleStop}
                color="error"
                size="small"
                aria-label="Stop step"
                disabled={isProcessingStopRef.current}
              >
                <Stop fontSize="small" />
              </IconButton>

              <IconButton
                onClick={handleExpand}
                color="primary"
                size="small"
                aria-label="Expand"
              >
                <OpenInFull fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Slide>
  );
};
