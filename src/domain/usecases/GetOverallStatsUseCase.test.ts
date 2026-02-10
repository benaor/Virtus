import { GetOverallStatsUseCase } from './GetOverallStatsUseCase';
import type { EngagementRepository } from '../repositories/EngagementRepository';
import type { DailyCheckRepository } from '../repositories/DailyCheckRepository';
import type { Engagement, DailyCheck } from '../entities';

// Mock the Parcours module to control getCurrentDay
jest.mock('../entities/Parcours', () => ({
  getCurrentDay: jest.fn(),
}));

import { getCurrentDay } from '../entities/Parcours';

describe('GetOverallStatsUseCase', () => {
  const mockEngagements: Engagement[] = [
    { id: 's1', category: 'spiritual', title: 'Chapelet', isCustom: false, isActive: true, sortOrder: 0 },
    { id: 's2', category: 'spiritual', title: 'Oraison', isCustom: false, isActive: true, sortOrder: 1 },
    { id: 'v1', category: 'virtue', title: 'Pas d\'écrans', isCustom: false, isActive: true, sortOrder: 2 },
    { id: 'p1', category: 'penance', title: 'Jeûne', isCustom: true, isActive: true, sortOrder: 3 },
  ];

  const createMockRepositories = (checks: DailyCheck[]) => {
    const engagementRepository: EngagementRepository = {
      getAll: jest.fn(),
      getByCategory: jest.fn(),
      getActive: jest.fn().mockResolvedValue(mockEngagements),
      addPenanceEngagements: jest.fn(),
      replacePenanceEngagements: jest.fn(),
      hasPenanceEngagements: jest.fn(),
    };

    const dailyCheckRepository: DailyCheckRepository = {
      getChecksForDate: jest.fn(),
      toggleCheck: jest.fn(),
      getChecksForDateRange: jest.fn().mockResolvedValue(checks),
      getStreak: jest.fn(),
    };

    return { engagementRepository, dailyCheckRepository };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 0 for all categories when parcours has not started', async () => {
    (getCurrentDay as jest.Mock).mockReturnValue(null);

    const { engagementRepository, dailyCheckRepository } = createMockRepositories([]);
    const useCase = new GetOverallStatsUseCase(engagementRepository, dailyCheckRepository);

    const result = await useCase.execute();

    expect(result).toEqual({ spiritual: 0, virtue: 0, penance: 0 });
  });

  it('should calculate correct percentages with full completion', async () => {
    (getCurrentDay as jest.Mock).mockReturnValue(2); // Day 2

    const checks: DailyCheck[] = [
      // Day 1
      { engagementId: 's1', date: '2025-02-16', checked: true, checkedAt: new Date() },
      { engagementId: 's2', date: '2025-02-16', checked: true, checkedAt: new Date() },
      { engagementId: 'v1', date: '2025-02-16', checked: true, checkedAt: new Date() },
      { engagementId: 'p1', date: '2025-02-16', checked: true, checkedAt: new Date() },
      // Day 2
      { engagementId: 's1', date: '2025-02-17', checked: true, checkedAt: new Date() },
      { engagementId: 's2', date: '2025-02-17', checked: true, checkedAt: new Date() },
      { engagementId: 'v1', date: '2025-02-17', checked: true, checkedAt: new Date() },
      { engagementId: 'p1', date: '2025-02-17', checked: true, checkedAt: new Date() },
    ];

    const { engagementRepository, dailyCheckRepository } = createMockRepositories(checks);
    const useCase = new GetOverallStatsUseCase(engagementRepository, dailyCheckRepository);

    const result = await useCase.execute();

    expect(result.spiritual).toBe(100); // 4/4 = 100%
    expect(result.virtue).toBe(100); // 2/2 = 100%
    expect(result.penance).toBe(100); // 2/2 = 100%
  });

  it('should calculate correct percentages with partial completion', async () => {
    (getCurrentDay as jest.Mock).mockReturnValue(2); // Day 2

    const checks: DailyCheck[] = [
      // Day 1 - only spiritual
      { engagementId: 's1', date: '2025-02-16', checked: true, checkedAt: new Date() },
      { engagementId: 's2', date: '2025-02-16', checked: true, checkedAt: new Date() },
      // Day 2 - nothing
    ];

    const { engagementRepository, dailyCheckRepository } = createMockRepositories(checks);
    const useCase = new GetOverallStatsUseCase(engagementRepository, dailyCheckRepository);

    const result = await useCase.execute();

    // Spiritual: 2 checks / (2 engagements * 2 days) = 2/4 = 50%
    expect(result.spiritual).toBe(50);
    // Virtue: 0 checks / (1 engagement * 2 days) = 0/2 = 0%
    expect(result.virtue).toBe(0);
    // Penance: 0 checks / (1 engagement * 2 days) = 0/2 = 0%
    expect(result.penance).toBe(0);
  });

  it('should ignore unchecked entries', async () => {
    (getCurrentDay as jest.Mock).mockReturnValue(1); // Day 1

    const checks: DailyCheck[] = [
      { engagementId: 's1', date: '2025-02-16', checked: true, checkedAt: new Date() },
      { engagementId: 's2', date: '2025-02-16', checked: false, checkedAt: null }, // Unchecked
    ];

    const { engagementRepository, dailyCheckRepository } = createMockRepositories(checks);
    const useCase = new GetOverallStatsUseCase(engagementRepository, dailyCheckRepository);

    const result = await useCase.execute();

    // Spiritual: 1 check / (2 engagements * 1 day) = 1/2 = 50%
    expect(result.spiritual).toBe(50);
  });

  it('should return 0 for category with no engagements', async () => {
    (getCurrentDay as jest.Mock).mockReturnValue(1);

    const engagementsNoPenance: Engagement[] = [
      { id: 's1', category: 'spiritual', title: 'Chapelet', isCustom: false, isActive: true, sortOrder: 0 },
    ];

    const engagementRepository: EngagementRepository = {
      getAll: jest.fn(),
      getByCategory: jest.fn(),
      getActive: jest.fn().mockResolvedValue(engagementsNoPenance),
      addPenanceEngagements: jest.fn(),
      replacePenanceEngagements: jest.fn(),
      hasPenanceEngagements: jest.fn(),
    };

    const dailyCheckRepository: DailyCheckRepository = {
      getChecksForDate: jest.fn(),
      toggleCheck: jest.fn(),
      getChecksForDateRange: jest.fn().mockResolvedValue([]),
      getStreak: jest.fn(),
    };

    const useCase = new GetOverallStatsUseCase(engagementRepository, dailyCheckRepository);
    const result = await useCase.execute();

    expect(result.penance).toBe(0);
    expect(result.virtue).toBe(0);
  });
});
