/** Jackson can return Instant as ISO text, epoch seconds (including fractions), or epoch milliseconds. */
export function formatConnectionDate(value: string | number | null | undefined): string | null {
    if (value == null || value === '') return null;
    const numeric = typeof value === 'number' ? value : /^\d+(\.\d+)?$/.test(value) ? Number(value) : null;
    const date = new Date(numeric === null ? value : Math.abs(numeric) < 100_000_000_000 ? numeric * 1000 : numeric);
    return Number.isNaN(date.getTime()) || date.getFullYear() < 2000 ? null : date.toLocaleDateString();
}
