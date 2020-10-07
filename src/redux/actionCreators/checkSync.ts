import { CheckSyncCreator } from '../../types';

/**
 * Check if all the database collections are synchronized with the store
 */
const checkSync: CheckSyncCreator = () => (dispatch, getState) => {
    const {
        database: { customers, employees, reservations, services },
    } = getState();

    if (customers && employees && reservations && services) {
        dispatch({
            type: 'FIREBASE_SYNCHRONIZED',
            firebaseSync: true,
        });
    }
};

export default checkSync;
