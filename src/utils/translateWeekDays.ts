import { WeekDays } from '../types';

/**
 * Translate the system day name in the user language da name
 * @param key The day name in english
 */
const translateWeekDays = (key: WeekDays) => {
    switch (key) {
        case 'monday':
            return 'Lunedì';
        case 'tuesday':
            return 'Martedì';
        case 'wednesday':
            return 'Mercoledì';
        case 'thursday':
            return 'Giovedì';
        case 'friday':
            return 'Venerdì';
        case 'saturday':
            return 'Sabato';
        case 'sunday':
            return 'Domenica';
    }
};

export default translateWeekDays;
