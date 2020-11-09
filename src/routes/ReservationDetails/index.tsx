import React, { FC } from 'react';
import {
    Typography,
    IconButton,
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
import { RouteComponentProps } from 'react-router';
import { bindActionCreators } from 'redux';
import { useStore, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addMinutes } from 'date-fns';

import { openDialog, closeDialog } from '../../redux';
import { Reservation, RootState } from '../../types';
import { deleteReservation, getReservationStatus } from '../../utils';
import { TIME_DATE_FORMAT } from '../../config';
import Center from '../../components/Center';
import useStyles from './style';

// Icons
import DeleteRoundedIcon from '@material-ui/icons/DeleteRounded';
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import AddCircleOutlineRoundedIcon from '@material-ui/icons/AddCircleOutlineRounded';
import AssignmentIndRoundedIcon from '@material-ui/icons/AssignmentIndRounded';
import PersonPinCircleRoundedIcon from '@material-ui/icons/PersonPinCircleRounded';
import PhoneRoundedIcon from '@material-ui/icons/PhoneRounded';
import PostAddRoundedIcon from '@material-ui/icons/PostAddRounded';
import AccessTimeRoundedIcon from '@material-ui/icons/AccessTimeRounded';
import BuildRoundedIcon from '@material-ui/icons/BuildRounded';
import FaceRoundedIcon from '@material-ui/icons/FaceRounded';
import TimerRoundedIcon from '@material-ui/icons/TimerRounded';
import TimerOffRoundedIcon from '@material-ui/icons/TimerOffRounded';
import TodayRoundedIcon from '@material-ui/icons/TodayRounded';
import AssignmentRoundedIcon from '@material-ui/icons/AssignmentRounded';

interface ReservationDetailsProps extends RouteComponentProps<{ reservationId: string }> {
    reservation: Reservation;
}

const createReservationStatusString = (status: ReturnType<typeof getReservationStatus>): string => {
    switch (status) {
        case 'DONE':
            return 'Completato';
        case 'ONGOING':
            return 'In corso';
        case 'UNINITIATED':
            return 'In programma';
    }
};

const ReservationDetails: FC<ReservationDetailsProps> = ({ match, history }) => {
    const classes = useStyles();
    const {
        database: { services, customers, employees, reservations },
    } = useStore<RootState>().getState();
    const actions = bindActionCreators({ openDialog, closeDialog }, useDispatch());

    if (!services || !customers || !employees || !reservations)
        throw new Error('Internal error - Resources loading logic broken');

    const reservationId = match.params.reservationId;
    const reservation = reservations.find((reservation) => reservation.id === reservationId);

    if (!reservation) {
        toast.error('Appuntamento non presente nel database');
        history.goBack();
        return null;
    }

    const customer = customers.find((customer) => customer.id === reservation.customerId);
    const service = services.find((service) => service.id === reservation.serviceId);
    const employee = employees.find((employee) => employee.id === reservation.employeeId);

    if (!customer || !service || !employee) {
        toast.error('Sembra che alcune informazioni relative a questo appuntamento siano state cancellate');
    }

    const startTimeString = reservation.date.toLocaleDateString('it-IT', TIME_DATE_FORMAT);
    const endTimeString =
        service &&
        addMinutes(new Date(reservation.date.getTime()), service.averageDuration).toLocaleDateString(
            'it-IT',
            TIME_DATE_FORMAT,
        );
    const reservationStatusString =
        service && createReservationStatusString(getReservationStatus(reservation.date, service.averageDuration));

    const handleDeleteReservation = () => {
        actions.openDialog({
            title: 'Eliminazione in corso',
            content: (
                <Center style={{ height: 100 }}>
                    <CircularProgress />
                </Center>
            ),
        });
        deleteReservation(reservation)
            .then(() => {
                history.goBack();
                toast.success('Appuntamento eliminato');
            })
            .catch((error) => toast.error(error.message))
            .finally(() => actions.closeDialog());
    };

    const confirmationDialog = (
        <>
            <DialogContent>
                <DialogContentText>Non sarà possibile recuperare tali informazioni.</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => actions.closeDialog()} color="primary" autoFocus>
                    Annulla
                </Button>
                <Button onClick={handleDeleteReservation} color="primary">
                    Elimina
                </Button>
            </DialogActions>
        </>
    );

    return (
        <div className={classes.container}>
            <Grid container justify="space-between">
                <Grid item xs={12} sm="auto">
                    <Typography variant="h6">Dettagli appuntamento</Typography>
                </Grid>

                <div className={classes.grow} />

                <Grid item>
                    <Tooltip title="Vai al giorno dell'appuntamento">
                        <IconButton
                            onClick={() =>
                                history.push('/reservations?date=' + reservation.date.toISOString().slice(0, 10))
                            }
                            data-testid="go-to-day"
                        >
                            <TodayRoundedIcon color="primary" />
                        </IconButton>
                    </Tooltip>
                </Grid>

                {customer && (
                    <>
                        <Grid item>
                            <Tooltip title="Assegna nuovo appuntamento allo stesso cliente">
                                <IconButton
                                    onClick={() => history.push('/add-reservation?customerId=' + customer.id)}
                                    data-testid="add-reservation"
                                >
                                    <AddCircleOutlineRoundedIcon color="primary" />
                                </IconButton>
                            </Tooltip>
                        </Grid>

                        <Grid item>
                            <Tooltip title="Vai alla scheda dettagli cliente">
                                <IconButton
                                    onClick={() => history.push('/customer-details/' + customer.id)}
                                    data-testid="customer-details"
                                >
                                    <AssignmentRoundedIcon color="primary" />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </>
                )}

                <Grid item>
                    <Tooltip title="Modifica appuntamento">
                        <IconButton
                            onClick={() => history.push('/edit-reservation/' + reservation.id)}
                            data-testid="edit-reservation"
                        >
                            <EditRoundedIcon color="primary" />
                        </IconButton>
                    </Tooltip>
                </Grid>

                <Grid item>
                    <Tooltip title="Elimina appuntamento">
                        <IconButton
                            onClick={() =>
                                actions.openDialog({
                                    title: 'Eliminare questo appuntamento definitivamente?',
                                    content: confirmationDialog,
                                })
                            }
                            data-testid="delete-reservation"
                        >
                            <DeleteRoundedIcon color="primary" />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>

            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="body1" className={classes.subtitle}>
                        Cliente
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <List disablePadding>
                        {[
                            {
                                label: 'Nome',
                                value: customer && customer.name + ' ' + (customer.surname || ''),
                                icon: <AssignmentIndRoundedIcon color="primary" />,
                            },
                            {
                                label: 'Identificatore aggiuntivo',
                                value: customer?.additionalIdentifier,
                                icon: <PersonPinCircleRoundedIcon color="primary" />,
                            },
                        ].map((item, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText
                                    primary={customer ? item.value || '---' : 'Informazione eliminata'}
                                    secondary={item.label}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <List disablePadding>
                        {[
                            {
                                label: 'Telefono',
                                value: customer?.phone,
                                icon: <PhoneRoundedIcon color="primary" />,
                            },
                            {
                                label: 'Note personali cliente',
                                value: customer?.notes,
                                icon: <PostAddRoundedIcon color="primary" />,
                            },
                        ].map((item, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText
                                    primary={customer ? item.value || '---' : 'Informazione eliminata'}
                                    secondary={item.label}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="body1" className={classes.subtitle}>
                        Appuntamento
                    </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <List disablePadding>
                        {[
                            {
                                label: 'Stato',
                                value: reservationStatusString,
                                icon: <AccessTimeRoundedIcon color="primary" />,
                            },
                            {
                                label: 'Servizio',
                                value: service?.name,
                                icon: <BuildRoundedIcon color="primary" />,
                            },
                            {
                                label: 'Dipendente assegnato',
                                value: employee?.name,
                                icon: <FaceRoundedIcon color="primary" />,
                            },
                        ].map((item, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.value || 'Informazione eliminata'} secondary={item.label} />
                            </ListItem>
                        ))}
                    </List>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <List disablePadding>
                        {[
                            {
                                label: 'Inizio appuntamento',
                                value: startTimeString,
                                icon: <TimerRoundedIcon color="primary" />,
                            },
                            {
                                label: 'Fine appuntamento',
                                value: endTimeString,
                                icon: <TimerOffRoundedIcon color="primary" />,
                            },
                            {
                                label: 'Note appuntamento',
                                value: reservation.notes || '---',
                                icon: <PostAddRoundedIcon color="primary" />,
                            },
                        ].map((item, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.value || 'Informazione eliminata'} secondary={item.label} />
                            </ListItem>
                        ))}
                    </List>
                </Grid>
            </Grid>
        </div>
    );
};

export default React.memo(
    ReservationDetails,
    (prevProps, nextProps) => prevProps.location.pathname === nextProps.location.pathname,
);
