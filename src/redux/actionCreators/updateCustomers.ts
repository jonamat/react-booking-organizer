import firebase from 'firebase/app';

import { Customer, isNewCustomer, UpdateCustomersCreator } from '../../types';
import { CUSTOMERS_COLLECTION } from '../../config';
import checkSync from './checkSync';
import { checkForBirthdays } from '..';

/**
 * Synchronize the Redux store with the database
 * @param collectionSnapshot The Firestore collection snapshot
 */
const updateCustomers: UpdateCustomersCreator = (
    collectionSnapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>,
) => (dispatch, getState) => {
    const customers = collectionSnapshot.docs.reduce((docs: Array<Customer>, docSnapshot) => {
        const doc = docSnapshot.data();

        // Convert Firebase Date type in a Date instance
        if (doc.birthday) doc.birthday = new Date(doc.birthday.seconds * 1000);

        if (isNewCustomer(doc)) {
            const customer: Customer = {
                id: docSnapshot.id,
                ...doc,
            };
            docs.push(customer);
        } else
            console.warn(
                `The document in "${CUSTOMERS_COLLECTION}" collection with id "${docSnapshot.id}" didn't pass the validation. Check this document on the database`,
            );

        return docs;
    }, []);

    dispatch({
        type: 'UPDATE_CUSTOMERS',
        customers,
    });

    // Recheck for birthdays modifications
    dispatch(checkForBirthdays());

    if (!getState().status.firebaseSync) dispatch(checkSync());
};

export default updateCustomers;
