import { isOffline } from '../redux';

/**
 * Trigger a state change on connection changes
 * @param dispatch Redux dispatch function
 */
const connectionListener = (dispatch) => {
    // First check
    dispatch(isOffline(!navigator.onLine));

    window.addEventListener('online', () => dispatch(isOffline(false)));
    window.addEventListener('offline', () => dispatch(isOffline(true)));
};

export default connectionListener;
