import type { GameState } from '@game/gameState';

export function addJournalEntry(
  state: GameState,
  id: string,
  title: string,
  text: string,
): void {
  if (state.journal.entries.some((e) => e.id === id)) return;
  state.journal.entries.push({ id, title, text, day: state.player.day });
}
