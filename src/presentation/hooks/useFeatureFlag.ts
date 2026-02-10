import { FEATURE_FLAGS, type FeatureFlagName } from '@core/constants/featureFlags';

/**
 * Hook to check if a feature flag is enabled
 *
 * @param flag - The name of the feature flag to check
 * @returns Whether the feature flag is enabled
 *
 * @example
 * const isFormationEnabled = useFeatureFlag('formation');
 */
export function useFeatureFlag(flag: FeatureFlagName): boolean {
  return FEATURE_FLAGS[flag];
}
