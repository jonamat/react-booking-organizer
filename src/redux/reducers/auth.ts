import { AuthReducer, AuthActionTypes } from '../../types';
import { Reducer } from 'redux';

const initialState: AuthReducer = {
    logged: null,
};

const auth: Reducer<AuthReducer, AuthActionTypes> = (state = initialState, action) => {
    switch (action.type) {
        case 'IS_LOGGED':
            return {
                ...state,
                logged: action.isLogged,
            };

        default:
            return state;
    }
};

export default auth;
