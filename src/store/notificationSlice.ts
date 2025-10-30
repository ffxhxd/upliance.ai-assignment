// src/store/notificationSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type RootState } from './index';

export interface Notification {
  id: string;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  autoHideDuration?: number;
}

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: []
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = Date.now().toString();
      state.notifications.push({
        ...action.payload,
        id,
        autoHideDuration: action.payload.autoHideDuration || 4000
      });
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
    }
  }
});

export const selectNotifications = (state: RootState) => state.notifications.notifications;

export const { addNotification, removeNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
