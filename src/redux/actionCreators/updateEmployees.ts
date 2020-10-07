import firebase from 'firebase/app';

import { EMPLOYEES_COLLECTION } from '../../config';
import { Employee, isNewEmployee, UpdateEmployeesCreator } from '../../types';
import checkSync from './checkSync';

/**
 * Synchronize the redux store with the database
 * @param collectionSnapshot The Firestore collection snapshot
 */
const updateEmployees: UpdateEmployeesCreator = (
    collectionSnapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>,
) => (dispatch, getState): void => {
    const employees = collectionSnapshot.docs.reduce((docs: Array<Employee>, docSnapshot) => {
        const doc = docSnapshot.data();

        // Convert Firebase Date type in a Date instance
        if (doc.holidays && Array.isArray(doc.holidays))
            doc.holidays.forEach((holiday, index) =>
                Object.entries(holiday).forEach(
                    ([key, value]) => (doc.holidays[index][key] = new Date((value as any).seconds * 1000)),
                ),
            );

        if (isNewEmployee(doc)) {
            const employee: Employee = {
                id: docSnapshot.id,
                ...doc,
            };

            docs.push(employee);
        } else
            console.warn(
                `The document in "${EMPLOYEES_COLLECTION}" collection with id "${docSnapshot.id}" didn't pass the validation. Check this document on the database`,
            );

        return docs;
    }, []);

    dispatch({
        type: 'UPDATE_EMPLOYEES',
        employees,
    });

    if (!getState().status.firebaseSync) dispatch(checkSync());
};

export default updateEmployees;
