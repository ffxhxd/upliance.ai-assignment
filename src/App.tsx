import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { RecipesList } from './pages/RecipesList';
import { RecipeBuilder } from './pages/RecipeBuilder';
import { CookingSession } from './pages/CookingSession';
import { MiniPlayer } from './components/MiniPlayer';
import { NotificationCenter } from './components/NotificationCenter';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#dc004e'
    },
    success: {
      main: '#4caf50'
    },
    warning: {
      main: '#ff9800'
    },
    error: {
      main: '#f44336'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h4: {
      fontWeight: 700
    },
    h5: {
      fontWeight: 600
    },
    h6: {
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box 
          sx={{ 
            minHeight: '100vh',
            bgcolor: 'background.default',
            pb: 10
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/recipes" replace />} />
            <Route path="/recipes" element={<RecipesList />} />
            <Route path="/create" element={<RecipeBuilder />} />
            <Route path="/cook/:id" element={<CookingSession />} />
            <Route path="*" element={<Navigate to="/recipes" replace />} />
          </Routes>
          
          <MiniPlayer />
          <NotificationCenter />
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
