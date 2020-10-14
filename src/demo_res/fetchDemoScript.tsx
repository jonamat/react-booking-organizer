import React from 'react';
import { toast } from 'react-toastify';
import { Store } from 'redux';

import { RootState } from '../types';
import { closeDialog, openDialog } from '../redux';

let prepareDemoEnv: Promise<typeof import('./prepareDemoEnv')>;
let demoScriptStarted = false;

/**
 * Retrieve prepareDemoEnv and run it when the FirebaseSync action has been dispatched
 * @param store Redux store instance
 */
const fetchDemoScript = (store: Store<RootState>) => {
    if (!demoScriptStarted) {
        demoScriptStarted = true;
        prepareDemoEnv = import(/* webpackChunkName: "dummyDataGenerator" */ './prepareDemoEnv');
    }

    const done = store.subscribe(() => {
        const {
            status: { firebaseSync },
        } = store.getState();

        // Wait for database-store synchronization
        if (!firebaseSync) return;

        // Unsubscribe this listener and continue running this callback only
        done();

        store.dispatch(
            openDialog({
                title: 'Wait a moment ☕',
                content: (
                    <div style={{ padding: 20, paddingTop: 0 }}>
                        You are currently loading data from the sandbox database.
                        <br />
                        A monkey is generating dummy data for you 🐒
                        <br />
                        You can add/delete/edit this data, but it may change on reload.
                    </div>
                ),
            }) as any,
        );

        prepareDemoEnv
            .then((module) => module.default(store))
            .then(() => {
                // Data have been sent to the database. Wait for db-store synchronization
                setTimeout(() => {
                    store.dispatch(closeDialog() as any);
                    toast.success('Dummy data generated correctly');
                }, 5000);
            })
            .catch(() => toast.error('Cannot generate dummy data 😓'));
    });
};

export default fetchDemoScript;
