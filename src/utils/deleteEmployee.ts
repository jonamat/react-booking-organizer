import firebase from 'firebase/app';

import { Employee } from '../types';
import { EMPLOYEES_COLLECTION } from '../config';

/**
 * Delete a specific employee
 * @param employee Employee to delete
 */
const deleteEmployee = async (employee: Employee): Promise<void> => {
    try {
        await firebase.firestore().collection(EMPLOYEES_COLLECTION).doc(employee.id).delete();
    } catch (error) {
        console.error(error);
        throw new Error('Errore interno. Contatta il supporto tecnico');
    }
};

export default deleteEmployee;
