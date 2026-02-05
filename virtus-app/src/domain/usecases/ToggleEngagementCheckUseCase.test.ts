import { ToggleEngagementCheckUseCase } from './ToggleEngagementCheckUseCase';
import type { DailyCheckRepository } from '../repositories/DailyCheckRepository';
import type { DailyCheck } from '../entities';

describe('ToggleEngagementCheckUseCase', () => {
  it('should toggle check and return updated DailyCheck', async () => {
    const expectedCheck: DailyCheck = {
      engagementId: 'eng-1',
      date: '2025-02-16',
      checked: true,
      checkedAt: new Date(),
    };

    const dailyCheckRepository: DailyCheckRepository = {
      getChecksForDate: jest.fn(),
      toggleCheck: jest.fn().mockResolvedValue(expectedCheck),
      getChecksForDateRange: jest.fn(),
      getStreak: jest.fn(),
    };

    const useCase = new ToggleEngagementCheckUseCase(dailyCheckRepository);
    const result = await useCase.execute('eng-1', '2025-02-16');

    expect(dailyCheckRepository.toggleCheck).toHaveBeenCalledWith('eng-1', '2025-02-16');
    expect(result).toEqual(expectedCheck);
  });

  it('should toggle check from true to false', async () => {
    const expectedCheck: DailyCheck = {
      engagementId: 'eng-1',
      date: '2025-02-16',
      checked: false,
      checkedAt: null,
    };

    const dailyCheckRepository: DailyCheckRepository = {
      getChecksForDate: jest.fn(),
      toggleCheck: jest.fn().mockResolvedValue(expectedCheck),
      getChecksForDateRange: jest.fn(),
      getStreak: jest.fn(),
    };

    const useCase = new ToggleEngagementCheckUseCase(dailyCheckRepository);
    const result = await useCase.execute('eng-1', '2025-02-16');

    expect(result.checked).toBe(false);
    expect(result.checkedAt).toBeNull();
  });
});
