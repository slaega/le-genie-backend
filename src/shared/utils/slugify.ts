/**
 * Converts a string into a URL-friendly slug.
 * e.g. "Mon Article en Français !" → "mon-article-en-francais"
 */
export function slugify(str: string): string {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '') // remove diacritics
        .replace(/[^a-z0-9\s-]/g, '')   // keep only alphanum, spaces, hyphens
        .trim()
        .replace(/\s+/g, '-')           // spaces → hyphens
        .replace(/-+/g, '-')            // collapse multiple hyphens
        .slice(0, 80);                  // max 80 chars
}
