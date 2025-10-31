import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Alert,
  Stack,
  Slide,
  IconButton
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { selectNotifications, removeNotification } from '../store/notificationSlice';

export const NotificationCenter: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);

  const handleClose = (id: string) => {
    dispatch(removeNotification(id));
  };

  React.useEffect(() => {
    notifications.forEach(notification => {
      if (notification.autoHideDuration) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.autoHideDuration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1400,
        maxWidth: 400,
        width: '90vw',
        display: 'flex',
        flexDirection: 'column-reverse'
      }}
    >
      <Stack spacing={1}>
        {notifications.map((notification) => (
          <Slide key={notification.id} direction="left" in={true}>
            <Alert
              severity={notification.severity}
              action={
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={() => handleClose(notification.id)}
                >
                  <Close fontSize="small" />
                </IconButton>
              }
              sx={{
                animation: 'slideIn 0.3s ease-out',
                fontSize: '0.95rem'
              }}
            >
              {notification.message}
            </Alert>
          </Slide>
        ))}
      </Stack>
    </Box>
  );
};
