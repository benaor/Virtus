import { GetWeeklyStatsUseCase } from './GetWeeklyStatsUseCase';
import type { EngagementRepository } from '../repositories/EngagementRepository';
import type { DailyCheckRepository } from '../repositories/DailyCheckRepository';
import type { Engagement, DailyCheck } from '../entities';

describe('GetWeeklyStatsUseCase', () => {
  const mockEngagements: Engagement[] = [
    { id: 's1', category: 'spiritual', title: 'Chapelet', isCustom: false, isActive: true, sortOrder: 0 },
    { id: 'v1', category: 'virtue', title: 'Pas d\'écrans', isCustom: false, isActive: true, sortOrder: 1 },
  ];

  it('should return weekly stats with no checks', async () => {
    const engagementRepository: EngagementRepository = {
      getAll: jest.fn(),
      getByCategory: jest.fn(),
      getActive: jest.fn().mockResolvedValue(mockEngagements),
      addPenanceEngagements: jest.fn(),
      hasPenanceEngagements: jest.fn(),
    };

    const dailyCheckRepository: DailyCheckRepository = {
      getChecksForDate: jest.fn(),
      toggleCheck: jest.fn(),
      getChecksForDateRange: jest.fn().mockResolvedValue([]),
      getStreak: jest.fn(),
    };

    const useCase = new GetWeeklyStatsUseCase(engagementRepository, dailyCheckRepository);
    const result = await useCase.execute('2025-02-17'); // Monday

    expect(result).toHaveLength(2);
    expect(result[0].engagement.id).toBe('s1');
    expect(result[0].days).toEqual([false, false, false, false, false, false, false]);
    expect(result[1].engagement.id).toBe('v1');
    expect(result[1].days).toEqual([false, false, false, false, false, false, false]);
  });

  it('should return weekly stats with some checks', async () => {
    const checks: DailyCheck[] = [
      { engagementId: 's1', date: '2025-02-17', checked: true, checkedAt: new Date() }, // Mon
      { engagementId: 's1', date: '2025-02-19', checked: true, checkedAt: new Date() }, // Wed
      { engagementId: 's1', date: '2025-02-21', checked: true, checkedAt: new Date() }, // Fri
      { engagementId: 'v1', date: '2025-02-18', checked: true, checkedAt: new Date() }, // Tue
      { engagementId: 'v1', date: '2025-02-20', checked: true, checkedAt: new Date() }, // Thu
    ];

    const engagementRepository: EngagementRepository = {
      getAll: jest.fn(),
      getByCategory: jest.fn(),
      getActive: jest.fn().mockResolvedValue(mockEngagements),
      addPenanceEngagements: jest.fn(),
      hasPenanceEngagements: jest.fn(),
    };

    const dailyCheckRepository: DailyCheckRepository = {
      getChecksForDate: jest.fn(),
      toggleCheck: jest.fn(),
      getChecksForDateRange: jest.fn().mockResolvedValue(checks),
      getStreak: jest.fn(),
    };

    const useCase = new GetWeeklyStatsUseCase(engagementRepository, dailyCheckRepository);
    const result = await useCase.execute('2025-02-17');

    expect(result[0].days).toEqual([true, false, true, false, true, false, false]);
    expect(result[1].days).toEqual([false, true, false, true, false, false, false]);
  });

  it('should call repository with correct date range', async () => {
    const engagementRepository: EngagementRepository = {
      getAll: jest.fn(),
      getByCategory: jest.fn(),
      getActive: jest.fn().mockResolvedValue(mockEngagements),
      addPenanceEngagements: jest.fn(),
      hasPenanceEngagements: jest.fn(),
    };

    const dailyCheckRepository: DailyCheckRepository = {
      getChecksForDate: jest.fn(),
      toggleCheck: jest.fn(),
      getChecksForDateRange: jest.fn().mockResolvedValue([]),
      getStreak: jest.fn(),
    };

    const useCase = new GetWeeklyStatsUseCase(engagementRepository, dailyCheckRepository);
    await useCase.execute('2025-02-17');

    expect(dailyCheckRepository.getChecksForDateRange).toHaveBeenCalledWith('2025-02-17', '2025-02-23');
  });

  it('should handle unchecked entries (checked: false)', async () => {
    const checks: DailyCheck[] = [
      { engagementId: 's1', date: '2025-02-17', checked: false, checkedAt: null },
    ];

    const engagementRepository: EngagementRepository = {
      getAll: jest.fn(),
      getByCategory: jest.fn(),
      getActive: jest.fn().mockResolvedValue(mockEngagements),
      addPenanceEngagements: jest.fn(),
      hasPenanceEngagements: jest.fn(),
    };

    const dailyCheckRepository: DailyCheckRepository = {
      getChecksForDate: jest.fn(),
      toggleCheck: jest.fn(),
      getChecksForDateRange: jest.fn().mockResolvedValue(checks),
      getStreak: jest.fn(),
    };

    const useCase = new GetWeeklyStatsUseCase(engagementRepository, dailyCheckRepository);
    const result = await useCase.execute('2025-02-17');

    expect(result[0].days[0]).toBe(false); // checked: false should show as false
  });
});
