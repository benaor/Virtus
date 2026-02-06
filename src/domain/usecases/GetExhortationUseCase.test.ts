import { GetExhortationUseCase } from './GetExhortationUseCase';
import type { ContentRepository } from '../repositories/ContentRepository';
import type { Exhortation } from '../entities';

describe('GetExhortationUseCase', () => {
  const mockExhortation: Exhortation = {
    day: 1,
    content: '# Courage !\n\nVous commencez un beau parcours...',
    author: 'Père Marie-Dominique',
  };

  it('should return exhortation for valid day', () => {
    const contentRepository: ContentRepository = {
      getFormation: jest.fn(),
      getExhortation: jest.fn().mockReturnValue(mockExhortation),
    };

    const useCase = new GetExhortationUseCase(contentRepository);
    const result = useCase.execute(1);

    expect(contentRepository.getExhortation).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockExhortation);
  });

  it('should return null for day without exhortation', () => {
    const contentRepository: ContentRepository = {
      getFormation: jest.fn(),
      getExhortation: jest.fn().mockReturnValue(null),
    };

    const useCase = new GetExhortationUseCase(contentRepository);
    const result = useCase.execute(999);

    expect(result).toBeNull();
  });

  it('should call repository with correct day number', () => {
    const contentRepository: ContentRepository = {
      getFormation: jest.fn(),
      getExhortation: jest.fn().mockReturnValue(mockExhortation),
    };

    const useCase = new GetExhortationUseCase(contentRepository);
    useCase.execute(35);

    expect(contentRepository.getExhortation).toHaveBeenCalledWith(35);
  });
});
