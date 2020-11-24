import React, { FC, useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { RouteComponentProps } from 'react-router';
import { connect, ConnectedProps } from 'react-redux';
import MaterialTable from 'material-table';

import { RootState } from '../../types';
import { closeDialog, openDialog } from '../../redux';
import { MATERIAL_TABLE_LOCALIZATION } from '../../config';

import useStyles from './style';
import { addDays, isValid, isWithinInterval, setYear } from 'date-fns';
import { endOfDay, startOfDay } from 'date-fns';
import { Grid, Typography } from '@material-ui/core';

// How many days before the birthday do you want to display it in the table
const DAYS_OF_FOREWARNING = 7;

interface BirthdaysProps extends RouteComponentProps, ReduxProps {}

const mapStateToProps = (state: RootState) => ({
    customers: state.database.customers,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({ closeDialog, openDialog }, dispatch);
const connector = connect(mapStateToProps, mapDispatchToProps);
type ReduxProps = ConnectedProps<typeof connector>;

const Birthdays: FC<BirthdaysProps> = ({ history, customers }) => {
    if (!customers) throw new Error('Internal error - Resources loading logic broken');
    const classes = useStyles();
    const today = new Date();

    /**
     * This fix the "last days of the year" bug.
     * If the birthday is in early January, we cannot detect it in the last days of December.
     * This behavior is due to the fact that the birthday is acquired as an instance of Date.
     * In the last days of the year the birthday be brought to the following year to be recognizable.
     * @param date Any Date to be calculated
     * @return The rectified Date
     */
    const rectifyDate = (date: Date): Date =>
        today.getMonth() === 11 && today.getDate() > 31 - DAYS_OF_FOREWARNING
            ? setYear(date, today.getFullYear() + 1)
            : setYear(date, today.getFullYear());

    // Birthdays within DAYS_OF_FOREWARNING days
    const birthdaysInSight = useMemo(() => {
        return customers.filter(
            (customer) =>
                customer.birthday &&
                isValid(customer.birthday) &&
                isWithinInterval(rectifyDate(customer.birthday), {
                    start: startOfDay(today),
                    end: endOfDay(addDays(today, DAYS_OF_FOREWARNING)),
                }),
        );
    }, [customers]);

    const birthdaysToday = birthdaysInSight.filter(
        (customer) =>
            customer.birthday &&
            isWithinInterval(rectifyDate(customer.birthday), {
                start: startOfDay(today),
                end: endOfDay(today),
            }),
    );

    const birthdaysInSightExceptToday = birthdaysInSight.filter(
        (customer) =>
            customer.birthday &&
            !isWithinInterval(rectifyDate(customer.birthday), {
                start: startOfDay(today),
                end: endOfDay(today),
            }),
    );

    return (
        <div className={classes.container} data-testid="birthdays">
            {!!birthdaysInSight.length ? (
                <>
                    {!!birthdaysToday.length && (
                        <MaterialTable
                            onRowClick={(_e, rowData) => history.push('/customer-details/' + rowData?.id)}
                            columns={[
                                {
                                    title: 'Nome',
                                    field: 'name',
                                    render: (rowData) =>
                                        `${rowData.name} ${rowData.surname || ''} ${
                                            rowData.additionalIdentifier || ''
                                        }`,
                                },
                                { title: 'Telefono', field: 'phone' },
                                {
                                    title: 'Giorno del compleanno',
                                    field: 'birthday',
                                    render: (rowData) =>
                                        rowData.birthday?.toLocaleDateString('it-IT', {
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'long',
                                        }),
                                },
                            ]}
                            data={birthdaysToday}
                            title="Compleanni oggi"
                            options={{
                                search: false,
                                paging: false,
                            }}
                            localization={MATERIAL_TABLE_LOCALIZATION}
                        />
                    )}

                    {!!birthdaysInSightExceptToday.length && (
                        <MaterialTable
                            onRowClick={(_e, rowData) => history.push('/customer-details/' + rowData?.id)}
                            columns={[
                                {
                                    title: 'Nome',
                                    field: 'name',
                                    render: (rowData) =>
                                        `${rowData.name} ${rowData.surname || ''} ${
                                            rowData.additionalIdentifier || ''
                                        }`,
                                },
                                { title: 'Telefono', field: 'phone' },
                                {
                                    title: 'Giorno del compleanno',
                                    field: 'birthday',
                                    render: (rowData) =>
                                        rowData.birthday?.toLocaleDateString('it-IT', {
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'long',
                                        }),
                                },
                            ]}
                            data={birthdaysInSightExceptToday}
                            title={`Compleanni nei prossimi ${DAYS_OF_FOREWARNING} giorni`}
                            options={{
                                search: false,
                                paging: false,
                            }}
                            localization={MATERIAL_TABLE_LOCALIZATION}
                        />
                    )}
                </>
            ) : (
                <Grid className={classes.noBirthdays} container alignItems="center" justify="center">
                    <Typography variant="h6">Non ci sono compleanni a breve</Typography>
                </Grid>
            )}
        </div>
    );
};

export default connector(
    React.memo(Birthdays, (prevProps, nextProps) => prevProps.location.search === nextProps.location.search),
);
