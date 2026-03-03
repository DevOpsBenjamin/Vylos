import type { AdvancedGameState } from '../gameDatas/gameState';

export function addJournalEntry(
  state: AdvancedGameState,
  id: string,
  title: string,
  text: string,
): void {
  if (state.journal.entries.some((e) => e.id === id)) return;
  state.journal.entries.push({ id, title, text, day: state.day });
}
