/**
 * Unit test suite
 *
 * Target: isEmployeeBusy
 * Tests:
 * - Warning emitting
 * - Functionality
 */

// Test configuration
import { Reservation, NewReservation, Service } from '../../types';

// Component to test
import isEmployeeBusy from '../isEmployeeBusy';

const mockConsoleWarn = jest.fn();
Object.defineProperty(console, 'warn', {
    get() {
        return mockConsoleWarn;
    },
});

const newReservation: NewReservation = {
    date: new Date('1 Jan 2020 10:00 GMT+0100'),
    serviceId: 's1',
    customerId: 'c1',
    employeeId: 'e1',
};
const services: Service[] = [
    {
        id: 's1',
        name: 'service 1',
        averageDuration: 30,
    },
];
const reservations: Reservation[] = [
    {
        id: 'r1',
        date: new Date('1 Jan 2020 10:00 GMT+0100'),
        serviceId: 's1',
        customerId: 'c1',
        employeeId: 'e1',
    },
];

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('isEmployeeBusy fn', () => {
    it('returns true if employee is busy', () => {
        expect(isEmployeeBusy(newReservation, services, reservations)).toBeTruthy();
    });

    it('returns false if employee is not busy', () => {
        expect(
            isEmployeeBusy({ ...newReservation, date: new Date('1 Jan 2021 10:00 GMT+0100') }, services, reservations),
        ).toBeFalsy();
    });

    it('emit a console error if service is missing', () => {
        expect(isEmployeeBusy(newReservation, [], reservations)).toBeTruthy();
        expect(mockConsoleWarn).toBeCalledTimes(1);
    });

    it('returns false if user are trying to edit a reservation', () => {
        expect(isEmployeeBusy(newReservation, services, reservations, reservations[0].id)).toBeFalsy();
    });
});
