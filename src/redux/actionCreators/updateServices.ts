import firebase from 'firebase/app';

import { SERVICES_COLLECTION } from '../../config';
import { Service, isNewService, UpdateServicesCreator } from '../../types';
import checkSync from './checkSync';

/**
 * Synchronize the redux store with the database
 * @param collectionSnapshot The Firestore collection snapshot
 */
const updateServices: UpdateServicesCreator = (
    collectionSnapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>,
) => (dispatch, getState): void => {
    const services = collectionSnapshot.docs.reduce((docs: Array<Service>, docSnapshot) => {
        const doc = docSnapshot.data();
        if (isNewService(doc)) {
            const service: Service = {
                id: docSnapshot.id,
                ...doc,
            };
            docs.push(service);
        } else
            console.warn(
                `The document in in "${SERVICES_COLLECTION}" collection with id "${docSnapshot.id}" didn't pass the validation. Check this document on the database`,
            );

        return docs;
    }, []);

    dispatch({
        type: 'UPDATE_SERVICES',
        services,
    });

    if (!getState().status.firebaseSync) dispatch(checkSync());
};

export default updateServices;
