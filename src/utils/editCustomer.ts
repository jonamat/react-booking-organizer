import firebase from 'firebase/app';

import { NewCustomer, isNewCustomer, Customer } from '../types';
import { CUSTOMERS_COLLECTION } from '../config';

const REQUIRED_FIELDS = ['name'];

/**
 * Validate user inputs and send them to database
 * @param id Document id to edit
 * @param formData Raw data from form
 * @param birthday Birthday Date instance
 */
const editCustomer = async (id: string, formData: FormData, birthday): Promise<Customer> => {
    if (REQUIRED_FIELDS.some((fieldName) => !formData.get(fieldName))) throw new Error('Compila i campi obbligatori');

    const newCustomer: any = {
        name: formData.get('name') || undefined,
        surname: formData.get('surname') || undefined,
        additionalIdentifier: formData.get('additionalIdentifier') || undefined,
        phone: formData.get('phone') || undefined,
        birthday: birthday || undefined,
        notes: formData.get('notes') || undefined,
    };

    if (!id || !isNewCustomer(newCustomer)) throw new Error('Errore interno. Contatta il supporto tecnico');

    // Delete empty values
    (Object.keys(newCustomer) as Array<keyof NewCustomer>).forEach((key) => {
        if (newCustomer[key] === undefined) delete newCustomer[key];
    });

    try {
        await firebase.firestore().collection(CUSTOMERS_COLLECTION).doc(id).set(newCustomer);
        return {
            id,
            ...newCustomer,
        };
    } catch (error) {
        console.error(error);
        throw new Error('Connessione al database fallita');
    }
};

export default editCustomer;
