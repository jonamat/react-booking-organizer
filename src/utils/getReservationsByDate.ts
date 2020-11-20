import { Reservation } from '../types';

/**
 * Find all the reservation within a given day
 * @param reservations Array of the reservations to parse
 * @param date The Date instance of the day to use
 */
const getReservationsByDate = (reservations: Array<Reservation>, date: Date): Array<Reservation> => {
    const _date = new Date(date);
    const timestampInterval = Array(2);
    _date.setHours(0, 0, 0);
    timestampInterval[0] = _date.getTime();
    _date.setHours(23, 59, 59);
    timestampInterval[1] = _date.getTime();

    return reservations.filter(
        (reservation) =>
            reservation.date.getTime() > timestampInterval[0] && reservation.date.getTime() < timestampInterval[1],
    );
};

export default getReservationsByDate;
