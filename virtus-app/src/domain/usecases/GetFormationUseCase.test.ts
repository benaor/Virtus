import { GetFormationUseCase } from './GetFormationUseCase';
import type { ContentRepository } from '../repositories/ContentRepository';
import type { Formation } from '../entities';

describe('GetFormationUseCase', () => {
  const mockFormation: Formation = {
    day: 1,
    title: 'Introduction au parcours',
    author: 'Saint Augustin',
    readingTime: 5,
    body: '# Formation\n\nContenu de la formation...',
    meditationText: '# Méditation\n\nTexte de méditation...',
  };

  it('should return formation for valid day', () => {
    const contentRepository: ContentRepository = {
      getFormation: jest.fn().mockReturnValue(mockFormation),
      getExhortation: jest.fn(),
    };

    const useCase = new GetFormationUseCase(contentRepository);
    const result = useCase.execute(1);

    expect(contentRepository.getFormation).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockFormation);
  });

  it('should return null for day without formation', () => {
    const contentRepository: ContentRepository = {
      getFormation: jest.fn().mockReturnValue(null),
      getExhortation: jest.fn(),
    };

    const useCase = new GetFormationUseCase(contentRepository);
    const result = useCase.execute(999);

    expect(result).toBeNull();
  });

  it('should call repository with correct day number', () => {
    const contentRepository: ContentRepository = {
      getFormation: jest.fn().mockReturnValue(mockFormation),
      getExhortation: jest.fn(),
    };

    const useCase = new GetFormationUseCase(contentRepository);
    useCase.execute(42);

    expect(contentRepository.getFormation).toHaveBeenCalledWith(42);
  });
});
