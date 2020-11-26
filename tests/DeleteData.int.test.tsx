/**
 * Integration test suite
 *
 * Target: Database update system (delete data)
 * Tests:
 * - API call correctness
 * - Visual feedback functionality
 * - App behavior to right and wrong user inputs
 * - Functional integrity of app navigation
 */

// Test resources
import React from 'react';
import { render, waitFor, fireEvent, RenderResult } from '@testing-library/react';
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
import {
    NewReservation,
    NewService,
    NewCustomer,
    NewEmployee,
    Customer,
    Employee,
    Reservation,
    Service,
} from '../src/types';
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

// Mocked modules
import { toast } from 'react-toastify';

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
const mockDelete = jest.fn();
jest.mock('firebase/app', () => ({
    firestore: () => ({
        collection: () => ({
            doc: () => ({
                delete: mockDelete,
            }),
        }),
    }),
}));

const spyToastError = jest.spyOn(toast, 'error');
const spyToastSuccess = jest.spyOn(toast, 'success');

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
    store.dispatch(isLogged(logged) as any);
    if (dbInit) {
        store.dispatch(
            updateServices({
                docs: [
                    {
                        id: 'service-id',
                        data: (): NewService => ({
                            averageDuration: 15,
                            name: 'service-test',
                        }),
                    },
                ],
            }) as any,
        );
        store.dispatch(
            updateCustomers({
                docs: [
                    {
                        id: 'customer-id',
                        data: (): NewCustomer => ({
                            name: 'customer-name-test',
                        }),
                    },
                ],
            }) as any,
        );
        store.dispatch(
            updateEmployees({
                docs: [
                    {
                        id: 'employee-id',
                        data: (): NewEmployee => ({
                            name: 'employee-test',
                        }),
                    },
                ],
            }) as any,
        );
        store.dispatch(
            updateReservations({
                docs: [
                    {
                        id: 'reservation-id',
                        data: (): NewReservation => ({
                            customerId: 'customer-id',
                            date: new Date(),
                            employeeId: 'employee-id',
                            serviceId: 'service-id',
                        }),
                    },
                ],
            }) as any,
        );
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

describe('Delete data proceedings', () => {
    it('asks for confirmation before deletion', async () => {
        const { getByTestId, history, getByText } = renderApp();

        // Wait for app init
        await waitFor(() => expect(getByTestId('navbar')).toBeTruthy());

        // Fill in a customer name in the search field
        fireEvent.change(getByTestId('search-field'), { target: { value: 'customer' } });
        fireEvent.keyDown(getByTestId('search-field'), { key: 'Enter', code: 'Enter' });

        // Click on the first past reservation panel
        await waitFor(() => expect(history.location.pathname).toBe('/customer-details/customer-id'));
        fireEvent.click(getByTestId('past-reservations').children[0].children[0].children[0]);

        // Click on delete reservation
        await waitFor(() => expect(history.location.pathname).toBe('/reservation-details/reservation-id'));
        fireEvent.click(getByTestId('delete-reservation'));

        // Wait for confirm dialog
        await waitFor(() => expect(getByText('Elimina')).toBeTruthy());

        // Click on confirmation
        fireEvent.click(getByText('Elimina'));

        // Wait for API call resolution and toast display
        await waitFor(() => expect(spyToastSuccess).toBeCalledTimes(1));
        expect(spyToastError).not.toBeCalled();
    });

    it('calls fb API if user confirm deletion', async () => {
        const { getByTestId, history, getByText } = renderApp();

        // Wait for app init
        await waitFor(() => expect(getByTestId('navbar')).toBeTruthy());

        // Fill in a customer name in the search field
        fireEvent.change(getByTestId('search-field'), { target: { value: 'customer' } });
        fireEvent.keyDown(getByTestId('search-field'), { key: 'Enter', code: 'Enter' });

        // Click on the first past reservation panel
        await waitFor(() => expect(history.location.pathname).toBe('/customer-details/customer-id'));
        fireEvent.click(getByTestId('past-reservations').children[0].children[0].children[0]);

        // Click on delete reservation
        await waitFor(() => expect(history.location.pathname).toBe('/reservation-details/reservation-id'));
        fireEvent.click(getByTestId('delete-reservation'));

        // Wait for confirm dialog
        await waitFor(() => expect(getByText('Elimina')).toBeTruthy());

        // Click on confirmation
        fireEvent.click(getByText('Elimina'));

        // Wait for API call
        await waitFor(() => expect(mockDelete).toBeCalledTimes(1));
    });
});
