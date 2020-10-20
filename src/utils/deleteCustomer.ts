import firebase from 'firebase/app';

import { Customer, Reservation } from '../types';
import { CUSTOMERS_COLLECTION } from '../config';

/**
 * Delete a specific customer and all related reservations
 * @param reservations Reservation array
 * @param customer Customer to delete
 */
const deleteCustomer = async (reservations: Array<Reservation>, customer: Customer): Promise<void> => {
    try {
        const personalReservations = reservations.filter((reservation) => reservation.customerId === customer.id);
        if (!personalReservations) throw new Error();

        await Promise.all([
            ...personalReservations.map((reservation) =>
                firebase.firestore().collection('reservations').doc(reservation.id).delete(),
            ),
            firebase.firestore().collection(CUSTOMERS_COLLECTION).doc(customer.id).delete(),
        ]);
    } catch (error) {
        console.error(error);
        throw new Error('Errore interno. Contatta il supporto tecnico');
    }
};

export default deleteCustomer;
