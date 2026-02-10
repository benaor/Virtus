import { GetDayProgressUseCase } from './GetDayProgressUseCase';
import type { EngagementRepository } from '../repositories/EngagementRepository';
import type { DailyCheckRepository } from '../repositories/DailyCheckRepository';
import type { Engagement, DailyCheck } from '../entities';

describe('GetDayProgressUseCase', () => {
  const mockEngagements: Engagement[] = [
    { id: 's1', category: 'spiritual', title: 'Chapelet', isCustom: false, isActive: true, sortOrder: 0 },
    { id: 's2', category: 'spiritual', title: 'Oraison', isCustom: false, isActive: true, sortOrder: 1 },
    { id: 'v1', category: 'virtue', title: 'Pas d\'écrans', isCustom: false, isActive: true, sortOrder: 2 },
    { id: 'v2', category: 'virtue', title: 'Sommeil', isCustom: false, isActive: true, sortOrder: 3 },
    { id: 'p1', category: 'penance', title: 'Jeûne', isCustom: true, isActive: true, sortOrder: 4 },
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
      getChecksForDate: jest.fn().mockResolvedValue(checks),
      toggleCheck: jest.fn(),
      getChecksForDateRange: jest.fn(),
      getStreak: jest.fn(),
    };

    return { engagementRepository, dailyCheckRepository };
  };

  it('should calculate progress with no checks', async () => {
    const { engagementRepository, dailyCheckRepository } = createMockRepositories([]);
    const useCase = new GetDayProgressUseCase(engagementRepository, dailyCheckRepository);

    const result = await useCase.execute('2025-02-16');

    expect(result.spiritual).toEqual({ category: 'spiritual', checked: 0, total: 2, percentage: 0 });
    expect(result.virtue).toEqual({ category: 'virtue', checked: 0, total: 2, percentage: 0 });
    expect(result.penance).toEqual({ category: 'penance', checked: 0, total: 1, percentage: 0 });
    expect(result.overall).toEqual(expect.objectContaining({ checked: 0, total: 5, percentage: 0 }));
  });

  it('should calculate progress with some checks', async () => {
    const checks: DailyCheck[] = [
      { engagementId: 's1', date: '2025-02-16', checked: true, checkedAt: new Date() },
      { engagementId: 'v1', date: '2025-02-16', checked: true, checkedAt: new Date() },
      { engagementId: 'p1', date: '2025-02-16', checked: true, checkedAt: new Date() },
    ];
    const { engagementRepository, dailyCheckRepository } = createMockRepositories(checks);
    const useCase = new GetDayProgressUseCase(engagementRepository, dailyCheckRepository);

    const result = await useCase.execute('2025-02-16');

    expect(result.spiritual).toEqual({ category: 'spiritual', checked: 1, total: 2, percentage: 50 });
    expect(result.virtue).toEqual({ category: 'virtue', checked: 1, total: 2, percentage: 50 });
    expect(result.penance).toEqual({ category: 'penance', checked: 1, total: 1, percentage: 100 });
    expect(result.overall).toEqual(expect.objectContaining({ checked: 3, total: 5, percentage: 60 }));
  });

  it('should calculate 100% progress when all checked', async () => {
    const checks: DailyCheck[] = mockEngagements.map((e) => ({
      engagementId: e.id,
      date: '2025-02-16',
      checked: true,
      checkedAt: new Date(),
    }));
    const { engagementRepository, dailyCheckRepository } = createMockRepositories(checks);
    const useCase = new GetDayProgressUseCase(engagementRepository, dailyCheckRepository);

    const result = await useCase.execute('2025-02-16');

    expect(result.spiritual.percentage).toBe(100);
    expect(result.virtue.percentage).toBe(100);
    expect(result.penance.percentage).toBe(100);
    expect(result.overall.percentage).toBe(100);
  });

  it('should return correct day number for parcours date', async () => {
    const { engagementRepository, dailyCheckRepository } = createMockRepositories([]);
    const useCase = new GetDayProgressUseCase(engagementRepository, dailyCheckRepository);

    const result = await useCase.execute('2025-02-16');

    expect(result.day).toBe(1);
    expect(result.date).toBe('2025-02-16');
  });

  it('should return day 0 for date outside parcours', async () => {
    const { engagementRepository, dailyCheckRepository } = createMockRepositories([]);
    const useCase = new GetDayProgressUseCase(engagementRepository, dailyCheckRepository);

    const result = await useCase.execute('2025-01-01');

    expect(result.day).toBe(0);
  });
});
