import React, { FC, useState } from 'react';
import { Typography, IconButton, Tooltip, Grid } from '@material-ui/core';
import { RouteComponentProps } from 'react-router';
import { addDays, subDays } from 'date-fns';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import { DatePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

import { Employee, HourMinute } from '../../types';
import { hourMinuteToReadableString } from '../../utils';
import ReservationsTable from './ReservationsTable';
import useStyles from './style';

// Icons
import TodayRoundedIcon from '@material-ui/icons/TodayRounded';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';

const Reservations: FC<RouteComponentProps> = ({ location, history }) => {
    const classes = useStyles();
    const [calendarOpen, setCalendarOpen] = useState<boolean>(false);

    const today = new Date();
    const query = queryString.parse(location.search);
    let parsedDate;

    if (query.date) {
        /* Query format date=yyyy-mm-dd */
        const date = new Date(query.date as string);

        if (isNaN(date.getTime())) {
            toast.error('Formato data e ora non regolari');
        } else parsedDate = date;
    }

    const date = parsedDate || today;
    const isToday = date.toDateString() === today.toDateString();

    const handleNewReservation = (schedule: HourMinute, employee: Employee) => {
        const query = {
            /* Query format date=yyyy-mm-dd hour=HH:MM military time */
            date: date.toISOString().slice(0, 10),
            hour: hourMinuteToReadableString(schedule),
            employeeId: employee.id,
        };

        history.push(`/add-reservation?${queryString.stringify(query)}`);
    };

    const handleChangeDate = (date: MaterialUiPickersDate) => {
        if (date) {
            setCalendarOpen(false);
            /* Query format date=yyyy-mm-dd */
            history.push('/reservations?date=' + date.toISOString().slice(0, 10));
        }
    };

    return (
        <div className={classes.container} data-testid="reservations-route">
            <DatePicker
                className={classes.datePicker}
                open={calendarOpen}
                onOpen={() => setCalendarOpen(true)}
                onClose={() => setCalendarOpen(false)}
                format="d MMM yyyy"
                value={date}
                onChange={handleChangeDate}
                variant="dialog"
                showTodayButton={true}
                todayLabel="Oggi"
            />

            <Grid container justify="space-between" alignItems="center" className={classes.header} wrap="nowrap">
                <Grid item>
                    <Typography variant="h6" align="center">
                        {isToday
                            ? 'Appuntamenti oggi'
                            : 'Appuntamenti per ' +
                              date.toLocaleDateString('it-IT', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                              })}
                    </Typography>
                </Grid>

                <div className={classes.grow} />

                <Grid item>
                    <Tooltip title="Giorno precedente">
                        <IconButton
                            color="primary"
                            onClick={() =>
                                history.push('/reservations?date=' + subDays(date, 1).toISOString().slice(0, 10))
                            }
                        >
                            <ArrowBackIosRoundedIcon />
                        </IconButton>
                    </Tooltip>
                </Grid>

                <Grid item>
                    <Tooltip title="Giorno successivo">
                        <IconButton
                            color="primary"
                            onClick={() =>
                                history.push('/reservations?date=' + addDays(date, 1).toISOString().slice(0, 10))
                            }
                        >
                            <ArrowForwardIosRoundedIcon />
                        </IconButton>
                    </Tooltip>
                </Grid>

                <Grid item>
                    <Tooltip title="Cambia giorno">
                        <IconButton color="primary" onClick={() => setCalendarOpen(true)}>
                            <TodayRoundedIcon />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>

            <div className={classes.table}>
                <ReservationsTable date={date} handleNewReservation={handleNewReservation} />
            </div>
        </div>
    );
};

export default React.memo(
    Reservations,
    (prevProps, nextProps) => prevProps.location.search === nextProps.location.search,
);
