/**
 * Formation Entity
 * Daily formation content (reading and meditation)
 */

export type Formation = {
  day: number; // 1-70
  title: string;
  author: string;
  readingTime: number; // minutes
  body: string; // markdown
  meditationText: string; // markdown
};
