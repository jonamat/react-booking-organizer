import { WEEK_DAYS } from './config';

/* -------------------------------------------------------------------------- */
/*                                    Utils                                   */
/* -------------------------------------------------------------------------- */

export type HourMinute = {
    hour: number;
    minute: number;
};

export type WorkingShift = {
    startTime: HourMinute;
    endTime: HourMinute;
};

export type WeekDays = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type WeekWorkingShifts = {
    [key in WeekDays]?: Array<WorkingShift>;
};

export interface Holiday {
    startDay: Date;
    endDay: Date;
}

/* -------------------------------------------------------------------------- */
/*                                Reservations                                */
/* -------------------------------------------------------------------------- */

export interface Reservation {
    id: string;
    date: Date;
    serviceId: string;
    customerId: string;
    employeeId: string;
    notes?: string;
}
export type NewReservation = Omit<Reservation, 'id'>;
export function isNewReservation(obj: any): obj is NewReservation {
    if (typeof obj !== 'object' || obj === null) return false;
    return (
        Object.keys(obj).every((key) => {
            if (obj[key] === undefined) return true;
            switch (key) {
                case 'date':
                    return obj[key] instanceof Date;
                case 'serviceId':
                case 'customerId':
                case 'employeeId':
                case 'notes':
                    return typeof obj[key] === 'string';
                default:
                    return false;
            }
        }) && ['date', 'serviceId', 'customerId', 'employeeId'].every((required) => !!obj[required])
    );
}

/* -------------------------------------------------------------------------- */
/*                                  Customers                                 */
/* -------------------------------------------------------------------------- */

export interface Customer {
    id: string;
    name: string;
    surname?: string;
    additionalIdentifier?: string;
    phone?: string;
    birthday?: Date;
    notes?: string;
}
export type NewCustomer = Omit<Customer, 'id'>;

export function isNewCustomer(obj: any): obj is NewCustomer {
    if (typeof obj !== 'object' || obj === null) return false;
    return (
        Object.keys(obj).every((key) => {
            if (obj[key] === undefined) return true;
            switch (key) {
                case 'name':
                case 'surname':
                case 'additionalIdentifier':
                case 'phone':
                case 'notes':
                    return typeof obj[key] === 'string';
                case 'birthday':
                    return obj[key] instanceof Date;
                default:
                    return false;
            }
        }) && obj.name
    );
}

/* -------------------------------------------------------------------------- */
/*                                  Employees                                 */
/* -------------------------------------------------------------------------- */

export interface Employee {
    id: string;
    name: string;
    weekWorkingShifts?: WeekWorkingShifts;
    holidays?: Array<Holiday>;
}
export type NewEmployee = Omit<Employee, 'id'>;

export function isHoliday(obj: any): obj is Holiday {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        Object.entries(obj).every(([key, date]) => ['startDay', 'endDay'].includes(key) && date instanceof Date)
    );
}

export function isWorkingShift(obj: any): obj is WorkingShift {
    if (typeof obj !== 'object' || obj === null) return false;
    return Object.entries(obj).every(
        ([key, hourMinute]) =>
            ['startTime', 'endTime'].includes(key) &&
            Object.entries(hourMinute as HourMinute).every(
                ([key, value]) => ['hour', 'minute'].includes(key) && typeof value === 'number',
            ),
    );
}

export function isWeekWorkingShifts(obj: any): obj is WeekWorkingShifts {
    if (typeof obj !== 'object' || obj === null) return false;
    return Object.entries(obj).every(([key, workingShifts]) => {
        if (!WEEK_DAYS.includes(key as WeekDays)) return false;
        if (typeof workingShifts === 'undefined') return true;
        return Array.isArray(workingShifts) && workingShifts.every((workingShift) => isWorkingShift(workingShift));
    });
}

export function isNewEmployee(obj: any): obj is NewEmployee {
    if (typeof obj !== 'object' || obj === null) return false;
    return (
        Object.keys(obj).every((key) => {
            if (obj[key] === undefined) return true;
            switch (key) {
                case 'name':
                    return typeof obj[key] === 'string';
                case 'weekWorkingShifts':
                    return obj.weekWorkingShifts === null || isWeekWorkingShifts(obj.weekWorkingShifts);
                case 'holidays':
                    return (
                        obj.holidays === null ||
                        (Array.isArray(obj.holidays) && obj.holidays.every((holiday) => isHoliday(holiday)))
                    );
                default:
                    return false;
            }
        }) && obj.name
    );
}

/* -------------------------------------------------------------------------- */
/*                                  Services                                  */
/* -------------------------------------------------------------------------- */

export interface Service {
    id: string;
    name: string;
    averageDuration: number; // hourly brackets
}
export type NewService = Omit<Service, 'id'>;

export function isNewService(obj: any): obj is NewService {
    if (typeof obj !== 'object' || obj === null) return false;
    return (
        Object.keys(obj).every((key) => {
            if (obj[key] === undefined) return true;
            switch (key) {
                case 'name':
                    return typeof obj[key] === 'string';
                case 'averageDuration':
                    return typeof obj[key] === 'number' && !isNaN(obj[key]);
                default:
                    return false;
            }
        }) && obj.name
    );
}

