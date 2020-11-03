import React, { FC, useEffect, useState } from 'react';
import { Typography, Paper } from '@material-ui/core';
import { useStore } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';

import { Customer, Reservation, RootState } from '../../types';
import { MIN_STEP, TIME_DATE_FORMAT } from '../../config';
import { getReservationStatus } from '../../utils';
import useStyle from './style';

interface ReservationsTableProps extends RouteComponentProps {
    reservation: Reservation | undefined;
    showDetails?: boolean;
}

export const composeName = (customer: Customer): string =>
    customer.name +
    (customer.surname ? ' ' + customer.surname : '') +
    (customer.additionalIdentifier ? ' ' + customer.additionalIdentifier : '');

const ReservationPanel: FC<ReservationsTableProps> = ({ reservation, showDetails, history }) => {
    const {
        database: { services, customers },
    } = useStore<RootState>().getState();

    if (!reservation || !services || !customers) throw new Error('Internal error - Resources loading logic broken');

    // Re-render every minute to check the reservation status and adjust the bg color
    const [, update] = useState({});
    useEffect(() => {
        const updateForStatus = setInterval(() => update({}), 1000 * 60);
        return () => clearInterval(updateForStatus);
    }, []);

    const service = services.find((service) => service.id === reservation.serviceId);
    const customer = customers.find((customer) => customer.id === reservation.customerId);

    const handleReservationDetails = () => history.push('/reservation-details/' + reservation.id);

    // Style variants
    const reservationStatus = service ? getReservationStatus(reservation.date, service.averageDuration) : 'ERROR';
    const occupiedCellsSpace = showDetails ? 4 : service ? service.averageDuration / MIN_STEP : 1;

    const classes = useStyle({ occupiedCellsSpace, showDetails, reservationStatus });

    return (
        <Paper className={classes.container} onClick={handleReservationDetails}>
            <div className={classes.spacing}>
                {showDetails && (
                    <Typography variant="subtitle2" className={classes.date} data-testid="date">
                        {reservation.date.toLocaleDateString('it-IT', TIME_DATE_FORMAT)}
                    </Typography>
                )}
                {customer && (
                    <Typography variant="body2" className={classes.name} data-testid="name">
                        {composeName(customer)}
                    </Typography>
                )}
                {(!service || !customer) && (
                    <Typography variant="body2" className={classes.ongoing} data-testid="missing-info">
                        Informazioni mancanti
                    </Typography>
                )}
                {reservationStatus === 'ONGOING' && (
                    <Typography variant="body2" className={classes.ongoing} data-testid="ongoing-now">
                        In corso
                    </Typography>
                )}
                {service && (
                    <Typography variant="caption" className={classes.service} data-testid="service">
                        {service.name}
                    </Typography>
                )}
                {reservation.notes && (
                    <Typography variant="body2" data-testid="notes">
                        {reservation.notes}
                    </Typography>
                )}
            </div>
        </Paper>
    );
};

export default withRouter(ReservationPanel);
