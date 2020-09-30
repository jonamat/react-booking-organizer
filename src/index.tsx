/**
 * App starting point
 * It starts the basic services and provides the initial configuration to render the app
 */
import React from 'react';
import ReactDOM from 'react-dom';

// Firebase
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import firebaseConfig from './config/firebase';

// Redux
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import reduxThunk from 'redux-thunk';
import { auth, status, database, isLogged, logActionsMiddleware } from './redux';

// Theming
import { ThemeProvider, createMuiTheme, CssBaseline } from '@material-ui/core';
import themeOptions from './assets/jss/theme';
import { itIT } from '@material-ui/core/locale';
import 'react-toastify/dist/ReactToastify.css';
import './assets/scss/styles.scss';

// Date handling
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import itLocale from 'date-fns/locale/it';

// Error handling
import { ErrorBoundary } from 'react-error-boundary';
import ErrorPage from './routes/ErrorPage';

// Routing
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Utils
import fetchDemoScript from './demo_res/fetchDemoScript';
import { databaseSync, connectionListener } from './utils';
import { LS_EMPLOYEES_ORDER_KEY_NAME } from './config';

/* -------------------------------------------------------------------------- */
/*                              Initialize Redux                              */
/* -------------------------------------------------------------------------- */

const rootReducer = combineReducers({
    auth,
    status,
    database,
});
const store = createStore(
    rootReducer,
    applyMiddleware(
        reduxThunk,
        // Log store updates in dev mode
        ...(process.env.NODE_ENV === 'development' ? [logActionsMiddleware] : []),
    ),
);

/* -------------------------------------------------------------------------- */
/*                        Initialize Firebase services                        */
/* -------------------------------------------------------------------------- */

firebase.initializeApp(firebaseConfig);
firebase.auth().useDeviceLanguage();

/* -------------------------------------------------------------------------- */
/*                                   Theming                                  */
/* -------------------------------------------------------------------------- */

const theme = createMuiTheme(themeOptions, itIT);

/* -------------------------------------------------------------------------- */
/*                Load device configuration from local storage                */
/* -------------------------------------------------------------------------- */

const rowData = localStorage.getItem(LS_EMPLOYEES_ORDER_KEY_NAME);
if (rowData) {
    try {
        const employeesOrder = JSON.parse(rowData);

        // Validate parsed string
        if (Array.isArray(employeesOrder) && employeesOrder.every((row) => typeof row === 'string'))
            store.dispatch({ type: 'UPDATE_EMPLOYEES_ORDER', employeesOrder });
    } catch (error) {
        localStorage.removeItem(LS_EMPLOYEES_ORDER_KEY_NAME);
    }
}

/* -------------------------------------------------------------------------- */
/*                               Service worker                               */
/* -------------------------------------------------------------------------- */

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js');
    });
}

/* -------------------------------------------------------------------------- */
/*                        Listeners for global actions                        */
/* -------------------------------------------------------------------------- */

// Listen for auth status changes
let unsubscribeObservers: Array<() => void> = [];
firebase.auth().onAuthStateChanged((user) => {
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
        store.dispatch({ type: 'FIREBASE_SYNCHRONIZED', firebaseSync: false });
    }
});

// Listen for network changes
connectionListener(store.dispatch);

/* -------------------------------------------------------------------------- */
/*                             Operations for demo                            */
/* -------------------------------------------------------------------------- */

// Generate dummy data if sandbox is the target database
if (process.env.TARGET_DB === 'sandbox') fetchDemoScript(store);

/* -------------------------------------------------------------------------- */
/*                                 Render app                                 */
/* -------------------------------------------------------------------------- */

const root = document.getElementById('root');
ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={itLocale}>
                    <ErrorBoundary FallbackComponent={ErrorPage}>
                        <App />
                    </ErrorBoundary>
                </MuiPickersUtilsProvider>
            </ThemeProvider>
        </BrowserRouter>
    </Provider>,
    root,
);
