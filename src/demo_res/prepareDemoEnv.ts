/**
 * This module is dynamically loaded in the sandbox env only and provides support for
 * generating dummy data for the demo site. Disable this behavior from src/index
 */
import { addDays, differenceInMonths } from 'date-fns';
import { Store } from 'redux';

import { Employee, Reservation, RootState } from '../types';
import {
    addCustomer,
    addReservation,
    getReservationsByDate,
    addEmployee,
    addService,
    deleteEmployee,
    deleteReservation,
} from '../utils';
import { PROGRESSIVE_HOURS_WITHIN_BUSINESS_DAY, PROGRESSIVE_MINS_WITHIN_HOUR, WEEK_DAYS } from '../config';

declare global {
    interface Array<T> {
        random(): T;
    }
}
Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
};

/**
 * Check for anomalies in the database data and populate with dummy data if there are not enough
 * for the demonstration.
 * @param store Redux store instance
 */
const prepareDemoEnv = async (store: Store<RootState>) => {
    const {
        database: { reservations, employees, customers, services },
    } = store.getState();

    let _reservations = [...(reservations || [])];
    const _employees = [...(employees || [])];
    const _customers = [...(customers || [])];
    const _services = [...(services || [])];

    const today = new Date();

    // Delete employees if more then 4 members
    while (_employees.length > 4) {
        deleteEmployee(_employees.pop() as Employee);
    }

    // Delete reservations older than 3 months
    _reservations = _reservations.reduce((prev, curr) => {
        if (differenceInMonths(curr.date, today) > 3) deleteReservation(curr);
        else prev.push(curr);
        return prev;
    }, [] as Array<Reservation>);

    // Delete reservations with partial/incomplete info
    _reservations = _reservations.reduce<Array<Reservation>>((prev, curr) => {
        if (
            _customers.map((customer) => customer.id).includes(curr.customerId) &&
            _services.map((service) => service.id).includes(curr.serviceId) &&
            _employees.map((employee) => employee.id).includes(curr.employeeId)
        )
            prev.push(curr);
        else deleteReservation(curr);
        return prev;
    }, [] as Array<Reservation>);

    // If there are fewer than 3 services, create new ones
    if (_services.length < 3) {
        const data = new FormData();
        const defServices = [
            {
                name: 'Fire bath',
                averageDuration: '60',
            },
            {
                name: 'Teeth tanning',
                averageDuration: '75',
            },
            {
                name: 'Feet removal',
                averageDuration: '90',
            },
        ];

        for (let i = 0; i < defServices.length; i++) {
            Object.entries(defServices[i]).forEach(([key, value]) => data.set(key, value));

            if (!_services.some((service) => service.name === defServices[i].name)) {
                _services.push(await addService(data));
            }
        }
    }

    // If there are fewer than 4 employees, add up to 4 more
    if (_employees.length < 4) {
        let placed = _employees.length;
        const data = new FormData();
        const defEmployees = ['Emma', 'Liam', 'Sophia', 'Oliver'];

        // Array of start-end hour individual daily shift
        const shifts = [
            [
                [8, 11],
                [14, 17],
            ],
            [
                [9, 12],
                [13, 17],
            ],
            [
                [12, 14],
                [16, 18],
            ],
            [
                [10, 13],
                [14, 17],
            ],
        ];

        while (placed < 4) {
            const i = Math.floor(Math.random() * defEmployees.length);
            data.set('name', defEmployees[i]);

            if (!_employees.some((employee) => employee.name === defEmployees[i])) {
                _employees.push(
                    await addEmployee(
                        data,
                        Object.fromEntries(
                            WEEK_DAYS.map((dayName) => [
                                dayName,
                                shifts[i].map(([start, end]) => ({
                                    startTime: { hour: start, minute: 0 },
                                    endTime: { hour: end, minute: 0 },
                                })),
                            ]),
                        ),
                    ),
                );

                placed++;
            }
        }
    }

    // If there are fewer than 4 customers, create new ones
    if (_customers.length < 4) {
        const data = new FormData();
        const defCustomers = [
            {
                name: 'Kyle',
                surname: 'Broflovski',
                additionalIdentifier: 'The Human Kite',
                phone: '123456789',
                notes: 'This note is attached to Kyle',
            },
            {
                name: 'Eric',
                surname: 'Cartman',
                additionalIdentifier: 'The Coon',
                phone: '234567891',
                notes: 'This note is attached to Eric',
            },
            {
                name: 'Stan',
                surname: 'Marsh',
                additionalIdentifier: 'Toolshed',
                phone: '345678912',
                notes: 'This note is attached to Stan',
            },
            {
                name: 'Kenny',
                surname: 'McCormick',
                additionalIdentifier: 'Mysterion',
                phone: '456789123',
                notes: 'This note is attached to Kenny',
            },
        ];

        for (let i = 0; i < defCustomers.length; i++) {
            Object.entries(defCustomers[i]).forEach(([key, value]) => data.set(key, value));
            if (!_customers.some((customer) => customer.name === defCustomers[i].name)) {
                _customers.push(await addCustomer(data, i === 3 ? addDays(today, 1) : null));
            }
        }
    }

    // If there are fewer than 10 reservations today, create them with random hour
    const reservationsToday = getReservationsByDate(_reservations, today);
    if (!reservationsToday || reservationsToday.length < 10) {
        let placed = reservationsToday.length;

        while (placed < 10) {
            const reservationDate = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                PROGRESSIVE_HOURS_WITHIN_BUSINESS_DAY.random().hour,
                PROGRESSIVE_MINS_WITHIN_HOUR.random(),
            );

            const data = new FormData();
            data.set('employeeId', _employees.random().id);
            data.set('customerId', _customers.random().id);
            data.set('serviceId', _services.random().id);
            data.set('notes', 'This note is attached to the reservation');

            try {
                const newReservation = await addReservation(data, _customers.random(), reservationDate, {
                    employees: _employees,
                    reservations: _reservations,
                    services: _services,
                });

                _reservations.push(newReservation);
                placed++;
            } catch (_e) {
                continue;
            }
        }
    }
};

export default prepareDemoEnv;
