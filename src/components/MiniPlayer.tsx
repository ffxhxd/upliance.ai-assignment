import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Stack,
  Chip,
  Slide
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Close,
  OpenInFull
} from '@mui/icons-material';
import { type RootState } from '../store';
import {
  playSession,
  pauseSession,
  endSession,
  selectActiveSession
} from '../store/sessionSlice';
import { addNotification } from '../store/notificationSlice';
import { useTimer } from '../hooks/useTimer';

export const MiniPlayer: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const activeRecipeId = useSelector((state: RootState) => state.session.activeRecipeId);
  const session = useSelector(selectActiveSession);
  const recipe = useSelector((state: RootState) =>
    state.recipes.recipes.find(r => r.id === activeRecipeId)
  );

  useTimer(activeRecipeId, session?.isRunning || false);

  const isOnCookingPage = location.pathname.startsWith('/cook/');

  if (!session || !recipe || isOnCookingPage || session.isCompleted) {
    return null;
  }

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

  const handleEnd = () => {
    if (window.confirm('End cooking session?')) {
      dispatch(endSession(recipe.id));
      dispatch(addNotification({
        message: '🛑 Cooking session ended',
        severity: 'warning',
        autoHideDuration: 2000
      }));
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

  const totalSteps = recipe.steps.length;
  const progressPercent = ((session.currentStepIndex + 1) / totalSteps) * 100;
  const currentStep = recipe.steps[session.currentStepIndex];

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
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{ height: 4 }}
        />

        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box 
              sx={{ 
                flexGrow: 1, 
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 }
              }}
              onClick={handleExpand}
            >
              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                {recipe.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Step {session.currentStepIndex + 1} of {totalSteps}
                {currentStep && ` • ${currentStep.description.substring(0, 50)}${currentStep.description.length > 50 ? '...' : ''}`}
              </Typography>
            </Box>

            <Chip
              label={formatTime(session.stepRemainingSec)}
              color={session.stepRemainingSec < 60 ? 'error' : 'primary'}
              sx={{ 
                fontWeight: 'bold',
                fontSize: '1rem',
                minWidth: 80
              }}
            />

            <Stack direction="row" spacing={0.5}>
              <IconButton
                onClick={handlePlayPause}
                color="primary"
                size="small"
                aria-label={session.isRunning ? 'Pause' : 'Play'}
              >
                {session.isRunning ? <Pause /> : <PlayArrow />}
              </IconButton>

              <IconButton
                onClick={handleExpand}
                color="primary"
                size="small"
                aria-label="Open full view"
              >
                <OpenInFull fontSize="small" />
              </IconButton>

              <IconButton
                onClick={handleEnd}
                color="error"
                size="small"
                aria-label="End session"
              >
                <Close />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Slide>
  );
};
