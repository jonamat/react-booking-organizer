import React, { FC, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { bindActionCreators } from 'redux';
import { useStore, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Typography,
    IconButton,
    Tabs,
    Tab,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
    Tooltip,
} from '@material-ui/core';

import { openDialog, closeDialog } from '../../redux';
import { Reservation, RootState } from '../../types';
import { deleteCustomer } from '../../utils';
import ReservationPanel from '../../components/ReservationPanel';
import Center from '../../components/Center';
import TabPanel from './TabPanel';
import useStyles from './style';

// Icons
import DeleteRoundedIcon from '@material-ui/icons/DeleteRounded';
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import AddCircleOutlineRoundedIcon from '@material-ui/icons/AddCircleOutlineRounded';
import AssignmentIndRoundedIcon from '@material-ui/icons/AssignmentIndRounded';
import PersonPinCircleRoundedIcon from '@material-ui/icons/PersonPinCircleRounded';
import PhoneRoundedIcon from '@material-ui/icons/PhoneRounded';
import PostAddRoundedIcon from '@material-ui/icons/PostAddRounded';
import AssignmentTurnedInRoundedIcon from '@material-ui/icons/AssignmentTurnedInRounded';
import DateRangeRoundedIcon from '@material-ui/icons/DateRangeRounded';

const CustomerDetails: FC<RouteComponentProps<{ customerId: string }>> = ({ match, history }) => {
    const classes = useStyles();
    const now = Date.now();
    const [tabIndex, setTabIndex] = useState<number>(0);
    const {
        database: { reservations, services, customers },
    } = useStore<RootState>().getState();
    const actions = bindActionCreators({ openDialog, closeDialog }, useDispatch());

    if (!reservations || !services || !customers) throw new Error('Internal error - Resources loading logic broken');

    const customerId = match.params.customerId;
    const customer = customers.find((customer) => customer.id === customerId);

    if (!customer) {
        history.push('/customers');
        toast.error('Cliente non presente del database');
        return null;
    }

    // All the reservations assigned to the customer
    const personalReservation = reservations.filter((reservation) => reservation.customerId === customer.id);

    // All the customer reservation from NOW
    const futureReservations: Array<Reservation> = [];

    // All the customer reservation until NOW
    const pastReservations: Array<Reservation> = personalReservation
        .reduce<Array<Reservation>>((prev, curr) => {
            if (curr.date.getTime() < now) prev.push(curr);
            else futureReservations.push(curr);
            return prev;
        }, [])
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    futureReservations.sort((a, b) => a.date.getTime() - b.date.getTime());

    const handleDeleteCustomer = () => {
        actions.openDialog({
            title: 'Eliminazione in corso',
            content: (
                <Center style={{ height: 100 }}>
                    <CircularProgress />
                </Center>
            ),
        });

        deleteCustomer(reservations, customer)
            .then(() => {
                history.push('/customers');
                toast.success('Cliente eliminato');
            })
            .catch((error) => toast.error(error.message))
            .finally(() => actions.closeDialog());
    };

    const confirmationDialog = (
        <>
            <DialogContent>
                <DialogContentText>
                    Eliminando il cliente eliminerai anche tutti gli appuntamenti passati e futuri assegnati ad esso.
                    Non sarà possibile recuperare tali informazioni.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => actions.closeDialog()} color="primary" autoFocus>
                    Annulla
                </Button>
                <Button onClick={handleDeleteCustomer} color="primary" data-testid="delete-confirmation">
                    Elimina
                </Button>
            </DialogActions>
        </>
    );

    return (
        <div className={classes.container}>
            <Grid container justify="space-between" alignItems="center" wrap="nowrap">
                <Grid item>
                    <Typography variant="h6">Scheda cliente</Typography>
                </Grid>

                <div className={classes.grow} />
                <Grid item>
                    <Tooltip title="Assegna nuovo appuntamento">
                        <IconButton
                            onClick={() => history.push('/add-reservation?customerId=' + customer.id)}
                            data-testid="add-reservation"
                        >
                            <AddCircleOutlineRoundedIcon color="primary" />
                        </IconButton>
                    </Tooltip>
                </Grid>

                <Grid item>
                    <Tooltip title="Modifica">
                        <IconButton
                            onClick={() => history.push('/edit-customer/' + customer.id)}
                            data-testid="edit-customer"
                        >
                            <EditRoundedIcon color="primary" />
                        </IconButton>
                    </Tooltip>
                </Grid>

                <Grid item>
                    <Tooltip title="Elimina cliente">
                        <IconButton
                            onClick={() =>
                                actions.openDialog({ title: 'Elimina cliente', content: confirmationDialog })
                            }
                            data-testid="delete-customer"
                        >
                            <DeleteRoundedIcon color="primary" />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>

            <Grid container>
                <Grid item xs={12} sm={6}>
                    <List disablePadding>
                        {[
                            {
                                label: 'Nome',
                                value: customer.name + ' ' + customer.surname || '',
                                icon: <AssignmentIndRoundedIcon color="primary" />,
                            },
                            {
                                label: 'Identificatore aggiuntivo',
                                value: customer.additionalIdentifier,
                                icon: <PersonPinCircleRoundedIcon color="primary" />,
                            },
                            {
                                label: 'Telefono',
                                value: customer.phone,
                                icon: <PhoneRoundedIcon color="primary" />,
                            },
                        ].map((item, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.value || '---'} secondary={item.label} />
                            </ListItem>
                        ))}
                    </List>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <List disablePadding>
                        {[
                            {
                                label: 'Note',
                                value: customer.notes,
                                icon: <PostAddRoundedIcon color="primary" />,
                            },
                            {
                                label: 'Appuntamenti passati',
                                value: pastReservations.length,
                                icon: <AssignmentTurnedInRoundedIcon color="primary" />,
                            },
                            {
                                label: 'Appuntamenti futuri',
                                value: futureReservations.length,
                                icon: <DateRangeRoundedIcon color="primary" />,
                            },
                        ].map((item, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.value || '---'} secondary={item.label} />
                            </ListItem>
                        ))}
                    </List>
                </Grid>
            </Grid>

            <Tabs variant="fullWidth" centered value={tabIndex} onChange={(_e, index) => setTabIndex(index)}>
                <Tab label="Appuntamenti passati" />
                <Tab label="Appuntamenti futuri" />
            </Tabs>
            <TabPanel value={tabIndex} index={0} data-testid="past-reservations">
                <Grid container spacing={1}>
                    {pastReservations.length ? (
                        pastReservations.map((reservation) => (
                            <Grid key={reservation.id} item xs={12}>
                                <ReservationPanel reservation={reservation} showDetails />
                            </Grid>
                        ))
                    ) : (
                        <Grid item>
                            <Typography variant="body1">Nessun appuntamento presente</Typography>
                        </Grid>
                    )}
                </Grid>
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
                <Grid container spacing={1}>
                    {futureReservations.length ? (
                        futureReservations.map((reservation) => (
                            <Grid key={reservation.id} item xs={12}>
                                <ReservationPanel reservation={reservation} showDetails />
                            </Grid>
                        ))
                    ) : (
                        <Grid item>
                            <Typography variant="body1">Nessun appuntamento presente</Typography>
                        </Grid>
                    )}
                </Grid>
            </TabPanel>
        </div>
    );
};

export default React.memo(
    CustomerDetails,
    (prevProps, nextProps) => prevProps.location.pathname === nextProps.location.pathname,
);
