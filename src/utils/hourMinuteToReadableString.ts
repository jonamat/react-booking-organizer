import { HourMinute } from '../types';

/**
 * Converts a HourMinute instance to a human-readable string
 * ex. { 7, 40 } => 07:40
 * @param hourMinute HourMinute instance
 */
const hourMinuteToReadableString = ({ hour, minute }: HourMinute): string => {
    return `${hour < 10 ? '0' + hour.toString() : hour.toString()}:${
        minute < 10 ? '0' + minute.toString() : minute.toString()
    }`;
};

export default hourMinuteToReadableString;
