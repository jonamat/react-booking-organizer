import firebase from 'firebase/app';

import { RESERVATIONS_COLLECTION } from '../config';
import { Reservation } from '../types';

/**
 * Delete a specific reservation
 * @param reservation Reservation to delete
 */
const deleteReservation = async (reservation: Reservation): Promise<void> => {
    try {
        await firebase.firestore().collection(RESERVATIONS_COLLECTION).doc(reservation.id).delete();
    } catch (error) {
        console.error(error);
        throw new Error('Errore interno. Contatta il supporto tecnico');
    }
};

export default deleteReservation;
