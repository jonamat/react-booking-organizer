import { StatusReducer, StatusActionTypes } from '../../types';
import { Reducer } from 'redux';

const initialState: StatusReducer = {
    offline: false,
    dialog: {
        open: false,
        title: null,
        content: null,
    },
    employeesOrder: null,
    firebaseSync: false,
    birthdaysToday: 0,
    birthdayNotificationWasDisplayed: false,
};

const status: Reducer<StatusReducer, StatusActionTypes> = (state = initialState, action) => {
    switch (action.type) {
        case 'IS_OFFLINE':
            return {
                ...state,
                offline: action.isOffline,
            };

        case 'CHANGE_DIALOG_STATUS':
            return {
                ...state,
                dialog: action.dialog,
            };

        case 'UPDATE_EMPLOYEES_ORDER':
            return {
                ...state,
                employeesOrder: action.employeesOrder,
            };

        case 'FIREBASE_SYNCHRONIZED':
            return {
                ...state,
                firebaseSync: action.firebaseSync,
            };

        case 'UPDATE_BIRTHDAYS_TODAY':
            return {
                ...state,
                birthdaysToday: action.birthdaysToday,
            };

        case 'BIRTHDAYS_NOTIFICATION_DISPLAYED':
            return {
                ...state,
                birthdayNotificationWasDisplayed: action.birthdayNotificationWasDisplayed,
            };

        default:
            return state;
    }
};

export default status;
