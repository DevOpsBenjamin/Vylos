export interface JournalEntry {
  id: string;
  title: string;
  text: string;
  day: number;
}

export interface JournalState {
  entries: JournalEntry[];
}

export function createJournalState(): JournalState {
  return {
    entries: [],
  };
}
