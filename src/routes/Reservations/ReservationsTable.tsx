import React, { FC, useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { connect, ConnectedProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { IconButton, Typography, Grid, Tooltip } from '@material-ui/core';

import { moveEmployee } from '../../redux';
import { Employee, Reservation, HourMinute, RootState } from '../../types';
import { PROGRESSIVE_HOURS_WITHIN_BUSINESS_DAY } from '../../config';
import { getReservationsByDate, hourMinuteToReadableString, isEmployeeOnDuty } from '../../utils';
import ReservationPanel from '../../components/ReservationPanel';
import { useReservationTableStyles } from './style';

// Icons
import AddCircleOutlineRoundedIcon from '@material-ui/icons/AddCircleOutlineRounded';
import AdjustIcon from '@material-ui/icons/Adjust';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';

interface ReservationsTableProps extends ReduxProps, RouteComponentProps {
    handleNewReservation: (schedule: HourMinute, employee: Employee) => void;
    date: Date;
}

const mapStateToProps = (state: RootState) => ({
    employees: state.database.employees,
    reservations: state.database.reservations,
    employeesOrder: state.status.employeesOrder,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({ moveEmployee }, dispatch);
const connector = connect(mapStateToProps, mapDispatchToProps);
type ReduxProps = ConnectedProps<typeof connector>;

const ReservationsTable: FC<ReservationsTableProps> = ({
    employees,
    reservations,
    handleNewReservation,
    date,
    employeesOrder,
    moveEmployee,
}) => {
    const classes = useReservationTableStyles();

    if (!reservations || !employees) throw new Error('Internal error - Resources loading logic broken');

    if (employeesOrder) employees.sort((a, b) => employeesOrder.indexOf(a.id) - employeesOrder.indexOf(b.id));

    // Reservation in the given Date
    const reservationsInDate = useMemo(() => getReservationsByDate(reservations, date), [reservations, date]);

    /**
     * Generate an array of HH-mm-{employeeId} strings to open a ReservationPanel.
     * This approach avoid the calculation for each table cell by using a faster comparison at render time
     */
    const reservationCellsIds = useMemo(
        () => reservationsInDate.map(({ date, employeeId }) => `${date.getHours()}-${date.getMinutes()}-${employeeId}`),
        [reservations, date],
    );
    const extractReservation = ({ hour, minute }: HourMinute, cellEmployeeId: string): Reservation | undefined => {
        const matched = reservationsInDate.find(
            ({ date, employeeId }) =>
                date.getHours() === hour && date.getMinutes() === minute && employeeId === cellEmployeeId,
        );
        if (!matched) {
            console.warn(
                `A reservation scheduled for ${date.toLocaleTimeString(
                    'it-IT',
                )} and assigned to employee id ${cellEmployeeId} is missing.`,
            );
        }
        return matched;
    };

    if (!employees.length)
        return (
            <div className={classes.tableContainer}>
                Aggiungi dei dipendenti per utilizzare la tabella degli appuntamenti
            </div>
        );

    return (
        <div className={classes.tableContainer}>
            <table className={classes.table}>
                <thead>
                    <tr>
                        <th>
                            <Typography variant="body1" className={classes.headerText}>
                                Orario
                            </Typography>
                        </th>
                        {employees.map((employee) => (
                            <th key={employee.id} data-testid={employee.id}>
                                <Grid container justify="space-around" alignItems="center">
                                    <IconButton
                                        size="small"
                                        className={classes.moveIcon}
                                        onClick={() => moveEmployee('BACK', employee.id)}
                                    >
                                        <Tooltip title="Sposta colonna dipendente a sinistra">
                                            <ArrowBackIosRoundedIcon />
                                        </Tooltip>
                                    </IconButton>
                                    <Typography variant="body1" className={classes.headerText}>
                                        {employee.name}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        className={classes.moveIcon}
                                        onClick={() => moveEmployee('FORWARD', employee.id)}
                                    >
                                        <Tooltip title="Sposta colonna dipendente a destra">
                                            <ArrowForwardIosRoundedIcon />
                                        </Tooltip>
                                    </IconButton>
                                </Grid>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {PROGRESSIVE_HOURS_WITHIN_BUSINESS_DAY.map((schedule) => {
                        const humanReadableHour = hourMinuteToReadableString(schedule);
                        const scheduleDate = new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate(),
                            schedule.hour,
                            schedule.minute,
                        );

                        return (
                            <tr key={humanReadableHour}>
                                <td>
                                    <Typography variant="body1" className={classes.headerText}>
                                        {humanReadableHour}
                                    </Typography>
                                </td>
                                {employees.map((employee) => (
                                    <td key={humanReadableHour + employee.id}>
                                        {reservationCellsIds.includes(
                                            `${schedule.hour}-${schedule.minute}-${employee.id}`,
                                        ) ? (
                                            <div
                                                className={classes.fixHeightWrapper}
                                                data-testid="reservation-panel-container"
                                            >
                                                <ReservationPanel
                                                    reservation={extractReservation(schedule, employee.id)}
                                                />
                                            </div>
                                        ) : isEmployeeOnDuty(scheduleDate, employee) ? (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleNewReservation(schedule, employee)}
                                                data-testid="add-reservation-btn"
                                            >
                                                <Tooltip title="Assegna appuntamento">
                                                    <AddCircleOutlineRoundedIcon />
                                                </Tooltip>
                                            </IconButton>
                                        ) : (
                                            <IconButton
                                                className={classes.notOnDutyIcon}
                                                size="small"
                                                onClick={() => handleNewReservation(schedule, employee)}
                                            >
                                                <Tooltip title="Non in servizio">
                                                    <AdjustIcon />
                                                </Tooltip>
                                            </IconButton>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default connector(withRouter(ReservationsTable));
