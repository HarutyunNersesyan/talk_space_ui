import { formatConnectionDate } from './dateUtils';

test('formats epoch seconds, milliseconds and ISO timestamps as the same date', () => {
    const millis = Date.parse('2026-11-03T10:00:00Z');
    const expected = new Date(millis).toLocaleDateString();
    expect(formatConnectionDate(millis / 1000)).toBe(expected);
    expect(formatConnectionDate(millis)).toBe(expected);
    expect(formatConnectionDate('2026-11-03T10:00:00Z')).toBe(expected);
    expect(formatConnectionDate(String(millis / 1000))).toBe(expected);
});

test('does not invent a date for invalid or implausible values', () => {
    expect(formatConnectionDate('not a date')).toBeNull();
    expect(formatConnectionDate(0)).toBeNull();
    expect(formatConnectionDate(null)).toBeNull();
});
