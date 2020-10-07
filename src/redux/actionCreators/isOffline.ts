import { IsOfflineCreator } from '../../types';

/**
 * Change the connection status
 * @param isOffline True if the network is unreachable
 */
const isOffline: IsOfflineCreator = (isOffline: boolean) => (dispatch): void => {
    dispatch({
        type: 'IS_OFFLINE',
        isOffline,
    });
};

export default isOffline;
