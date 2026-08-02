export interface TasbeehItem {
  id: string;
  title: string;
  arabic?: string;
  transliteration?: string;
  translation?: string;
  targetCount: number;
  currentCount: number;
  isCustom?: boolean;
}
