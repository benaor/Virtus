/**
 * Exhortation Entity
 * Daily exhortation/encouragement content
 */

export type Exhortation = {
  day: number; // 1-70
  content: string; // markdown
  author: string;
};
