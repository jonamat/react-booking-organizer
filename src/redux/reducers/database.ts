import { DatabaseReducer, DatabaseActionTypes } from '../../types';
import { Reducer } from 'redux';

const initialState: DatabaseReducer = {
    customers: null,
    reservations: null,
    employees: null,
    services: null,
};

const database: Reducer<DatabaseReducer, DatabaseActionTypes> = (state = initialState, action) => {
    switch (action.type) {
        case 'RESET_DATA': {
            return initialState;
        }

        case 'UPDATE_CUSTOMERS':
            return {
                ...state,
                customers: action.customers,
            };

        case 'UPDATE_RESERVATIONS':
            return {
                ...state,
                reservations: action.reservations,
            };

        case 'UPDATE_EMPLOYEES':
            return {
                ...state,
                employees: action.employees,
            };

        case 'UPDATE_SERVICES':
            return {
                ...state,
                services: action.services,
            };
        default:
            return state;
    }
};

export default database;
