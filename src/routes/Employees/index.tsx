import React, { FC } from 'react';
import { RouteComponentProps } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect, ConnectedProps } from 'react-redux';
import { CircularProgress, Typography } from '@material-ui/core';
import { toast } from 'react-toastify';
import MaterialTable from 'material-table';

import { closeDialog, openDialog } from '../../redux';
import { Employee, WeekWorkingShifts, Holiday, RootState } from '../../types';
import { MATERIAL_TABLE_LOCALIZATION, WEEK_DAYS } from '../../config';
import { deleteEmployee, translateWeekDays, hourMinuteToReadableString } from '../../utils';
import useStyles from './style';
import Center from '../../components/Center';
import Alert from '../../components/Alert';

interface EmployeesProps extends RouteComponentProps, ReduxProps {}

const mapStateToProps = (state: RootState) => ({
    employees: state.database.employees,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({ closeDialog, openDialog }, dispatch);
const connector = connect(mapStateToProps, mapDispatchToProps);
type ReduxProps = ConnectedProps<typeof connector>;

const renderShifts = (weekWorkingShifts: WeekWorkingShifts) =>
    (Object.keys(weekWorkingShifts) as Array<keyof WeekWorkingShifts>)
        .sort((dayA, dayB) => WEEK_DAYS.indexOf(dayA) - WEEK_DAYS.indexOf(dayB))
        .map((day) => (
            <div key={day} style={{ display: 'block' }}>
                <Typography variant="body2" display="inline" style={{ fontWeight: 600 }}>
                    {translateWeekDays(day).slice(0, 3)}:{' '}
                </Typography>
                <Typography variant="body2" display="inline">
                    {weekWorkingShifts?.[day]
                        ?.map(
                            (shift) =>
                                `dalle ${hourMinuteToReadableString(shift.startTime)} alle ${hourMinuteToReadableString(
                                    shift.endTime,
                                )}`,
                        )
                        .join(' e ')}
                </Typography>
            </div>
        ));

const renderHolidays = (holidays: Array<Holiday>) =>
    holidays
        .sort((intA, intB) => intA.startDay.getTime() - intB.startDay.getTime())
        .map((holiday, index) => (
            <div key={index}>
                <Typography variant="body2" display="inline" style={{ fontWeight: 600 }}>
                    {'Dal '}
                </Typography>
                <Typography variant="body2" display="inline">
                    {holiday.startDay.toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </Typography>
                <Typography variant="body2" display="inline" style={{ fontWeight: 600 }}>
                    {' al '}
                </Typography>
                <Typography variant="body2" display="inline">
                    {holiday.endDay.toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </Typography>
            </div>
        ));

const Employees: FC<EmployeesProps> = ({ history, employees, closeDialog, openDialog }) => {
    const classes = useStyles();

    if (!employees) throw new Error('Internal error - Resources loading logic broken');

    const handleEditData = (_e: any, data: Employee) => history.push('/edit-employee/' + data.id);
    const handleAddElement = () => history.push('/add-employee');

    const handleDelete = (employee: Employee) => {
        openDialog({
            title: 'Eliminazione in corso',
            content: (
                <Center style={{ height: 100 }}>
                    <CircularProgress />
                </Center>
            ),
        });
        deleteEmployee(employee)
            .then(() => {
                history.push('/employees?deleted-element=' + employee.id);
                closeDialog();
                toast.success('Dipendente eliminato: ' + employee.name);
            })
            .catch((error: Error) => toast.error(error.message));
    };

    const handleConfirmationDialog = (_e: any, data: Employee) => {
        openDialog({
            title: 'Elimina dipendente',
            content: (
                <Alert
                    cancelText="Annulla"
                    onCancel={closeDialog}
                    confirmText="Elimina"
                    onConfirm={() => handleDelete(data)}
                    contentText=" Eliminando questo dipendente perderai il riferimento ad esso a tutti gli appuntamenti a cui è stato
        assegnato (ma non eliminerai gli appuntamenti). Non sarà possibile recuperare tali informazioni."
                />
            ),
        });
    };

    return (
        <div className={classes.container} data-testid="employees">
            <MaterialTable
                columns={[
                    {
                        title: 'Nome',
                        field: 'name',
                        cellStyle: {
                            width: 100,
                        },
                        headerStyle: {
                            maxWidth: '100px !important',
                        },
                    },
                    {
                        title: 'Turni',
                        field: 'weekWorkingShifts',
                        emptyValue: 'Non definiti',
                        render: (rowData) =>
                            rowData.weekWorkingShifts ? renderShifts(rowData.weekWorkingShifts) : null,
                    },
                    {
                        title: 'Ferie',
                        field: 'holidays',
                        emptyValue: 'Non definite',
                        render: (rowData) => (rowData.holidays ? renderHolidays(rowData.holidays) : null),
                    },
                ]}
                data={employees}
                title="Personale"
                actions={[
                    {
                        icon: 'edit',
                        tooltip: 'Modifica',
                        onClick: handleEditData,
                    },
                    {
                        icon: 'delete',
                        tooltip: 'Elimina',
                        onClick: handleConfirmationDialog,
                    },
                    {
                        icon: 'add',
                        tooltip: 'Aggiungi dipendente',
                        isFreeAction: true,
                        onClick: handleAddElement,
                    },
                ]}
                options={{
                    actionsColumnIndex: -1,
                    search: true,
                    pageSize: 5,
                    pageSizeOptions: [5, 10, 20],
                }}
                localization={MATERIAL_TABLE_LOCALIZATION}
            />
        </div>
    );
};
export default connector(
    React.memo(Employees, (prevProps, nextProps) => prevProps.location.search === nextProps.location.search),
);
