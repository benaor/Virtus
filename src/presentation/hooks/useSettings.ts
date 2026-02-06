/**
 * useSettings Hook
 * Manages app settings state and persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { getSettingsRepository, getNotificationService } from '@core/di/container';
import type { NotificationTime } from '@data/datasources/NotificationService';

// Settings keys
const SCREEN_TIME_REMINDER_KEY = 'screen_time_reminder_enabled';

// Default times
const DEFAULT_MORNING: NotificationTime = { hour: 7, minute: 0 };
const DEFAULT_EVENING: NotificationTime = { hour: 21, minute: 30 };

export interface SettingsState {
  // Notification settings
  morningReminderEnabled: boolean;
  morningTime: NotificationTime;
  eveningReminderEnabled: boolean;
  eveningTime: NotificationTime;
  // Digital sobriety
  screenTimeReminderEnabled: boolean;
  // App info
  appVersion: string;
}

interface UseSettingsResult {
  settings: SettingsState;
  isLoading: boolean;
  error: string | null;
  /** Toggle morning reminder */
  toggleMorningReminder: () => Promise<void>;
  /** Toggle evening reminder */
  toggleEveningReminder: () => Promise<void>;
  /** Update morning time */
  setMorningTime: (time: NotificationTime) => Promise<void>;
  /** Update evening time */
  setEveningTime: (time: NotificationTime) => Promise<void>;
  /** Toggle screen time reminder */
  toggleScreenTimeReminder: () => Promise<void>;
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<SettingsState>({
    morningReminderEnabled: true,
    morningTime: DEFAULT_MORNING,
    eveningReminderEnabled: true,
    eveningTime: DEFAULT_EVENING,
    screenTimeReminderEnabled: false,
    appVersion: '1.0.0',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const notificationService = getNotificationService();
        const settingsRepo = getSettingsRepository();

        const [notificationPrefs, screenTimeReminder] = await Promise.all([
          notificationService.getPreferences(),
          settingsRepo.get(SCREEN_TIME_REMINDER_KEY),
        ]);

        setSettings({
          morningReminderEnabled: notificationPrefs.morningEnabled,
          morningTime: notificationPrefs.morningTime,
          eveningReminderEnabled: notificationPrefs.eveningEnabled,
          eveningTime: notificationPrefs.eveningTime,
          screenTimeReminderEnabled: screenTimeReminder === 'true',
          appVersion: '1.0.0',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const toggleMorningReminder = useCallback(async () => {
    try {
      const notificationService = getNotificationService();
      const newEnabled = !settings.morningReminderEnabled;

      if (newEnabled) {
        await notificationService.scheduleMorningReminder(
          settings.morningTime.hour,
          settings.morningTime.minute
        );
      } else {
        // Cancel morning notification
        const { cancelAll, scheduleEveningReminder } = notificationService;
        await notificationService.cancelAll();
        // Re-schedule evening if it's still enabled
        if (settings.eveningReminderEnabled) {
          await notificationService.scheduleEveningReminder(
            settings.eveningTime.hour,
            settings.eveningTime.minute
          );
        }
      }

      // Persist the enabled state
      await notificationService.setMorningEnabled(newEnabled);

      setSettings((prev) => ({
        ...prev,
        morningReminderEnabled: newEnabled,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  }, [settings]);

  const toggleEveningReminder = useCallback(async () => {
    try {
      const notificationService = getNotificationService();
      const newEnabled = !settings.eveningReminderEnabled;

      if (newEnabled) {
        await notificationService.scheduleEveningReminder(
          settings.eveningTime.hour,
          settings.eveningTime.minute
        );
      } else {
        // Cancel evening notification
        await notificationService.cancelAll();
        // Re-schedule morning if it's still enabled
        if (settings.morningReminderEnabled) {
          await notificationService.scheduleMorningReminder(
            settings.morningTime.hour,
            settings.morningTime.minute
          );
        }
      }

      // Persist the enabled state
      await notificationService.setEveningEnabled(newEnabled);

      setSettings((prev) => ({
        ...prev,
        eveningReminderEnabled: newEnabled,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  }, [settings]);

  const setMorningTime = useCallback(async (time: NotificationTime) => {
    try {
      const notificationService = getNotificationService();

      if (settings.morningReminderEnabled) {
        await notificationService.scheduleMorningReminder(time.hour, time.minute);
      }

      setSettings((prev) => ({
        ...prev,
        morningTime: time,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  }, [settings.morningReminderEnabled]);

  const setEveningTime = useCallback(async (time: NotificationTime) => {
    try {
      const notificationService = getNotificationService();

      if (settings.eveningReminderEnabled) {
        await notificationService.scheduleEveningReminder(time.hour, time.minute);
      }

      setSettings((prev) => ({
        ...prev,
        eveningTime: time,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  }, [settings.eveningReminderEnabled]);

  const toggleScreenTimeReminder = useCallback(async () => {
    try {
      const settingsRepo = getSettingsRepository();
      const newEnabled = !settings.screenTimeReminderEnabled;

      await settingsRepo.set(SCREEN_TIME_REMINDER_KEY, newEnabled ? 'true' : 'false');

      setSettings((prev) => ({
        ...prev,
        screenTimeReminderEnabled: newEnabled,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  }, [settings.screenTimeReminderEnabled]);

  return {
    settings,
    isLoading,
    error,
    toggleMorningReminder,
    toggleEveningReminder,
    setMorningTime,
    setEveningTime,
    toggleScreenTimeReminder,
  };
}
