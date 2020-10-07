import { IsLoggedCreator } from '../../types';

/**
 * Change the auth status of the app
 * @param isLogged True if the user is logged
 */
const isLogged: IsLoggedCreator = (isLogged: boolean) => (dispatch): void => {
    dispatch({
        type: 'IS_LOGGED',
        isLogged,
    });
};

export default isLogged;
