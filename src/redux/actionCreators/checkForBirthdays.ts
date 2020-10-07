import { isValid, isWithinInterval, startOfDay, endOfDay, setYear } from 'date-fns';

import { UpdateBirthdaysTodayCreator } from '../../types';
import displayBirthdayNotification from './displayBirthdayNotification';

/**
 * Check if there are customers who have a birthday today
 */
const checkForBirthdays: UpdateBirthdaysTodayCreator = () => (dispatch, getState) => {
    const {
        database: { customers },
    } = getState();

    const today = new Date();

    const birthdaysToday =
        customers?.filter(
            (customer) =>
                customer.birthday &&
                isValid(customer.birthday) &&
                isWithinInterval(setYear(customer.birthday, today.getFullYear()), {
                    start: startOfDay(today),
                    end: endOfDay(today),
                }),
        ).length || 0;

    if (birthdaysToday) {
        dispatch(displayBirthdayNotification());
    }

    dispatch({
        type: 'UPDATE_BIRTHDAYS_TODAY',
        birthdaysToday,
    });
};

export default checkForBirthdays;
