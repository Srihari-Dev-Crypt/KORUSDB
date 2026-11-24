import { describe, it, expect } from 'vitest';
import { 
  sanitizeCsvCell, 
  sanitizeCsvExportRows, 
  calculateSimilarity, 
  findPotentialDuplicates,
  performerSchema,
  eventSchema 
} from '../src/lib/security';

describe('Security & Data Integrity Tests (Section 13 & 22)', () => {
  it('Scenario 16: Prevents Spreadsheet / CSV Formula Injection (CWE-1236)', () => {
    // Malicious cells attempting DDE command execution or formulas
    const payload1 = '=CMD|\'/C calc\'!A0';
    const payload2 = '+SUM(1+1)';
    const payload3 = '-2+3+cmd';
    const payload4 = '@SUM(1+1)';
    const normalText = 'Arjun Sharma';

    expect(sanitizeCsvCell(payload1)).toBe(`'=CMD|'/C calc'!A0`);
    expect(sanitizeCsvCell(payload2)).toBe(`'+SUM(1+1)`);
    expect(sanitizeCsvCell(payload3)).toBe(`'-2+3+cmd`);
    expect(sanitizeCsvCell(payload4)).toBe(`'@SUM(1+1)`);
    expect(sanitizeCsvCell(normalText)).toBe('Arjun Sharma');

    // Batch row sanitization
    const rows = [
      { name: '=1+1', stage: 'Normal', note: '+attack' },
    ];
    const sanitized = sanitizeCsvExportRows(rows);
    expect(sanitized[0].name).toBe(`'=1+1`);
    expect(sanitized[0].stage).toBe('Normal');
    expect(sanitized[0].note).toBe(`'+attack`);
  });

  it('Validates performer inputs using strict Zod schema', () => {
    // Valid performer
    const valid = performerSchema.safeParse({
      full_name: 'Priya Nair',
      departments: ['music'],
      is_published: true,
    });
    expect(valid.success).toBe(true);

    // Invalid performer: empty name
    const invalidName = performerSchema.safeParse({
      full_name: 'A',
      departments: ['music'],
    });
    expect(invalidName.success).toBe(false);

    // Invalid performer: empty departments
    const invalidDept = performerSchema.safeParse({
      full_name: 'Valid Name',
      departments: [],
    });
    expect(invalidDept.success).toBe(false);
  });

  it('Validates event dates and categories', () => {
    // Valid date format YYYY-MM-DD
    const valid = eventSchema.safeParse({
      name: 'Annual Fest',
      event_date: '2026-11-15',
      category: 'Annual Fest',
    });
    expect(valid.success).toBe(true);

    // Malicious or invalid date string
    const invalid = eventSchema.safeParse({
      name: 'Annual Fest',
      event_date: 'not-a-date; DROP TABLE events;',
      category: 'Annual Fest',
    });
    expect(invalid.success).toBe(false);
  });

  it('Identifies spelling duplicates accurately using fuzzy similarity', () => {
    const existing = [
      { id: '1', full_name: 'Arjun Sharma' },
      { id: '2', full_name: 'Priya Nair' },
      { id: '3', full_name: 'Rohan Verma' },
    ];

    // Typo: "Arjun Sharrma" or "Arjun Shrma"
    const duplicates = findPotentialDuplicates('Arjun Sharrma', existing);
    expect(duplicates.length).toBeGreaterThan(0);
    expect(duplicates[0].id).toBe('1');
    expect(duplicates[0].score).toBeGreaterThanOrEqual(85);
  });
});
