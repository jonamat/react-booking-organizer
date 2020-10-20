import firebase from 'firebase/app';

import { Service } from '../types';
import { SERVICES_COLLECTION } from '../config';

/**
 * Delete a specific service
 * @param service Service to delete
 */
const deleteService = async (service: Service): Promise<void> => {
    try {
        await firebase.firestore().collection(SERVICES_COLLECTION).doc(service.id).delete();
    } catch (error) {
        console.error(error);
        throw new Error('Errore interno. Contatta il supporto tecnico');
    }
};

export default deleteService;
