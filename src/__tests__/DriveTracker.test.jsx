import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import DriveTracker from '../components/DriveTracker';

/**
 * Property 10: Active drive displays all required info
 * Property 11: Completed drive shows outcome
 *
 * **Validates: Requirements 7.1, 7.2, 7.3**
 */

const baseDriveArb = fc.record({
  team: fc.constantFrom('SEA', 'NE'),
  plays: fc.integer({ min: 1, max: 20 }),
  yards: fc.integer({ min: -10, max: 99 }),
  timeElapsed: fc.constantFrom('0:30', '1:45', '3:12', '5:00'),
  down: fc.integer({ min: 1, max: 4 }),
  distance: fc.integer({ min: 1, max: 30 }),
  yardLine: fc.integer({ min: 1, max: 99 }),
});

const activeDriveArb = baseDriveArb.chain((base) =>
  fc.constant({ ...base, isActive: true, result: null })
);

const driveResultArb = fc.constantFrom('touchdown', 'field_goal', 'punt', 'turnover');

const completedDriveArb = baseDriveArb.chain((base) =>
  driveResultArb.map((result) => ({ ...base, isActive: false, result }))
);

const RESULT_LABELS = {
  touchdown: 'Touchdown',
  field_goal: 'Field Goal',
  punt: 'Punt',
  turnover: 'Turnover',
};

describe('Property 10: Active drive displays all required info', () => {
  it('renders play count, yards, time, down, distance, and field position', () => {
    fc.assert(
      fc.property(activeDriveArb, (drive) => {
        const { container } = render(<DriveTracker currentDrive={drive} />);
        const text = container.textContent;

        expect(text).toContain(String(drive.plays));
        expect(text).toContain(String(drive.yards));
        expect(text).toContain(drive.timeElapsed);
        expect(text).toContain(String(drive.down));
        expect(text).toContain(String(drive.distance));
        expect(text).toContain(String(drive.yardLine));
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 11: Completed drive shows outcome', () => {
  it('renders drive outcome text for completed drives', () => {
    fc.assert(
      fc.property(completedDriveArb, (drive) => {
        const { container } = render(<DriveTracker currentDrive={drive} />);
        const text = container.textContent;

        expect(text).toContain(RESULT_LABELS[drive.result]);
      }),
      { numRuns: 100 }
    );
  });
});
