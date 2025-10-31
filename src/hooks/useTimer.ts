import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { tickSession } from '../store/sessionSlice';

export const useTimer = (recipeId: string | null, isRunning: boolean) => {
  const dispatch = useDispatch();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!recipeId || !isRunning) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      dispatch(tickSession(recipeId));
    }, 1000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [recipeId, isRunning, dispatch]);
};
