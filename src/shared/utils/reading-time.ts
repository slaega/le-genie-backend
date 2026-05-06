/**
 * Recursively extracts all plain text from a TipTap JSON document.
 */
export function extractTextFromTipTap(json: Record<string, unknown>): string {
    const parts: string[] = [];

    if (typeof json.text === 'string') {
        parts.push(json.text);
    }

    if (Array.isArray(json.content)) {
        for (const child of json.content as Record<string, unknown>[]) {
            parts.push(extractTextFromTipTap(child));
        }
    }

    return parts.join(' ');
}

/**
 * Computes reading time in minutes from a TipTap JSON content string.
 * Returns at least 1 minute. Assumes 200 words per minute.
 */
export function computeReadingTime(contentJson: string): number {
    try {
        const json = JSON.parse(contentJson) as Record<string, unknown>;
        const text = extractTextFromTipTap(json);
        const wordCount = text
            .split(/[\s\p{P}]+/u)
            .filter((w) => w.length > 0).length;
        return Math.max(1, Math.ceil(wordCount / 200));
    } catch {
        return 1;
    }
}
