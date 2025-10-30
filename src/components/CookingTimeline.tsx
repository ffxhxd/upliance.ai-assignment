import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Stack,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  RadioButtonChecked,
  Thermostat,
  Speed,
  Inventory
} from '@mui/icons-material';
import { type RecipeStep, type Ingredient } from '../types/recipe.types';

interface CookingTimelineProps {
  steps: RecipeStep[];
  currentStepIndex: number;
  ingredients: Ingredient[];
}

export const CookingTimeline: React.FC<CookingTimelineProps> = ({
  steps,
  currentStepIndex,
  ingredients
}) => {
  const getStepStatus = (index: number): 'completed' | 'active' | 'upcoming' => {
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'active';
    return 'upcoming';
  };

  const getStepIcon = (index: number) => {
    const status = getStepStatus(index);
    
    if (status === 'completed') {
      return <CheckCircle sx={{ color: 'success.main', fontSize: 24 }} />;
    } else if (status === 'active') {
      return <RadioButtonChecked sx={{ color: 'primary.main', fontSize: 24 }} />;
    } else {
      return <RadioButtonUnchecked sx={{ color: 'grey.400', fontSize: 24 }} />;
    }
  };

  const getIngredientName = (id: string): string => {
    const ingredient = ingredients.find(ing => ing.id === id);
    return ingredient ? `${ingredient.name} (${ingredient.quantity} ${ingredient.unit})` : 'Unknown';
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Recipe Timeline
      </Typography>
      
      <Stepper orientation="vertical" activeStep={currentStepIndex} sx={{ mt: 2 }}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          
          return (
            <Step key={step.id} active={status === 'active'} completed={status === 'completed'}>
              <StepLabel
                StepIconComponent={() => getStepIcon(index)}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '1rem',
                    fontWeight: status === 'active' ? 'bold' : 'normal',
                    opacity: status === 'upcoming' ? 0.6 : 1
                  }
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: status === 'active' ? 'bold' : 'normal',
                      color: status === 'upcoming' ? 'text.secondary' : 'text.primary'
                    }}
                  >
                    Step {index + 1}
                  </Typography>
                  <Chip
                    label={step.type === 'cooking' ? 'Cooking' : 'Instruction'}
                    size="small"
                    color={step.type === 'cooking' ? 'success' : 'info'}
                    sx={{ height: 20 }}
                  />
                  <Chip
                    label={`${step.durationMinutes} min`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20 }}
                  />
                </Stack>
              </StepLabel>
              
              <StepContent>
                <Box sx={{ pb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ mb: 2, color: status === 'upcoming' ? 'text.secondary' : 'text.primary' }}
                  >
                    {step.description}
                  </Typography>

                  {step.type === 'cooking' && step.cookingSettings && (
                    <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Thermostat fontSize="small" color="error" />
                        <Typography variant="caption" color="text.secondary">
                          {step.cookingSettings.temperature}°C
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Speed fontSize="small" color="primary" />
                        <Typography variant="caption" color="text.secondary">
                          Speed {step.cookingSettings.speed}
                        </Typography>
                      </Box>
                    </Stack>
                  )}

                  {step.type === 'instruction' && step.ingredientIds && step.ingredientIds.length > 0 && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Inventory fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Ingredients needed:
                        </Typography>
                      </Box>
                      <Stack spacing={0.5}>
                        {step.ingredientIds.map(ingId => (
                          <Typography 
                            key={ingId} 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ pl: 3 }}
                          >
                            • {getIngredientName(ingId)}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
              </StepContent>
            </Step>
          );
        })}
      </Stepper>

      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={3}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Steps
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {steps.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Duration
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {steps.reduce((sum, s) => sum + s.durationMinutes, 0)} minutes
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {Math.round((currentStepIndex / steps.length) * 100)}%
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};
