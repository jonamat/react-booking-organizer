/**
 * Integration test suite
 *
 * Target: Authentication system
 * Tests:
 * - App behavior to server auth rejections
 * - Routing based on the user auth state
 * - API call correctness
 * - Visual feedback functionality
 * - App behavior to right and wrong user inputs
 * - Functional integrity of app navigation
 */

// Test resources
import React from 'react';
import { render, waitFor, fireEvent, RenderResult } from '@testing-library/react';
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
import { Customer, Employee, Reservation, Service } from '../src/types';
import { auth, status, database, isLogged } from '../src/redux';
import { databaseSync } from '../src/utils';

// Mocked modules
import { toast } from 'react-toastify';

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
    auth: function auth() {
        (auth as any).Auth = {
            Persistence: {
                LOCAL: '_',
                SESSION: '_',
            },
        };

        return {
            setPersistence: () => Promise.resolve(),
            signInWithEmailAndPassword: (_email, password) =>
                new Promise<void>((res, rej) => {
                    switch (password) {
                        case 'correct-password':
                            eventEmitter.emit('authStatusChange', true);
                            return res();

                        // Responds with real Firebase auth error messages
                        case 'invalid-mail':
                            return rej({ code: 'auth/invalid-email' });

                        case 'invalid-user':
                            return rej({ code: 'auth/user-not-found' });

                        case 'invalid-password':
                            return rej({ code: 'auth/wrong-password' });

                        default:
                            return rej('invalid argument');
                    }
                }),
        };
    },
}));

const spyToastError = jest.spyOn(toast, 'error');

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

    // Simulate firebase.auth().onAuthStateChanged NOTE: This should be the same callback inside index.tsx
    eventEmitter.on('authStatusChange', (user) => {
        if (user) {
            unsubscribeObservers = databaseSync(store.dispatch);
            store.dispatch(isLogged(true) as any);
        } else {
            // Close firebase sockets
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

describe('Auth system', () => {
    it('validates user input', async () => {
        const { getByTestId, store } = renderApp({ logged: false });

        // User not logged, redirect to /login
        expect(getByTestId('login-page')).toBeTruthy();

        // Fill in login fields with wrong data
        fireEvent.change(getByTestId('email-fld'), { target: { value: 'something-wrong' } });
        fireEvent.change(getByTestId('password-fld'), { target: { value: '123' } });
        fireEvent.click(getByTestId('submit-btn'));

        // Wait for API call rejection and error toast display
        await waitFor(() => expect(spyToastError).toBeCalledTimes(1));

        // Auth reducer remains unchanged
        expect(!!store.getState().auth.logged).toBe(false);

        // Fill in login fields without password
        fireEvent.change(getByTestId('email-fld'), { target: { value: 'something@right.com' } });
        fireEvent.change(getByTestId('password-fld'), { target: { value: '' } });
        fireEvent.click(getByTestId('submit-btn'));

        // Wait for error toast due to failed client validation
        await waitFor(() => expect(spyToastError).toBeCalledTimes(1));

        // Auth reducer remains unchanged
        expect(!!store.getState().auth.logged).toBe(false);
    });

    it('works properly', async () => {
        const { getByTestId, store } = renderApp({ logged: false });

        // User not logged, redirect to /login
        expect(getByTestId('login-page')).toBeTruthy();

        // Fill in login fields with correct data
        fireEvent.change(getByTestId('email-fld'), { target: { value: 'user@mail.com' } });
        fireEvent.change(getByTestId('password-fld'), { target: { value: 'correct-password' } });
        fireEvent.click(getByTestId('submit-btn'));

        // Wait for API call resolution and store changes
        await waitFor(() => expect(!!store.getState().auth.logged).toBe(true));

        expect(spyToastError).not.toBeCalled();
    });

    it('can handle rejections', async () => {
        const { getByTestId, store } = renderApp({ logged: false });

        // User not logged, redirect to /login
        expect(getByTestId('login-page')).toBeTruthy();

        // Fill in login fields with invalid email
        fireEvent.change(getByTestId('email-fld'), { target: { value: 'invalid@mail.com' } });
        fireEvent.change(getByTestId('password-fld'), { target: { value: 'invalid-mail' } });
        fireEvent.click(getByTestId('submit-btn'));

        // Wait for API call rejection and error toast display
        await waitFor(() => expect(spyToastError).toBeCalledTimes(1));
        expect(spyToastError).toBeCalledWith('Email non valida');
        spyToastError.mockClear();

        // Auth reducer remains unchanged
        expect(!!store.getState().auth.logged).toBe(false);

        // Fill in login fields with invalid user
        fireEvent.change(getByTestId('password-fld'), { target: { value: 'invalid-user' } });
        fireEvent.click(getByTestId('submit-btn'));

        // Wait for API call rejection and error toast display
        await waitFor(() => expect(spyToastError).toBeCalledTimes(1));
        expect(spyToastError).toBeCalledWith('Utente non trovato');
        spyToastError.mockClear();

        // Auth reducer remains unchanged
        expect(!!store.getState().auth.logged).toBe(false);

        // Fill in login fields with invalid password
        fireEvent.change(getByTestId('password-fld'), { target: { value: 'invalid-password' } });
        fireEvent.click(getByTestId('submit-btn'));

        // Wait for API call rejection and error toast display
        await waitFor(() => expect(spyToastError).toBeCalledTimes(1));
        expect(spyToastError).toBeCalledWith('Password errata');
        spyToastError.mockClear();

        // Auth reducer remains unchanged
        expect(!!store.getState().auth.logged).toBe(false);
    });
});