/* -------------------------------------------------------------------------- */
/*                                 REDUX TYPES                                */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- Utils --------------------------------- */
export type Thunk<A> = {
    (...args: Array<any>): {
        (dispatch: (action: A | ((...args: any) => void)) => void, getState: () => RootState): void;
    };
};

export interface DialogStatus {
    open: boolean;
    title: string | null;
    content: JSX.Element | null;
}

/* -------------------------------------------------------------------------- */
/*                                  Database                                  */
/* -------------------------------------------------------------------------- */

/* -------------------------------- Reducers -------------------------------- */
export interface DatabaseReducer {
    customers: Array<Customer> | null;
    reservations: Array<Reservation> | null;
    employees: Array<Employee> | null;
    services: Array<Service> | null;
}

/* --------------------------------- Actions -------------------------------- */
export interface ResetDatabaseAction {
    readonly type: 'RESET_DATA';
}
export interface UpdateCustomersAction {
    readonly type: 'UPDATE_CUSTOMERS';
    customers: Array<Customer>;
}
export interface UpdateReservationsAction {
    readonly type: 'UPDATE_RESERVATIONS';
    reservations: Array<Reservation>;
}
export interface UpdateEmployeesAction {
    readonly type: 'UPDATE_EMPLOYEES';
    employees: Array<Employee>;
}
export type UpdateServicesAction = {
    readonly type: 'UPDATE_SERVICES';
    services: Array<Service>;
};

/* ----------------------------- Action creators ---------------------------- */
export type UpdateCustomersCreator = Thunk<UpdateCustomersAction>;
export type UpdateReservationsCreator = Thunk<UpdateReservationsAction>;
export type UpdateEmployeesCreator = Thunk<UpdateEmployeesAction>;
export type UpdateServicesCreator = Thunk<UpdateServicesAction>;

/* -------------------------- Actions intersection -------------------------- */
export type DatabaseActionTypes =
    | ResetDatabaseAction
    | UpdateCustomersAction
    | UpdateReservationsAction
    | UpdateEmployeesAction
    | UpdateServicesAction;

/* -------------------------------------------------------------------------- */
/*                                   Status                                   */
/* -------------------------------------------------------------------------- */

/* -------------------------------- Reducers -------------------------------- */
export interface StatusReducer {
    offline: boolean;
    dialog: DialogStatus;
    employeesOrder: null | Array<string>;
    firebaseSync: boolean;
    birthdaysToday: number;
    birthdayNotificationWasDisplayed: boolean;
}

/* --------------------------------- Actions -------------------------------- */
export interface CheckSyncAction {
    readonly type: 'FIREBASE_SYNCHRONIZED';
    firebaseSync: boolean;
}
export interface IsOfflineAction {
    readonly type: 'IS_OFFLINE';
    isOffline: boolean;
}
export interface DialogAction {
    readonly type: 'CHANGE_DIALOG_STATUS';
    dialog: DialogStatus;
}
export interface MoveEmployeeAction {
    readonly type: 'UPDATE_EMPLOYEES_ORDER';
    employeesOrder: Array<string>;
}
export interface UpdateBirthdaysTodayAction {
    readonly type: 'UPDATE_BIRTHDAYS_TODAY';
    birthdaysToday: number;
}
export interface BirthdaysNotificationDisplayedAction {
    readonly type: 'BIRTHDAYS_NOTIFICATION_DISPLAYED';
    birthdayNotificationWasDisplayed: boolean;
}

/* ----------------------------- Action creators ---------------------------- */
export type IsOfflineCreator = Thunk<IsOfflineAction>;
export type DialogCreator = Thunk<DialogAction>;
export type MoveEmployeeCreator = Thunk<MoveEmployeeAction>;
export type CheckSyncCreator = Thunk<CheckSyncAction>;
export type UpdateBirthdaysTodayCreator = Thunk<UpdateBirthdaysTodayAction>;
export type BirthdaysNotificationDisplayedCreator = Thunk<BirthdaysNotificationDisplayedAction>;

/* -------------------------- Actions intersection -------------------------- */
export type StatusActionTypes =
    | IsOfflineAction
    | DialogAction
    | MoveEmployeeAction
    | CheckSyncAction
    | UpdateBirthdaysTodayAction
    | BirthdaysNotificationDisplayedAction;

/* -------------------------------------------------------------------------- */
/*                                    Auth                                    */
/* -------------------------------------------------------------------------- */

/* -------------------------------- Reducers -------------------------------- */
export interface AuthReducer {
    logged: boolean | null;
}

/* --------------------------------- Actions -------------------------------- */
export interface IsLoggedAction {
    readonly type: 'IS_LOGGED';
    isLogged: boolean;
}

/* ----------------------------- Action creators ---------------------------- */
export type IsLoggedCreator = Thunk<IsLoggedAction>;

/* -------------------------- Actions intersection -------------------------- */
export type AuthActionTypes = IsLoggedAction;

/* -------------------------------------------------------------------------- */
/*                                  RootState                                 */
/* -------------------------------------------------------------------------- */

export type RootState = {
    readonly auth: AuthReducer;
    readonly status: StatusReducer;
    readonly database: DatabaseReducer;
};
