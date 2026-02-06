/**
 * NotificationService
 * Handles local notifications for daily reminders
 */

import * as Notifications from "expo-notifications";
import type { SettingsRepository } from "@domain/repositories";

// Settings keys
const MORNING_HOUR_KEY = "notification_morning_hour";
const MORNING_MINUTE_KEY = "notification_morning_minute";
const EVENING_HOUR_KEY = "notification_evening_hour";
const EVENING_MINUTE_KEY = "notification_evening_minute";
const NOTIFICATIONS_ENABLED_KEY = "notifications_enabled";
const MORNING_ENABLED_KEY = "notification_morning_enabled";
const EVENING_ENABLED_KEY = "notification_evening_enabled";

// Default times
const DEFAULT_MORNING_HOUR = 7;
const DEFAULT_MORNING_MINUTE = 0;
const DEFAULT_EVENING_HOUR = 21;
const DEFAULT_EVENING_MINUTE = 30;

// Notification identifiers
const MORNING_NOTIFICATION_ID = "virtus-morning-reminder";
const EVENING_NOTIFICATION_ID = "virtus-evening-reminder";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationTime {
  hour: number;
  minute: number;
}

export interface NotificationPreferences {
  morningEnabled: boolean;
  eveningEnabled: boolean;
  morningTime: NotificationTime;
  eveningTime: NotificationTime;
}

export class NotificationService {
  constructor(private settingsRepository: SettingsRepository) {}

  /**
   * Request notification permissions
   * @returns true if permissions granted
   */
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    if (existingStatus === "granted") {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();

    if (status === "granted") {
      await this.settingsRepository.set(NOTIFICATIONS_ENABLED_KEY, "true");
      return true;
    }

    await this.settingsRepository.set(NOTIFICATIONS_ENABLED_KEY, "false");
    return false;
  }

  /**
   * Schedule the morning reminder notification
   */
  async scheduleMorningReminder(hour: number, minute: number): Promise<void> {
    // Cancel existing morning notification
    await Notifications.cancelScheduledNotificationAsync(
      MORNING_NOTIFICATION_ID,
    ).catch(() => {});

    // Schedule new notification
    await Notifications.scheduleNotificationAsync({
      identifier: MORNING_NOTIFICATION_ID,
      content: {
        title: "Virtus — Exhortation du jour",
        body: "Commence ta journée avec la formation du jour 🙏",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    // Save preferences
    await this.settingsRepository.set(MORNING_HOUR_KEY, hour.toString());
    await this.settingsRepository.set(MORNING_MINUTE_KEY, minute.toString());
  }

  /**
   * Schedule the evening reminder notification
   */
  async scheduleEveningReminder(hour: number, minute: number): Promise<void> {
    // Cancel existing evening notification
    await Notifications.cancelScheduledNotificationAsync(
      EVENING_NOTIFICATION_ID,
    ).catch(() => {});

    // Schedule new notification
    await Notifications.scheduleNotificationAsync({
      identifier: EVENING_NOTIFICATION_ID,
      content: {
        title: "Virtus — Examen du soir",
        body: "Prends 10 minutes pour ton examen de conscience 🕯",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    // Save preferences
    await this.settingsRepository.set(EVENING_HOUR_KEY, hour.toString());
    await this.settingsRepository.set(EVENING_MINUTE_KEY, minute.toString());
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await this.settingsRepository.set(NOTIFICATIONS_ENABLED_KEY, "false");
  }

  /**
   * Reschedule both notifications with new times
   */
  async reschedule(
    morningTime: NotificationTime,
    eveningTime: NotificationTime,
  ): Promise<void> {
    // Cancel all existing
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule new
    await this.scheduleMorningReminder(morningTime.hour, morningTime.minute);
    await this.scheduleEveningReminder(eveningTime.hour, eveningTime.minute);

    await this.settingsRepository.set(NOTIFICATIONS_ENABLED_KEY, "true");
  }

  /**
   * Schedule default notifications (morning 7:00, evening 21:30)
   */
  async scheduleDefaults(): Promise<void> {
    await this.reschedule(
      { hour: DEFAULT_MORNING_HOUR, minute: DEFAULT_MORNING_MINUTE },
      { hour: DEFAULT_EVENING_HOUR, minute: DEFAULT_EVENING_MINUTE },
    );
  }

  /**
   * Get current notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const [
      morningEnabled,
      eveningEnabled,
      morningHour,
      morningMinute,
      eveningHour,
      eveningMinute,
    ] = await Promise.all([
      this.settingsRepository.get(MORNING_ENABLED_KEY),
      this.settingsRepository.get(EVENING_ENABLED_KEY),
      this.settingsRepository.get(MORNING_HOUR_KEY),
      this.settingsRepository.get(MORNING_MINUTE_KEY),
      this.settingsRepository.get(EVENING_HOUR_KEY),
      this.settingsRepository.get(EVENING_MINUTE_KEY),
    ]);

    return {
      morningEnabled: morningEnabled === "true",
      eveningEnabled: eveningEnabled === "true",
      morningTime: {
        hour: morningHour ? parseInt(morningHour, 10) : DEFAULT_MORNING_HOUR,
        minute: morningMinute
          ? parseInt(morningMinute, 10)
          : DEFAULT_MORNING_MINUTE,
      },
      eveningTime: {
        hour: eveningHour ? parseInt(eveningHour, 10) : DEFAULT_EVENING_HOUR,
        minute: eveningMinute
          ? parseInt(eveningMinute, 10)
          : DEFAULT_EVENING_MINUTE,
      },
    };
  }

  /**
   * Check if notifications are currently enabled
   */
  async isEnabled(): Promise<boolean> {
    const value = await this.settingsRepository.get(NOTIFICATIONS_ENABLED_KEY);
    return value === "true";
  }

  /**
   * Set morning reminder enabled state
   */
  async setMorningEnabled(enabled: boolean): Promise<void> {
    await this.settingsRepository.set(
      MORNING_ENABLED_KEY,
      enabled ? "true" : "false",
    );
  }

  /**
   * Set evening reminder enabled state
   */
  async setEveningEnabled(enabled: boolean): Promise<void> {
    await this.settingsRepository.set(
      EVENING_ENABLED_KEY,
      enabled ? "true" : "false",
    );
  }
}
