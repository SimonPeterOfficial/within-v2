/** Small presentation helpers shared across the universe. */

/** 12840 → "12.8k" — compact follower/play counts. */
export function formatFollowers(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(count);
}

/** 4.9 → "4.9" — one decimal, used for editorial ratings. */
export function formatRating(rating: number | undefined): string {
  if (rating === undefined) return "";
  return rating.toFixed(1);
}
