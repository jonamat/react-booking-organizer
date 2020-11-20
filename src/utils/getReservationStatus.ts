import { addMinutes } from 'date-fns';

/**
 * Calculate if a given reservation is ongoing, done or not started
 * @param startTime Starting time of the reservation
 * @param serviceDurationMins Service duration in minutes
 * @returns A 'DONE', 'ONGOING' or 'UNINITIATED' string
 */
const getReservationStatus = (startTime: Date, serviceDurationMins: number): 'DONE' | 'ONGOING' | 'UNINITIATED' => {
    const now = Date.now();
    const endTime = addMinutes(new Date(startTime.getTime()), serviceDurationMins);

    if (endTime.getTime() > now && startTime.getTime() < now) return 'ONGOING';
    else if (endTime.getTime() < now) return 'DONE';
    else return 'UNINITIATED';
};

export default getReservationStatus;
