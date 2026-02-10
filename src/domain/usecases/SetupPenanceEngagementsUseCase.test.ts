import { SetupPenanceEngagementsUseCase } from './SetupPenanceEngagementsUseCase';
import type { EngagementRepository } from '../repositories/EngagementRepository';
import type { SettingsRepository } from '../repositories/SettingsRepository';

describe('SetupPenanceEngagementsUseCase', () => {
  const validTitles = [
    'Pas de sucre',
    'Pas de réseaux sociaux',
    'Douche froide',
    'Jeûne le vendredi',
    'Pas d\'alcool',
  ];

  const createMockRepositories = () => {
    const engagementRepository: EngagementRepository = {
      getAll: jest.fn(),
      getByCategory: jest.fn(),
      getActive: jest.fn(),
      addPenanceEngagements: jest.fn().mockResolvedValue(undefined),
      replacePenanceEngagements: jest.fn(),
      hasPenanceEngagements: jest.fn(),
    };

    const settingsRepository: SettingsRepository = {
      get: jest.fn(),
      set: jest.fn(),
      hasCompletedOnboarding: jest.fn(),
      setOnboardingCompleted: jest.fn().mockResolvedValue(undefined),
    };

    return { engagementRepository, settingsRepository };
  };

  it('should setup 5 penance engagements and complete onboarding', async () => {
    const { engagementRepository, settingsRepository } = createMockRepositories();
    const useCase = new SetupPenanceEngagementsUseCase(engagementRepository, settingsRepository);

    await useCase.execute(validTitles);

    expect(engagementRepository.addPenanceEngagements).toHaveBeenCalledWith([
      { title: 'Pas de sucre' },
      { title: 'Pas de réseaux sociaux' },
      { title: 'Douche froide' },
      { title: 'Jeûne le vendredi' },
      { title: 'Pas d\'alcool' },
    ]);
    expect(settingsRepository.setOnboardingCompleted).toHaveBeenCalled();
  });

  it('should throw error if less than 5 penance engagements', async () => {
    const { engagementRepository, settingsRepository } = createMockRepositories();
    const useCase = new SetupPenanceEngagementsUseCase(engagementRepository, settingsRepository);

    await expect(useCase.execute(['Title 1', 'Title 2'])).rejects.toThrow(
      'Expected exactly 5 penance engagements, got 2'
    );
    expect(engagementRepository.addPenanceEngagements).not.toHaveBeenCalled();
  });

  it('should throw error if more than 5 penance engagements', async () => {
    const { engagementRepository, settingsRepository } = createMockRepositories();
    const useCase = new SetupPenanceEngagementsUseCase(engagementRepository, settingsRepository);

    const tooManyTitles = [...validTitles, 'Extra title'];
    await expect(useCase.execute(tooManyTitles)).rejects.toThrow(
      'Expected exactly 5 penance engagements, got 6'
    );
  });

  it('should throw error if any title is empty', async () => {
    const { engagementRepository, settingsRepository } = createMockRepositories();
    const useCase = new SetupPenanceEngagementsUseCase(engagementRepository, settingsRepository);

    const titlesWithEmpty = ['Title 1', '', 'Title 3', 'Title 4', 'Title 5'];
    await expect(useCase.execute(titlesWithEmpty)).rejects.toThrow(
      'Penance engagement titles cannot be empty'
    );
  });

  it('should throw error if any title is only whitespace', async () => {
    const { engagementRepository, settingsRepository } = createMockRepositories();
    const useCase = new SetupPenanceEngagementsUseCase(engagementRepository, settingsRepository);

    const titlesWithWhitespace = ['Title 1', '   ', 'Title 3', 'Title 4', 'Title 5'];
    await expect(useCase.execute(titlesWithWhitespace)).rejects.toThrow(
      'Penance engagement titles cannot be empty'
    );
  });

  it('should trim whitespace from titles', async () => {
    const { engagementRepository, settingsRepository } = createMockRepositories();
    const useCase = new SetupPenanceEngagementsUseCase(engagementRepository, settingsRepository);

    const titlesWithWhitespace = [
      '  Pas de sucre  ',
      'Pas de réseaux sociaux',
      '  Douche froide',
      'Jeûne le vendredi  ',
      'Pas d\'alcool',
    ];
    await useCase.execute(titlesWithWhitespace);

    expect(engagementRepository.addPenanceEngagements).toHaveBeenCalledWith([
      { title: 'Pas de sucre' },
      { title: 'Pas de réseaux sociaux' },
      { title: 'Douche froide' },
      { title: 'Jeûne le vendredi' },
      { title: 'Pas d\'alcool' },
    ]);
  });
});
