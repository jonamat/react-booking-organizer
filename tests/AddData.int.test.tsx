/**
 * Integration test suite
 *
 * Target: Database update system (add data)
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
import { itIT } from '@material-ui/core/locale';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import itLocale from 'date-fns/locale/it';
import { ThemeProvider, createMuiTheme, CssBaseline } from '@material-ui/core';

// Test configuration
import themeOptions from '../src/assets/jss/theme';
import { NewService, NewCustomer, NewEmployee, Customer, Employee, Reservation, Service } from '../src/types';
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
    history: MemoryHistory;
    store: Store;
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
const mockAdd = jest.fn(() => ({ id: 'return-id' }));
jest.mock('firebase/app', () => ({
    firestore: () => ({
        collection: () => ({
            add: mockAdd,
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

describe('Add data proceedings', () => {
    it('validate user inputs', async () => {
        const { getByTestId, history, getAllByTestId } = renderApp();

        // Click on the first "Add reservation" button in reservation table
        await waitFor(() => expect(getByTestId('reservations-route')).toBeTruthy());
        fireEvent.click(getAllByTestId('add-reservation-btn')[0]);
        await waitFor(() => expect(history.location.pathname).toBe('/add-reservation'));

        // Fill in customer field
        fireEvent.input(getByTestId('customer'), { target: { value: 'customer' } });
        fireEvent.keyDown(getByTestId('customer'), { key: 'Enter', code: 'Enter' });

        // Fill in Date field
        fireEvent.change(getByTestId('date'), { target: { value: '01/24/2040 10:00' } });
        fireEvent.blur(getByTestId('date'));

        // Fill in other text fields
        fireEvent.input(getByTestId('service'), { target: { value: 'service-id' } });
        fireEvent.input(getByTestId('employee'), { target: { value: 'employee-id' } });
        fireEvent.input(getByTestId('notes'), { target: { value: 'notes' } });

        // Submit
        fireEvent.click(getByTestId('submit-button'));

        // Wait for the error toast
        await waitFor(() => expect(spyToastError).toBeCalledTimes(1));
    });

    it('calls Firebase API if user input is valid', async () => {
        const { getByTestId, history, getAllByTestId } = renderApp();

        // Click on the first "Add reservation" button in reservation table
        await waitFor(() => expect(getByTestId('reservations-route')).toBeTruthy());
        fireEvent.click(getAllByTestId('add-reservation-btn')[0]);
        await waitFor(() => expect(history.location.pathname).toBe('/add-reservation'));

        // Fill in customer field
        fireEvent.input(getByTestId('customer'), { target: { value: 'customer' } });
        fireEvent.keyDown(getByTestId('customer'), { key: 'Enter', code: 'Enter' });

        // Fill in Date field
        fireEvent.change(getByTestId('date'), { target: { value: '01/01/2040 10:00' } });
        fireEvent.blur(getByTestId('date'));

        // Fill in other text fields
        fireEvent.input(getByTestId('service'), { target: { value: 'service-id' } });
        fireEvent.input(getByTestId('employee'), { target: { value: 'employee-id' } });
        fireEvent.input(getByTestId('notes'), { target: { value: 'notes' } });

        // Submit
        fireEvent.click(getByTestId('submit-button'));

        // Wait API call
        await waitFor(() => expect(mockAdd).toBeCalledTimes(1));

        expect(spyToastError).not.toBeCalled();
        expect(spyToastSuccess).toBeCalledTimes(1);
    });
});
