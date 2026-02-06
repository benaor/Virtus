import { SaveJournalEntryUseCase, SaveJournalEntryInput } from './SaveJournalEntryUseCase';
import type { JournalRepository } from '../repositories/JournalRepository';
import type { JournalEntry } from '../entities';

describe('SaveJournalEntryUseCase', () => {
  const mockJournalEntry: JournalEntry = {
    id: 'journal-1',
    date: '2025-02-16',
    type: 'examen',
    step: 1,
    content: 'Ma réflexion du jour...',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should save examen entry with step', async () => {
    const journalRepository: JournalRepository = {
      getEntriesForDate: jest.fn(),
      getExamenForDate: jest.fn(),
      saveEntry: jest.fn().mockResolvedValue(mockJournalEntry),
      updateEntry: jest.fn(),
    };

    const useCase = new SaveJournalEntryUseCase(journalRepository);
    const input: SaveJournalEntryInput = {
      date: '2025-02-16',
      type: 'examen',
      step: 1,
      content: 'Ma réflexion du jour...',
    };

    const result = await useCase.execute(input);

    expect(journalRepository.saveEntry).toHaveBeenCalledWith({
      date: '2025-02-16',
      type: 'examen',
      step: 1,
      content: 'Ma réflexion du jour...',
    });
    expect(result).toEqual(mockJournalEntry);
  });

  it('should save graces entry without step', async () => {
    const gracesEntry: JournalEntry = {
      ...mockJournalEntry,
      type: 'graces',
      step: null,
    };

    const journalRepository: JournalRepository = {
      getEntriesForDate: jest.fn(),
      getExamenForDate: jest.fn(),
      saveEntry: jest.fn().mockResolvedValue(gracesEntry),
      updateEntry: jest.fn(),
    };

    const useCase = new SaveJournalEntryUseCase(journalRepository);
    const input: SaveJournalEntryInput = {
      date: '2025-02-16',
      type: 'graces',
      content: 'Mes grâces reçues...',
    };

    const result = await useCase.execute(input);

    expect(journalRepository.saveEntry).toHaveBeenCalledWith({
      date: '2025-02-16',
      type: 'graces',
      step: null,
      content: 'Mes grâces reçues...',
    });
    expect(result.type).toBe('graces');
  });

  it('should save notes entry', async () => {
    const notesEntry: JournalEntry = {
      ...mockJournalEntry,
      type: 'notes',
      step: null,
    };

    const journalRepository: JournalRepository = {
      getEntriesForDate: jest.fn(),
      getExamenForDate: jest.fn(),
      saveEntry: jest.fn().mockResolvedValue(notesEntry),
      updateEntry: jest.fn(),
    };

    const useCase = new SaveJournalEntryUseCase(journalRepository);
    const input: SaveJournalEntryInput = {
      date: '2025-02-16',
      type: 'notes',
      content: 'Mes notes personnelles...',
    };

    const result = await useCase.execute(input);

    expect(result.type).toBe('notes');
  });
});
