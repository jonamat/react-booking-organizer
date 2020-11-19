import { addMinutes, isSameDay, areIntervalsOverlapping } from 'date-fns';

import { NewReservation, Service, Reservation } from './../types';

/**
 * Calculate if a given employee is busy in the time interval of a new reservation
 * @param newReservation The new Reservation that you are assigning to the employee
 * @param services Services array from redux store
 * @param reservations Reservations array from redux store
 * @param id Required if you are editing a booking to avoid overlapping
 * @returns True if the employee is busy in that given time interval
 */
const isEmployeeBusy = (
    newReservation: NewReservation,
    services: Array<Service>,
    reservations: Array<Reservation>,
    id?: string,
): boolean => {
    const newReservationService = services.find((service) => service.id === newReservation.serviceId);
    // Internal error - prevent assignment
    if (!newReservationService) {
        console.warn('Internal error - newReservation has not a valid service id');
        return true;
    }

    // Calculate the interval of the given reservation
    const newReservationInterval: Interval = {
        start: newReservation.date,
        end: addMinutes(new Date(newReservation.date), newReservationService.averageDuration),
    };

    // Get all the reservations assigned to the given employee
    const employeeReservations = reservations.filter(
        (reservation) => reservation.employeeId === newReservation.employeeId,
    );

    // Employee has no reservation assigned, do not continue
    if (!employeeReservations.length) return false;

    // Get all the reservations assigned to the employee in the same day of the given reservation
    const reservationsInDate = employeeReservations.filter((reservation) =>
        isSameDay(reservation.date, newReservation.date),
    );

    // Employee has no reservation assigned that day, do not continue
    if (!reservationsInDate.length) return false;

    // Check if a reservation assigned to the employee overlaps the given reservation
    const reservationOverlap = reservationsInDate.find((reservation) => {
        const service = services.find((service) => service.id === reservation.serviceId);
        // Service deleted, we cannot know the duration, do not continue
        if (!service) return false;

        const interval: Interval = {
            start: reservation.date,
            end: addMinutes(new Date(reservation.date), service.averageDuration),
        };

        return areIntervalsOverlapping(newReservationInterval, interval);
    });

    // No reservation overlaps, do not continue
    if (!reservationOverlap) return false;

    // Overlapping reservation is the same reservation (es: small hour change),  do not continue
    if (id && reservationOverlap.id === id) return false;
    // The employee is actually busy
    else return true;
};

export default isEmployeeBusy;
