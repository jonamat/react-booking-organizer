/**
 * Unit test suite
 *
 * Target: isEmployeeBusy
 * Tests:
 * - Functionality
 */

// Test configuration
import { subDays, addDays } from 'date-fns';

// Component to test
import isEmployeeOnDuty from '../isEmployeeOnDuty';

const thatDay = new Date('1 Jan 2020 10:00 GMT+0100'); // it was wednesday

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('isEmployeeOnDuty fn', () => {
    it('returns true if employee is on duty that day and hour', () => {
        expect(
            isEmployeeOnDuty(thatDay, {
                id: 'id',
                name: 'name',
                holidays: [],
                weekWorkingShifts: {
                    wednesday: [
                        {
                            startTime: { hour: 8, minute: 0 },
                            endTime: { hour: 20, minute: 0 },
                        },
                    ],
                },
            }),
        ).toBeTruthy();
    });

    it('returns false if employee is not on duty that day and hour', () => {
        expect(
            isEmployeeOnDuty(thatDay, {
                id: 'id',
                name: 'name',
                holidays: [],
                weekWorkingShifts: {
                    monday: [
                        {
                            startTime: { hour: 8, minute: 0 },
                            endTime: { hour: 20, minute: 0 },
                        },
                    ],
                },
            }),
        ).toBeFalsy();
    });

    it('returns false if employee is on vacation', () => {
        expect(
            isEmployeeOnDuty(thatDay, {
                id: 'id',
                name: 'name',
                holidays: [
                    {
                        startDay: subDays(thatDay, 3),
                        endDay: addDays(thatDay, 3),
                    },
                ],
                weekWorkingShifts: {},
            }),
        ).toBeFalsy();
    });

    it('returns true if employee has not working shifts defined', () => {
        expect(
            isEmployeeOnDuty(thatDay, {
                id: 'id',
                name: 'name',
                holidays: [],
                weekWorkingShifts: {},
            }),
        ).toBeTruthy();
    });
});
