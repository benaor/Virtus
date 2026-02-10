/**
 * Feature flags for controlling feature availability
 *
 * These are hardcoded constants that can be toggled to enable/disable features.
 * In the future, these could be moved to a remote configuration system.
 */
export const FEATURE_FLAGS = {
  formation: false,  // Tab "Formation" dans la navigation
  reminders: false,  // Rappels notifs (settings UI + permission onboarding)
} as const;

export type FeatureFlagName = keyof typeof FEATURE_FLAGS;
