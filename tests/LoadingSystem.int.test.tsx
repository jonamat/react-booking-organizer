/**
 * Integration test suite
 *
 * Target: Visual feedback and blocking of user interactions
 * Tests:
 * - Visual feedback functionality
 * - Functional integrity of app navigation
 */

// Test resources
import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

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
import {
    auth,
    status,
    database,
    isLogged,
    updateServices,
    updateEmployees,
    updateCustomers,
    updateReservations,
} from '../src/redux';

// Components to test
import App from '../src/App';

interface ExtendedRenderResult extends RenderResult {
    store: Store;
    history: MemoryHistory;
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
    dbInit: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */

jest.unmock('react-redux');

/* -------------------------------------------------------------------------- */
/*                               Render wrapper                               */
/* -------------------------------------------------------------------------- */

/**
 * Render the component with the custom configuration
 * @param opt Render options
 * @param props Component props
 */
const renderApp = (opt?: Partial<RenderOpt>, props?: Partial<AppProps>): ExtendedRenderResult => {
    const { logged = true, dbInit = true } = opt || {};

    // Init config
    const theme = createMuiTheme(themeOptions, itIT);
    const history = createMemoryHistory();
    const rootReducer = combineReducers({
        auth,
        status,
        database,
    });
    const store = createStore(rootReducer, applyMiddleware(reduxThunk));

    // Force initial store setup to jump in the logged area
    if (logged !== undefined) store.dispatch(isLogged(logged) as any);
    if (dbInit) {
        store.dispatch(updateServices({ docs: [] }) as any);
        store.dispatch(updateCustomers({ docs: [] }) as any);
        store.dispatch(updateEmployees({ docs: [] }) as any);
        store.dispatch(updateReservations({ docs: [] }) as any);
    }
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
        store,
        history,
        ...renderResult,
    };
};

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('Full screen progress bar (blocking of interactions)', () => {
    it('is shown when firebase auth system is not ready', () => {
        const { queryByTestId } = renderApp({ dbInit: false });

        // Auth system is not ready and the database in not synchronized yet, display the progress bar
        expect(queryByTestId('loading')).toBeTruthy();
    });
    it('is shown when redux is not yet synchronized with database but user is logged', () => {
        const { queryByTestId } = renderApp({ logged: true, dbInit: false });

        // User is logged but the database is not synchronized yet, display the progress bar
        expect(queryByTestId('loading')).toBeTruthy();
    });
    it('is hidden when redux is populated and auth system is ready', () => {
        const { queryByTestId } = renderApp({ logged: true, dbInit: true });

        // Auth system is ready, user is logged and synchronization system is running, hide the progress bar
        expect(queryByTestId('loading')).toBeFalsy();
    });
});
