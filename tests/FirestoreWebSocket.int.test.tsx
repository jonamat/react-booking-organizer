/**
 * Integration test suite
 *
 * Target: Firebase realtime communication
 * Tests:
 * - App behavior to database updates
 * - Data security (delete fetched data on logout)
 * - Server load optimization (close websocket on logout)
 * - Data validation
 * - Prevent app crashes due to corrupted data
 * - API call correctness
 * - Visual feedback functionality
 * - Functional integrity of app navigation
 */

// Test resources
import React from 'react';
import { render, waitFor, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { EventEmitter } from 'events';

// Test requirements
import { MemoryHistory } from 'history';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { combineReducers, createStore, applyMiddleware, Store } from 'redux';
import { Provider } from 'react-redux';
import reduxThunk from 'redux-thunk';
import { ThemeProvider, createMuiTheme, CssBaseline } from '@material-ui/core';
import { itIT } from '@material-ui/core/locale';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import itLocale from 'date-fns/locale/it';

// Test configuration
import themeOptions from '../src/assets/jss/theme';
import { NewCustomer, Customer, Employee, Reservation, Service } from '../src/types';
import { auth, status, database, isLogged } from '../src/redux';
import { databaseSync } from '../src/utils';

// Components to test
import App from '../src/App';

interface ExtendedRenderResult extends RenderResult {
    history: MemoryHistory;
    store: Store<any, any>;
}

interface AppProps {
    logged: boolean | null;
    offline: boolean;
    services: Array<Service> | null;
    customers: Array<Customer> | null;
    employees: Array<Employee> | null;
    reservations: Array<Reservation> | null;
}

interface RenderOpt {
    logged: boolean;
}

const eventEmitter = new EventEmitter();
eventEmitter.setMaxListeners(40); // 4 listeners each test
let unsubscribeObservers: Array<() => void> = [];

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */

jest.unmock('react-redux');
const simulateCollectionUpdate = (callback: (data: any) => void) => {
    const eventCallback = (data: any) => callback(data);
    eventEmitter.on('collectionChange', eventCallback);
    // Simulate unsubscribe function
    return () => eventEmitter.removeListener('collectionChange', eventCallback);
};

jest.mock('firebase/app', () => ({
    firestore: () => ({
        collection: () => ({
            onSnapshot: simulateCollectionUpdate,
        }),
    }),
}));

/* -------------------------------------------------------------------------- */
/*                              Bridge operations                             */
/* -------------------------------------------------------------------------- */

beforeEach(() => {
    jest.clearAllMocks();
});

/* -------------------------------------------------------------------------- */
/*                               Render wrapper                               */
/* -------------------------------------------------------------------------- */

/**
 * Render the component with the custom configuration
 * @param opt Render options
 * @param props Component props
 */
const renderApp = (opt?: Partial<RenderOpt>, props?: Partial<AppProps>): ExtendedRenderResult => {
    const { logged = true } = opt || {};

    // Init config
    const theme = createMuiTheme(themeOptions, itIT);
    const history = createMemoryHistory();
    const rootReducer = combineReducers({
        auth,
        status,
        database,
    });
    const store = createStore(rootReducer, applyMiddleware(reduxThunk));

    // Simulate firebase.auth().onAuthStateChanged NOTE: This should be the same callback fn in index.tsx
    eventEmitter.on('authStatusChange', (user) => {
        if (user) {
            unsubscribeObservers = databaseSync(store.dispatch);
            store.dispatch(isLogged(true) as any);
        } else {
            // Unsubscribe from firebase snapshot observers
            if (unsubscribeObservers.length) {
                unsubscribeObservers.forEach((unsubscribeObserver) => unsubscribeObserver());
                unsubscribeObservers = [];
            }
            store.dispatch(isLogged(false) as any);

            // Delete data from store
            store.dispatch({ type: 'RESET_DATA' });
        }
    });

    // Simulate login
    eventEmitter.emit('authStatusChange', logged);

    const renderResult = render(
        <Provider store={store}>
            <Router history={history}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={itLocale}>
                        <App {...props} />
                    </MuiPickersUtilsProvider>
                </ThemeProvider>
            </Router>
        </Provider>,
    );
    return {
        history,
        store,
        ...renderResult,
    };
};

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('Realtime updates from Firestore collection', () => {
    it('interrupt socket communication at logout', async () => {
        const { store } = renderApp({ logged: false });

        // Initial setup, user is not logged, redux store has been initialized but not yet populated
        expect(store.getState().database.customers).toBe(null);

        // Simulate login with empty collection
        eventEmitter.emit('authStatusChange', true);
        eventEmitter.emit('collectionChange', { docs: [] });

        // Wait for login
        await waitFor(() => expect(!!store.getState().auth.logged).toBe(true));

        // User is logged but there are no document in the collection
        expect(store.getState().database.customers?.length).toBe(0);

        // Simulate a change in collection
        const collectionSnapshot = {
            docs: [
                {
                    id: 'document-id',
                    data: (): NewCustomer => ({
                        name: 'customer-name',
                    }),
                },
            ],
        };
        eventEmitter.emit('collectionChange', collectionSnapshot);

        // The change should be processed and injected in the store
        expect(store.getState().database.customers.length).toBe(1);

        // Simulate user logout
        eventEmitter.emit('authStatusChange', false);

        // Wait for logout
        await waitFor(() => expect(!!store.getState().auth.logged).toBe(false));

        // Database reducer should be re-initialized with null values
        expect(store.getState().database.customers).toBe(null);

        // Try to use firestore listeners
        collectionSnapshot.docs.push({
            id: 'document-id-2',
            data: (): NewCustomer => ({
                name: 'customer-name-2',
            }),
        });
        eventEmitter.emit('collectionChange', collectionSnapshot);

        // No input expected, listeners have been disabled
        expect(store.getState().database.customers).toBe(null);
    });

    it('populates redux store on collection changes', () => {
        // Initial setup, user is logged, redux store has been initialized but not yet populated
        const { store } = renderApp();

        // Simulate collection changes
        const collectionSnapshot = {
            docs: [
                {
                    id: 'document-id',
                    data: (): NewCustomer => ({
                        name: 'customer-name',
                    }),
                },
            ],
        };
        eventEmitter.emit('collectionChange', collectionSnapshot);

        // The change should be processed and injected in the store
        expect(store.getState().database.customers).toStrictEqual([
            {
                id: 'document-id',
                name: 'customer-name',
            },
        ]);

        // Add another document to the collection
        collectionSnapshot.docs.push({
            id: 'document-id-2',
            data: (): NewCustomer => ({
                name: 'customer-name-2',
            }),
        });
        eventEmitter.emit('collectionChange', collectionSnapshot);

        // The change should have been processed and injected in the redux store
        expect(store.getState().database.customers).toStrictEqual([
            {
                id: 'document-id',
                name: 'customer-name',
            },
            {
                id: 'document-id-2',
                name: 'customer-name-2',
            },
        ]);

        // Log out to disable listeners
        eventEmitter.emit('authStatusChange', false);
    });

    it('prevents access of corrupted data in redux store', () => {
        // Initial setup, user is logged, redux store has been initialized but not yet populated
        const { store } = renderApp();

        // Simulate collection changes
        const collectionSnapshot = {
            docs: [
                {
                    id: 'document-id',
                    data: (): NewCustomer => ({
                        name: 'a good customer',
                    }),
                },
                {
                    id: 'document-id-2',
                    data: (): any => ({
                        name: 'a bad customer',
                        // Illegal field
                        corruptedData: 'something wrong',
                    }),
                },
                {
                    id: 'document-id-3',
                    data: (): any => ({
                        // Illegal type
                        name: {
                            corruptedType: 'a very bad customer',
                        },
                        // Illegal type
                        surname: 123,
                    }),
                },
            ],
        };
        eventEmitter.emit('collectionChange', collectionSnapshot);

        // The change should be processed and injected in the store
        expect(store.getState().database.customers).toStrictEqual([
            {
                id: 'document-id',
                name: 'a good customer',
            },
        ]);

        // Log out to disable listeners
        eventEmitter.emit('authStatusChange', false);
    });
});
