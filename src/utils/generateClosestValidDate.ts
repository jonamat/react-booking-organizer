import { PROGRESSIVE_MINS_WITHIN_HOUR } from '../config';

/**
 * Generate the closest Date instance to PROGRESSIVE_MINS_WITHIN_HOUR starting from a given date
 * @param date the start Date
 * @returns a Date within PROGRESSIVE_MINS_WITHIN_HOUR
 */
const generateClosestValidDate = (): Date => {
    const date = new Date();
    const minutesNow = date.getMinutes();
    const nextHourlySplit = PROGRESSIVE_MINS_WITHIN_HOUR.reduce((prev, curr) =>
        Math.abs(curr - minutesNow) < Math.abs(prev - minutesNow) ? curr : prev,
    );
    date.setMinutes(nextHourlySplit);
    return date;
};

export default generateClosestValidDate;
