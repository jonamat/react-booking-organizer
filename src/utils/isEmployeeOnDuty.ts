import { isWithinInterval } from 'date-fns';

import { Employee, WorkingShift } from './../types';
import { SYSTEM_ORDERED_DAYS } from '../config';

/**
 * Check if an employee is on duty in a specific Date
 * @param date The date to use
 * @param employee The employee to check
 */
const isEmployeeOnDuty = (date: Date, { holidays, weekWorkingShifts }: Employee): boolean => {
    try {
        // Compare all the holiday intervals with the given date
        const isOnHoliday = holidays?.some(({ startDay, endDay }) => {
            const interval: Interval = {
                start: startDay,
                end: endDay,
            };
            return isWithinInterval(date, interval);
        });

        // The employee is on vacation, do not continue
        if (isOnHoliday) return false;

        // The employee has not working shifts. He works always. Like me :( do not continue
        if (!weekWorkingShifts || !Object.keys(weekWorkingShifts).length) return true;

        // Get the name of the day in the given date
        const dayName = SYSTEM_ORDERED_DAYS[date.getDay()];

        // Not on duty the whole day, do not continue
        if (!weekWorkingShifts[dayName]) return false;

        // Compares work shifts intervals with the given date
        return (weekWorkingShifts[dayName] as Array<WorkingShift>).some((shift) => {
            const interval: Interval = {
                start: new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    shift.startTime.hour,
                    shift.startTime.minute,
                ),
                end: new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    shift.endTime.hour,
                    shift.endTime.minute,
                ),
            };

            return isWithinInterval(date, interval);
        });
    } catch (error) {
        // Prevents date-fns errors
        return false;
    }
};

export default isEmployeeOnDuty;
