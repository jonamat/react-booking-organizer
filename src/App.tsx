import React, { FC, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { bindActionCreators } from 'redux';
import { connect, ConnectedProps } from 'react-redux';
import { CircularProgress, Grid } from '@material-ui/core';

import { closeDialog, checkForBirthdays } from './redux';
import { RootState } from './types';
import useStyles from './assets/jss/appContainerStyles';

// Components
import ConditionalSwitch from './components/ConditionalSwitch';
import RenderGroup from './components/RenderGroup';
import Navbar from './components/Navbar';
import Center from './components/Center';
import ToolBar from './components/ToolBar';
import Drawer from './components/Drawer';
import ConnectedDialog from './components/ConnectedDialog';

// Routes
import Login from './routes/Login';
import AddCustomer from './routes/AddCustomer';
import AddReservation from './routes/AddReservation';
import AddService from './routes/AddService';
import AddEmployee from './routes/AddEmployee';
import EditCustomer from './routes/EditCustomer';
import EditReservation from './routes/EditReservation';
import EditService from './routes/EditService';
import EditEmployee from './routes/EditEmployee';
import Customers from './routes/Customers';
import Services from './routes/Services';
import Employees from './routes/Employees';
import CustomerDetails from './routes/CustomerDetails';
import ReservationDetails from './routes/ReservationDetails';
import Reservations from './routes/Reservations';
import Birthdays from './routes/Birthdays';

const mapStateToProps = (state: RootState) => ({
    offline: state.status.offline,
    logged: state.auth.logged,
    firebaseSync: state.status.firebaseSync,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({ closeDialog, checkForBirthdays }, dispatch);
const connector = connect(mapStateToProps, mapDispatchToProps);
type ReduxProps = ConnectedProps<typeof connector>;

const App: FC<ReduxProps> = ({ firebaseSync, logged, offline }) => {
    // Delegate render to error boundary component
    if (offline) throw new Error('Connessione assente');

    const classes = useStyles();
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const isReady = logged && firebaseSync;
    const isLoading = (logged && !firebaseSync) || logged === null;

    const handleToggleDrawer = () => setDrawerOpen(!drawerOpen);

    return (
        <>
            <RenderGroup condition={isReady}>
                {/* Fixed navbar */}
                <Navbar toggleDrawer={handleToggleDrawer} />
            </RenderGroup>

            <Grid container wrap="nowrap">
                <RenderGroup condition={isReady}>
                    <Grid item className={classes.lateralDrawer}>
                        {/* Toolbar (large screens only) */}
                        <ToolBar />
                    </Grid>
                </RenderGroup>

                <Grid item className={classes.fixedViewport}>
                    <ConditionalSwitch>
                        {/* Show progress bar if auth or sync systems are not ready */}
                        <RenderGroup condition={isLoading}>
                            <Route
                                render={() => (
                                    <Center data-testid="loading" fullPage>
                                        <CircularProgress />
                                    </Center>
                                )}
                            />
                        </RenderGroup>

                        {/* Public-only routes */}
                        <RenderGroup condition={!logged}>
                            <Route exact path="/login" component={Login} />

                            {/* 404 */}
                            <Route render={() => <Redirect to="/login" />} />
                        </RenderGroup>

                        {/* Protected routes */}
                        <RenderGroup condition={logged}>
                            <Route exact path="/add-customer" component={AddCustomer} />
                            <Route exact path="/add-reservation" component={AddReservation} />
                            <Route exact path="/add-service" component={AddService} />
                            <Route exact path="/add-employee" component={AddEmployee} />
                            <Route exact path="/edit-customer/:customerId" component={EditCustomer} />
                            <Route exact path="/edit-reservation/:reservationId" component={EditReservation} />
                            <Route exact path="/edit-service/:serviceId" component={EditService} />
                            <Route exact path="/edit-employee/:employeeId" component={EditEmployee} />
                            <Route exact path="/customers" component={Customers} />
                            <Route exact path="/services" component={Services} />
                            <Route exact path="/employees" component={Employees} />
                            <Route exact path="/birthdays" component={Birthdays} />
                            <Route exact path="/customer-details/:customerId" component={CustomerDetails} />
                            <Route exact path="/reservation-details/:reservationId" component={ReservationDetails} />
                            <Route exact path={['/', '/reservations']} component={Reservations} />

                            {/* 404 */}
                            <Route render={() => <Redirect to={'/'} />} />
                        </RenderGroup>
                    </ConditionalSwitch>
                </Grid>
            </Grid>

            <Drawer drawerOpen={drawerOpen} toggleDrawer={handleToggleDrawer} />

            <ToastContainer
                toastClassName={classes.toast}
                position="top-right"
                autoClose={3000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                draggable
                pauseOnHover
            />

            <ConnectedDialog />
        </>
    );
};

export default connector(App);
