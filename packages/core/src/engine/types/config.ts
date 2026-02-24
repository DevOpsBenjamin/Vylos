export interface VylosConfig {
  name: string;
  id: string;
  version: string;
  languages: string[];
  defaultLanguage: string;
  defaultLocation: string;
  resolution: { width: number; height: number };
}
