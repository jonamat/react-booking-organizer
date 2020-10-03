/**
 * Unit test suite
 *
 * Target: Custom type guards
 * Tests:
 * - Return false if object has invalid keys
 * - Return false if object has invalid types
 * - Return false if object has invalid shapes
 * - Return true if object has correct shape, keys and types
 */

import {
    isNewCustomer,
    isNewEmployee,
    isNewReservation,
    isNewService,
    NewCustomer,
    NewEmployee,
    NewReservation,
    NewService,
} from '../types';

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('isNewReservation type guard', () => {
    it('return true if reservation is correct', () => {
        const reservation: NewReservation = {
            date: new Date(),
            serviceId: 'string',
            customerId: 'string',
            employeeId: 'string',
            notes: undefined,
        };

        expect(isNewReservation(reservation)).toBeTruthy();
    });

    it('return false if reservation has an invalid field', () => {
        const reservation = {
            date: new Date(),
            serviceId: 'string',
            invalid: [],
            customerId: 'string',
            employeeId: 'string',
            notes: undefined,
        };

        expect(isNewReservation(reservation)).toBeFalsy();
    });

    it('return false if reservation has an invalid type', () => {
        const reservation = {
            date: new Date(),
            serviceId: 'string',
            customerId: NaN,
            employeeId: 'string',
            notes: undefined,
        };

        expect(isNewReservation(reservation)).toBeFalsy();
    });

    it('return false if reservation has not a required field', () => {
        const reservation = {
            date: new Date(),
            // serviceId: 'string',
            customerId: 'string',
            employeeId: 'string',
            notes: undefined,
        };

        expect(isNewReservation(reservation)).toBeFalsy();
    });
});

describe('isNewCustomer type guard', () => {
    it('return true if customer is correct', () => {
        const customer: NewCustomer = {
            name: 'string',
            surname: 'string',
            additionalIdentifier: 'string',
            phone: 'string',
            birthday: new Date(),
            notes: undefined,
        };

        expect(isNewCustomer(customer)).toBeTruthy();
    });

    it('return false if customer has an invalid field', () => {
        const customer = {
            name: 'string',
            surname: 'string',
            additionalIdentifier: 'string',
            phone: 'string',
            birthday: new Date(),
            notes: undefined,
            invalid: [],
        };

        expect(isNewCustomer(customer)).toBeFalsy();
    });

    it('return false if customer has an invalid type', () => {
        const customer = {
            name: 'string',
            surname: 'string',
            additionalIdentifier: 'string',
            phone: 'string',
            birthday: NaN,
            notes: undefined,
        };

        expect(isNewCustomer(customer)).toBeFalsy();
    });

    it('return false if customer has not a required field', () => {
        const customer = {
            // name: 'string',
            surname: 'string',
            additionalIdentifier: 'string',
            phone: 'string',
            birthday: new Date(),
            notes: undefined,
        };

        expect(isNewCustomer(customer)).toBeFalsy();
    });
});

describe('isNewEmployee type guard', () => {
    it('return true if employee is correct', () => {
        let employee: NewEmployee = {
            name: 'string',
            weekWorkingShifts: { monday: [{ startTime: { hour: 1, minute: 22 }, endTime: { hour: 6, minute: 22 } }] },
            holidays: [{ startDay: new Date(), endDay: new Date() }],
        };

        expect(isNewEmployee(employee)).toBeTruthy();

        employee = {
            name: 'string',
            holidays: [{ startDay: new Date(), endDay: new Date() }],
        };

        expect(isNewEmployee(employee)).toBeTruthy();

        employee = {
            name: 'string',
        };

        expect(isNewEmployee(employee)).toBeTruthy();
    });

    it('return false if employee has an invalid field', () => {
        const employee = {
            name: 'string',
            weekWorkingShifts: { monday: [{ startTime: { hour: 1, minute: 22 }, endTime: { hour: 6, minute: 22 } }] },
            holidays: [{ startDay: new Date(), endDay: new Date() }],
            invalid: [],
        };

        expect(isNewEmployee(employee)).toBeFalsy();
    });

    it('return false if employee has an invalid type', () => {
        let employee: any = {
            name: 'string',
            weekWorkingShifts: {
                monday: [{ startTime: { hour: 'string', minute: 22 }, endTime: { hour: 6, minute: 22 } }],
            },
            holidays: [{ startDay: new Date(), endDay: new Date() }],
        };
        expect(isNewEmployee(employee)).toBeFalsy();

        employee = {
            name: 'string',
            weekWorkingShifts: {
                monday: [{ startTime: { invalid: 1, minute: 22 }, endTime: { hour: 6, minute: 22 } }],
            },
            holidays: [{ startDay: new Date(), endDay: new Date() }],
        };
        expect(isNewEmployee(employee)).toBeFalsy();

        employee = {
            name: 'string',
            weekWorkingShifts: {
                invalid: [{ startTime: { hour: 1, minute: 22 }, endTime: { hour: 6, minute: 22 } }],
            },
            holidays: [{ startDay: new Date(), endDay: new Date() }],
        };
        expect(isNewEmployee(employee)).toBeFalsy();

        employee = {
            name: 'string',
            weekWorkingShifts: { monday: { startTime: { hour: 1, minute: 22 }, endTime: { hour: 6, minute: 22 } } },
            holidays: [{ startDay: new Date(), endDay: new Date() }],
        };
        expect(isNewEmployee(employee)).toBeFalsy();

        employee = {
            name: 'string',
            weekWorkingShifts: { monday: [{ startTime: { hour: 1, minute: 22 }, endTime: { hour: 6, minute: 22 } }] },
            holidays: [{ startDay: 'string', endDay: new Date() }],
        };
        expect(isNewEmployee(employee)).toBeFalsy();

        employee = {
            name: 'string',
            weekWorkingShifts: { monday: [{ startTime: { hour: 1, minute: 22 }, endTime: { hour: 6, minute: 22 } }] },
            holidays: [{ invalid: new Date(), endDay: new Date() }],
        };
        expect(isNewEmployee(employee)).toBeFalsy();

        employee = {
            name: 'string',
            weekWorkingShifts: { monday: [{ startTime: { hour: 1, minute: 22 }, endTime: { hour: 6, minute: 22 } }] },
            holidays: { startDay: new Date(), endDay: new Date() },
        };
        expect(isNewEmployee(employee)).toBeFalsy();
    });

    it('return false if employee has not a required field', () => {
        const employee = {
            // name: 'string',
            weekWorkingShifts: { monday: [{ startTime: { hour: 1, minute: 22 }, endTime: { hour: 6, minute: 22 } }] },
            holidays: [{ startDay: new Date(), endDay: new Date() }],
        };

        expect(isNewEmployee(employee)).toBeFalsy();
    });
});

describe('isNewService type guard', () => {
    it('return true if service is correct', () => {
        const service: NewService = {
            name: 'string',
            averageDuration: 20,
        };

        expect(isNewService(service)).toBeTruthy();
    });

    it('return false if service has an invalid field', () => {
        const service = {
            name: 'string',
            averageDuration: 20,
            invalid: 10,
        };

        expect(isNewService(service)).toBeFalsy();
    });

    it('return false if service has an invalid type', () => {
        const service = {
            name: 'string',
            averageDuration: 'string',
        };

        expect(isNewService(service)).toBeFalsy();
    });

    it('return false if service has not a required field', () => {
        const service = {
            // name: 'string',
            averageDuration: 20,
        };

        expect(isNewService(service)).toBeFalsy();
    });
});
