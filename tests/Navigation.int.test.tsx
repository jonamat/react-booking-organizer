/**
 * Integration test suite
 *
 * Target: Navigation links and access to protected areas
 * Tests:
 * - Visualization and functionality of navigation links
 * - Routing based on the app auth status
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
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import reduxThunk from 'redux-thunk';
import { ThemeProvider, createMuiTheme, CssBaseline } from '@material-ui/core';
import { itIT } from '@material-ui/core/locale';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import itLocale from 'date-fns/locale/it';

// Test configuration
import themeOptions from '../src/assets/jss/theme';
import { Service, Customer, Employee, Reservation } from '../src/types';
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
    store;
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

const resize = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
    });
    window.dispatchEvent(new Event('resize'));
};

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
    store.dispatch(isLogged(logged) as any);
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

describe('Restricted areas', () => {
    it('not shown to unlogged users', () => {
        const { queryByTestId, history } = renderApp({ logged: false, dbInit: false });

        // Redirect unlogged users to /login
        expect(queryByTestId('login-page')).toBeTruthy();
        expect(history.location.pathname).toBe('/login');
        expect(queryByTestId('reservations-route')).toBeFalsy();
    });

    it('redirects user if already logged', () => {
        const { queryByTestId, history } = renderApp({ logged: true, dbInit: true });

        // Redirect logged user to /
        expect(queryByTestId('login-page')).toBeFalsy();
        expect(history.location.pathname).toBe('/');
        expect(queryByTestId('reservations-route')).toBeTruthy();
    });
});

describe('Drawer', () => {
    it('can be opened in small screen (button visible)', async () => {
        const { queryByTestId } = renderApp();

        // Resize jsdom screen size
        resize(400);

        /**
         *  Cannot test the visibility status
         *  JSDOM does not yet implement cascading styles properly
         *  https://github.com/jsdom/jsdom/issues/1696
         *  Workarounds are pretty puzzling and inaccurate. Skip for now
         */
        // await waitFor(() => expect(queryByTestId('drawer-btn')).toBeVisible());

        // Click on drawer button
        fireEvent.click(queryByTestId('drawer-btn') as HTMLElement);

        // Wait for the drawer to open
        await waitFor(() => expect(queryByTestId('drawer')).toBeTruthy());
    });
    it('cannot be opened in large screen (button not visible)', async () => {
        const { queryByTestId } = renderApp();

        // Resize jsdom screen size
        resize(1200);

        /**
         *  Cannot test the visibility status
         *  JSDOM does not yet implement cascading styles properly
         *  https://github.com/jsdom/jsdom/issues/1696
         *  Workarounds are pretty puzzling and inaccurate. Skip for now
         */
        // await waitFor(() => expect(queryByTestId('drawer-btn')).not.toBeVisible());

        // Drawer should not be displayed
        await waitFor(() => expect(queryByTestId('drawer')).toBeFalsy());
    });
    it('toggles when is called', async () => {
        const { queryByTestId } = renderApp();

        // Resize jsdom screen size
        resize(400);

        // Drawer should not be displayed
        await waitFor(() => expect(queryByTestId('drawer')).toBeFalsy());

        // Click on drawer button
        fireEvent.click(queryByTestId('drawer-btn') as HTMLElement);

        // Wait for the drawer to open
        await waitFor(() => expect(queryByTestId('drawer')).toBeTruthy());

        // Click on drawer button again
        fireEvent.click(queryByTestId('drawer-btn') as HTMLElement);

        // Wait for drawer to close
        await waitFor(() => expect(queryByTestId('drawer')).toBeFalsy());
    });

    it('redirects on link click', async () => {
        const { queryByTestId, history } = renderApp();

        // Resize jsdom screen size
        resize(400);

        // Click on drawer button
        fireEvent.click(queryByTestId('drawer-btn') as HTMLElement);

        // Wait for the birthdays page link to became available
        await waitFor(() => expect(queryByTestId('birthday-toolbar-btn')).toBeTruthy());

        // Click on birthdays page link
        fireEvent.click(queryByTestId('birthday-toolbar-btn') as HTMLElement);

        // User should be redirected to /birthdays
        expect(history.location.pathname).toBe('/birthdays');
    });
});

describe('Toolbar', () => {
    it.skip('visible in large screens', async () => {
        const { queryByTestId } = renderApp();

        // Resize jsdom screen size
        resize(1400);

        /**
         *  Cannot test the visibility status
         *  JSDOM does not yet implement cascading styles properly
         *  https://github.com/jsdom/jsdom/issues/1696
         *  Workarounds are pretty puzzling and inaccurate. Skip for now
         */
        await waitFor(() => expect(queryByTestId('toolbar')).toBeVisible());
    });
    it.skip('not visible in small screens', async () => {
        const { queryByTestId } = renderApp();

        // Resize jsdom screen size
        resize(400);

        /**
         *  Cannot test the visibility status
         *  JSDOM does not yet implement cascading styles properly
         *  https://github.com/jsdom/jsdom/issues/1696
         *  Workarounds are pretty puzzling and inaccurate. Skip for now
         */
        await waitFor(() => expect(queryByTestId('toolbar')).not.toBeVisible());
    });
});
