import firebase from 'firebase/app';

import { RESERVATIONS_COLLECTION } from '../../config';
import { Reservation, isNewReservation, UpdateReservationsCreator } from '../../types';
import checkSync from './checkSync';

/**
 * Synchronize the redux store with the database
 * @param collectionSnapshot The Firestore collection snapshot
 */
const updateReservations: UpdateReservationsCreator = (
    collectionSnapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>,
) => (dispatch, getState): void => {
    const reservations = collectionSnapshot.docs.reduce((docs: Array<Reservation>, docSnapshot) => {
        const doc = docSnapshot.data();

        // Convert Firebase Date type in a Date instance
        if (doc.date?.seconds) doc.date = new Date(doc.date.seconds * 1000);

        if (isNewReservation(doc)) {
            const reservation: Reservation = {
                id: docSnapshot.id,
                ...doc,
            };

            docs.push(reservation);
        } else
            console.warn(
                `The document in "${RESERVATIONS_COLLECTION}" collection with id "${docSnapshot.id}" didn't pass the validation. Check this document on the database`,
            );

        return docs;
    }, []);

    dispatch({
        type: 'UPDATE_RESERVATIONS',
        reservations,
    });

    if (!getState().status.firebaseSync) dispatch(checkSync());
};

export default updateReservations;
