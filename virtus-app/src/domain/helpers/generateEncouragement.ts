/**
 * generateEncouragement
 * Pure function that generates an encouragement message based on stats
 */

import type { OverallStats } from '../usecases/GetOverallStatsUseCase';

interface EncouragementResult {
  message: string;
  emoji: string;
}

/**
 * Generate a personalized encouragement message based on overall stats
 * @param stats - Overall fidelity percentages by category
 * @returns An encouragement message with emoji
 */
export function generateEncouragement(stats: OverallStats): EncouragementResult {
  const { spiritual, virtue, penance } = stats;

  // Calculate overall average
  const average = Math.round((spiritual + virtue + penance) / 3);

  // Find the strongest and weakest areas
  const categories = [
    { name: 'la prière', nameShort: 'prière', value: spiritual },
    { name: 'la vertu', nameShort: 'vertu', value: virtue },
    { name: 'la pénitence', nameShort: 'pénitence', value: penance },
  ];

  const sorted = [...categories].sort((a, b) => b.value - a.value);
  const strongest = sorted[0];
  const weakest = sorted[2];

  // Generate message based on overall performance
  if (average >= 80) {
    return {
      emoji: '🌟',
      message: `Magnifique fidélité ! Tu tiens bon sur tous les fronts. Continue ainsi, la grâce opère en toi.`,
    };
  }

  if (average >= 60) {
    if (strongest.value >= 70 && weakest.value < 50) {
      return {
        emoji: '💪',
        message: `Tu es solide sur ${strongest.name} ! ${weakest.nameShort.charAt(0).toUpperCase() + weakest.nameShort.slice(1)} demande un effort supplémentaire cette semaine.`,
      };
    }
    return {
      emoji: '👍',
      message: `Tu avances bien. Persévère dans ${weakest.name}, c'est là que se joue ta conversion.`,
    };
  }

  if (average >= 40) {
    return {
      emoji: '🙏',
      message: `Le chemin est exigeant, mais chaque effort compte. Appuie-toi sur ${strongest.name} pour progresser.`,
    };
  }

  if (average >= 20) {
    return {
      emoji: '💖',
      message: `Ne te décourage pas. Recommence chaque jour avec confiance. Dieu regarde le cœur.`,
    };
  }

  // Very low or just starting
  return {
    emoji: '🌱',
    message: `C'est le début du chemin. Choisis un engagement simple et tiens-le aujourd'hui.`,
  };
}
