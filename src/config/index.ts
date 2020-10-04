import { WeekDays, HourMinute } from '../types';
let counter = 0;

/* -------------------------------------------------------------------------- */
/*                           Database configuration                           */
/* -------------------------------------------------------------------------- */

// IDs of the databases collections
export const RESERVATIONS_COLLECTION = 'reservations';
export const EMPLOYEES_COLLECTION = 'employees';
export const SERVICES_COLLECTION = 'services';
export const CUSTOMERS_COLLECTION = 'customers';

// Credentials for the sandbox database
export const SANDBOX_USERNAME = 'sandbox@demo.db';
export const SANDBOX_PASSWORD = 'sandbox';

/* -------------------------------------------------------------------------- */
/*                              App configuration                             */
/* -------------------------------------------------------------------------- */

// Key name of the employees order array in local storage
export const LS_EMPLOYEES_ORDER_KEY_NAME = 'employees_order';

// Minimum subdivision in minutes for the agenda. It should be a divisor of 60
export const MIN_STEP = 15;

// Hours of the longest service offered
export const MAX_SERVICE_DURATION_MINS = 3 * 60;

// Opening hour in HourMinute { hours(24), minutes }
export const OPENING_TIME: HourMinute = { hour: 8, minute: 0 };

// Closing hour in HourMinute { hours(24), minutes }
export const CLOSING_TIME: HourMinute = { hour: 20, minute: 0 };

/* -------------------------------------------------------------------------- */
/*                          Theming and localization                          */
/* -------------------------------------------------------------------------- */

// Progression of days according to the system
export const SYSTEM_ORDERED_DAYS: Array<WeekDays> = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
];

// Progression of days according to the user local regulation (it_IT)
export const WEEK_DAYS: Array<WeekDays> = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
];

// Reservation table sizes in px
export const CELLS_HEIGHT = 35;
export const CELLS_WIDTH = 200;
export const HEAD_COL_WIDTH = 70;

// Translations for material table
export const MATERIAL_TABLE_LOCALIZATION = {
    pagination: {
        labelRowsSelect: 'righe',
        labelRowsPerPage: 'Righe per pagina',
        firstAriaLabel: 'Prima pagina',
        firstTooltip: 'Prima pagina',
        previousAriaLabel: 'Pagina precedente',
        previousTooltip: 'Pagina precedente',
        nextAriaLabel: 'Pagina successiva',
        nextTooltip: 'Pagina successiva',
        lastAriaLabel: 'Ultima pagina',
        lastTooltip: 'Ultima pagina',
        labelDisplayedRows: '{from}-{to} di {count}',
    },
    toolbar: {
        searchTooltip: 'Cerca',
        searchPlaceholder: 'Cerca',
    },
    header: {
        actions: 'Azioni',
    },
    body: {
        emptyDataSourceMessage: 'Nessun elemento trovato',
        filterRow: {
            filterTooltip: 'Filtra',
        },
    },
};

// App date format
export const TIME_DATE_FORMAT = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
};

/* -------------------------------------------------------------------------- */
/*                    Constants derived from previous vars                    */
/* -------------------------------------------------------------------------- */

// Steps which has 1 hour
export const SEGMENTS_IN_1HOUR = 60 / MIN_STEP;
counter = 0;

// Array of progressive minutes steps within a hour
export const PROGRESSIVE_MINS_WITHIN_HOUR = new Array<number>(SEGMENTS_IN_1HOUR)
    .fill(0)
    .map(() => MIN_STEP * counter++);
counter = 0;

// Array of progressive minutes steps within MAX_SERVICE_DURATION_MINS without the first element (zero)
export const PROGRESSIVE_MINS_WITHIN_MAX_SERVICE = new Array<number>(
    Math.floor(MAX_SERVICE_DURATION_MINS / MIN_STEP) + 1,
)
    .fill(0)
    .map(() => MIN_STEP * counter++)
    .slice(1);
counter = 0;

// Array of progressive HourMinute steps within a business day
export const PROGRESSIVE_HOURS_WITHIN_BUSINESS_DAY: Array<HourMinute> = new Array<string>(
    Math.floor(
        (Math.abs(CLOSING_TIME.hour - OPENING_TIME.hour) * 60 +
            Math.abs(CLOSING_TIME.minute - OPENING_TIME.minute) +
            MIN_STEP) /
            MIN_STEP,
    ),
)
    .fill('')
    .map(() => {
        const totalMinutes = MIN_STEP * counter++;
        const hour = Math.floor(totalMinutes / 60) + OPENING_TIME.hour;
        const minute = (totalMinutes % 60) + OPENING_TIME.minute;
        return { hour, minute };
    });
