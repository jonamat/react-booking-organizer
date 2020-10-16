import firebase from 'firebase/app';

import { NewCustomer, isNewCustomer, Customer } from '../types';
import { CUSTOMERS_COLLECTION } from '../config';

const REQUIRED_FIELDS = ['name'];

/**
 * Validate user inputs and send them to database
 * @param formData Raw data from form
 * @param birthday Birthday Date instance
 */
const addCustomer = async (formData: FormData, birthday: Date | null): Promise<Customer> => {
    if (REQUIRED_FIELDS.some((fieldName) => !formData.get(fieldName))) throw new Error('Compila i campi obbligatori');

    const newCustomer: any = {
        name: formData.get('name') || undefined,
        surname: formData.get('surname') || undefined,
        additionalIdentifier: formData.get('additionalIdentifier') || undefined,
        phone: formData.get('phone') || undefined,
        birthday: birthday || undefined,
        notes: formData.get('notes') || undefined,
    };

    if (!isNewCustomer(newCustomer)) throw new Error('Errore interno. Contatta il supporto tecnico');

    // Delete empty values
    (Object.keys(newCustomer) as Array<keyof NewCustomer>).forEach((key) => {
        if (newCustomer[key] === undefined) delete newCustomer[key];
    });

    try {
        return {
            id: (await firebase.firestore().collection(CUSTOMERS_COLLECTION).add(newCustomer)).id,
            ...newCustomer,
        };
    } catch (error) {
        console.error(error);
        throw new Error('Connessione al database fallita');
    }
};

export default addCustomer;
