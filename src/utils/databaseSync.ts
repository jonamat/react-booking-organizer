import firebase from 'firebase/app';
import { bindActionCreators } from 'redux';
import { updateServices, updateEmployees, updateCustomers, updateReservations } from '../redux';
import { SERVICES_COLLECTION, EMPLOYEES_COLLECTION, CUSTOMERS_COLLECTION, RESERVATIONS_COLLECTION } from '../config';

/**
 * Synchronize database changes with redux store
 * @param dispatch Redux dispatch function
 * @returns An array of unsubscribe functions
 */
const databaseSync = (dispatch): Array<() => void> => {
    const unsubscribeObservers = Array<() => void>(4);
    const actions = bindActionCreators(
        { updateServices, updateEmployees, updateCustomers, updateReservations },
        dispatch,
    );

    unsubscribeObservers[0] = firebase
        .firestore()
        .collection(SERVICES_COLLECTION)
        .onSnapshot((collectionSnapshot) => {
            actions.updateServices(collectionSnapshot);
        });

    unsubscribeObservers[1] = firebase
        .firestore()
        .collection(EMPLOYEES_COLLECTION)
        .onSnapshot((collectionSnapshot) => {
            actions.updateEmployees(collectionSnapshot);
        });

    unsubscribeObservers[2] = firebase
        .firestore()
        .collection(CUSTOMERS_COLLECTION)
        .onSnapshot((collectionSnapshot) => {
            actions.updateCustomers(collectionSnapshot);
        });

    unsubscribeObservers[3] = firebase
        .firestore()
        .collection(RESERVATIONS_COLLECTION)
        .onSnapshot((collectionSnapshot) => {
            actions.updateReservations(collectionSnapshot);
        });

    return unsubscribeObservers;
};

export default databaseSync;
