import {
  getCurrentDay,
  getCurrentPeriod,
  getDayDate,
  isParcoursActive,
  getDaysRemaining,
  getProgress,
  formatDayLabel,
} from '../Parcours';

describe('Parcours helpers', () => {
  describe('getCurrentDay', () => {
    it('should return 1 on the first day of parcours (Feb 16, 2025)', () => {
      const date = new Date('2025-02-16T12:00:00Z');
      expect(getCurrentDay(date)).toBe(1);
    });

    it('should return 70 on the last day of parcours (Apr 26, 2025)', () => {
      const date = new Date('2025-04-26T12:00:00Z');
      expect(getCurrentDay(date)).toBe(70);
    });

    it('should return null before parcours starts', () => {
      const date = new Date('2025-02-15T23:59:59Z');
      expect(getCurrentDay(date)).toBeNull();
    });

    it('should return null after parcours ends', () => {
      const date = new Date('2025-04-27T00:00:00Z');
      expect(getCurrentDay(date)).toBeNull();
    });

    it('should return correct day in the middle of parcours', () => {
      // Day 18 is March 5, 2025 (first day of Carême)
      const date = new Date('2025-03-05T08:00:00Z');
      expect(getCurrentDay(date)).toBe(18);
    });

    it('should return correct day for Day 64 (first day of Easter Octave)', () => {
      const date = new Date('2025-04-20T10:00:00Z');
      expect(getCurrentDay(date)).toBe(64);
    });

    it('should handle different times on the same day', () => {
      const morning = new Date('2025-02-16T06:00:00Z');
      const evening = new Date('2025-02-16T22:00:00Z');
      expect(getCurrentDay(morning)).toBe(1);
      expect(getCurrentDay(evening)).toBe(1);
    });
  });

  describe('getCurrentPeriod', () => {
    it('should return Pré-Carême for day 1', () => {
      const period = getCurrentPeriod(1);
      expect(period.name).toBe('Pré-Carême');
    });

    it('should return Pré-Carême for day 17', () => {
      const period = getCurrentPeriod(17);
      expect(period.name).toBe('Pré-Carême');
    });

    it('should return Carême for day 18', () => {
      const period = getCurrentPeriod(18);
      expect(period.name).toBe('Carême');
    });

    it('should return Carême for day 63', () => {
      const period = getCurrentPeriod(63);
      expect(period.name).toBe('Carême');
    });

    it('should return Octave de Pâques for day 64', () => {
      const period = getCurrentPeriod(64);
      expect(period.name).toBe('Octave de Pâques');
    });

    it('should return Octave de Pâques for day 70', () => {
      const period = getCurrentPeriod(70);
      expect(period.name).toBe('Octave de Pâques');
    });

    it('should throw error for day 0', () => {
      expect(() => getCurrentPeriod(0)).toThrow('Day 0 is out of range');
    });

    it('should throw error for day 71', () => {
      expect(() => getCurrentPeriod(71)).toThrow('Day 71 is out of range');
    });

    it('should throw error for negative day', () => {
      expect(() => getCurrentPeriod(-1)).toThrow('Day -1 is out of range');
    });

    it('should return correct period boundaries', () => {
      const preCareme = getCurrentPeriod(1);
      expect(preCareme.startDay).toBe(1);
      expect(preCareme.endDay).toBe(17);
      expect(preCareme.startDate).toBe('2025-02-16');
      expect(preCareme.endDate).toBe('2025-03-04');

      const careme = getCurrentPeriod(18);
      expect(careme.startDay).toBe(18);
      expect(careme.endDay).toBe(63);

      const octave = getCurrentPeriod(64);
      expect(octave.startDay).toBe(64);
      expect(octave.endDay).toBe(70);
    });
  });

  describe('getDayDate', () => {
    it('should return Feb 16, 2025 for day 1', () => {
      const date = getDayDate(1);
      expect(date.getUTCFullYear()).toBe(2025);
      expect(date.getUTCMonth()).toBe(1); // February (0-indexed)
      expect(date.getUTCDate()).toBe(16);
    });

    it('should return Apr 26, 2025 for day 70', () => {
      const date = getDayDate(70);
      expect(date.getUTCFullYear()).toBe(2025);
      expect(date.getUTCMonth()).toBe(3); // April (0-indexed)
      expect(date.getUTCDate()).toBe(26);
    });

    it('should return Mar 5, 2025 for day 18 (first day of Carême)', () => {
      const date = getDayDate(18);
      expect(date.getUTCFullYear()).toBe(2025);
      expect(date.getUTCMonth()).toBe(2); // March (0-indexed)
      expect(date.getUTCDate()).toBe(5);
    });

    it('should return Apr 20, 2025 for day 64 (first day of Easter Octave)', () => {
      const date = getDayDate(64);
      expect(date.getUTCFullYear()).toBe(2025);
      expect(date.getUTCMonth()).toBe(3); // April (0-indexed)
      expect(date.getUTCDate()).toBe(20);
    });

    it('should throw error for day 0', () => {
      expect(() => getDayDate(0)).toThrow('Day 0 is out of range');
    });

    it('should throw error for day 71', () => {
      expect(() => getDayDate(71)).toThrow('Day 71 is out of range');
    });
  });

  describe('isParcoursActive', () => {
    it('should return true during parcours', () => {
      const date = new Date('2025-03-15T12:00:00Z');
      expect(isParcoursActive(date)).toBe(true);
    });

    it('should return true on first day', () => {
      const date = new Date('2025-02-16T00:00:00Z');
      expect(isParcoursActive(date)).toBe(true);
    });

    it('should return true on last day', () => {
      const date = new Date('2025-04-26T23:59:59Z');
      expect(isParcoursActive(date)).toBe(true);
    });

    it('should return false before parcours', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      expect(isParcoursActive(date)).toBe(false);
    });

    it('should return false after parcours', () => {
      const date = new Date('2025-05-01T12:00:00Z');
      expect(isParcoursActive(date)).toBe(false);
    });
  });

  describe('getDaysRemaining', () => {
    it('should return 69 on day 1', () => {
      const date = new Date('2025-02-16T12:00:00Z');
      expect(getDaysRemaining(date)).toBe(69);
    });

    it('should return 0 on day 70', () => {
      const date = new Date('2025-04-26T12:00:00Z');
      expect(getDaysRemaining(date)).toBe(0);
    });

    it('should return null before parcours', () => {
      const date = new Date('2025-02-10T12:00:00Z');
      expect(getDaysRemaining(date)).toBeNull();
    });

    it('should return null after parcours', () => {
      const date = new Date('2025-05-01T12:00:00Z');
      expect(getDaysRemaining(date)).toBeNull();
    });
  });

  describe('getProgress', () => {
    it('should return approximately 0.014 on day 1', () => {
      const date = new Date('2025-02-16T12:00:00Z');
      const progress = getProgress(date);
      expect(progress).toBeCloseTo(1 / 70, 3);
    });

    it('should return 1 on day 70', () => {
      const date = new Date('2025-04-26T12:00:00Z');
      expect(getProgress(date)).toBe(1);
    });

    it('should return 0.5 on day 35', () => {
      const date = new Date('2025-03-22T12:00:00Z'); // Day 35
      expect(getProgress(date)).toBe(0.5);
    });

    it('should return null before parcours', () => {
      const date = new Date('2025-02-10T12:00:00Z');
      expect(getProgress(date)).toBeNull();
    });
  });

  describe('formatDayLabel', () => {
    it('should format day 1 as "Jour 1"', () => {
      expect(formatDayLabel(1)).toBe('Jour 1');
    });

    it('should format day 42 as "Jour 42"', () => {
      expect(formatDayLabel(42)).toBe('Jour 42');
    });

    it('should format day 70 as "Jour 70"', () => {
      expect(formatDayLabel(70)).toBe('Jour 70');
    });
  });
});
