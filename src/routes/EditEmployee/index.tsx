import React, { FC, useRef, FormEvent, useState } from 'react';
import { Typography, TextField, Button, Divider, TextFieldProps, CircularProgress } from '@material-ui/core';
import { RouteComponentProps } from 'react-router';
import { useStore } from 'react-redux';
import { toast } from 'react-toastify';

import { RootState, WeekWorkingShifts, Holiday } from '../../types';
import { editEmployee } from '../../utils';
import useStyles from './style';
import ShiftsField from '../../components/ShiftsField';
import HolidaysField from '../../components/HolidaysField';

const AddEmployee: FC<RouteComponentProps<{ employeeId: string }>> = ({ history, match }) => {
    const classes = useStyles();
    const [loading, setLoading] = useState<boolean>(false);
    const inputForm = useRef<HTMLFormElement>(null);
    const {
        database: { employees },
    } = useStore<RootState>().getState();

    const fieldProps: TextFieldProps = {
        className: classes.field,
        variant: 'outlined',
        autoComplete: 'off',
    };

    if (!employees) throw new Error('Internal error - Resources loading logic broken');

    // Get employee to edit
    const employeeId = match.params.employeeId;
    const employee = employees.find((employee) => employee.id === employeeId);

    if (!employee) {
        toast.error('Dipendente non presente nel database');
        history.push('/employees');
        return null;
    }

    const [weekWorkingShifts, setWeekWorkingShifts] = useState<WeekWorkingShifts | null>(
        employee.weekWorkingShifts || null,
    );

    const [holidays, setHolidays] = useState<Array<Holiday> | null>(employee.holidays || null);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!inputForm.current) return;

        // Disable user interactions
        setLoading(true);

        editEmployee(employeeId, new FormData(inputForm.current), weekWorkingShifts, holidays)
            .then((employee) => {
                toast.success('Modificato dipendente: ' + employee.name);
                history.push('/employees');
            })
            .catch((error) => {
                toast.error(error.message);
                setLoading(false);
            });
    };

    return (
        <div className={classes.container} data-testid="edit-employee">
            <Typography variant="h6">Modifica dipendente</Typography>
            <Divider className={classes.divider} />
            <form className={classes.form} ref={inputForm} onSubmit={handleSubmit}>
                <TextField {...fieldProps} name="id" label="ID" required disabled defaultValue={employee.id} />
                <TextField
                    {...fieldProps}
                    inputProps={{ 'data-testid': 'name' }}
                    name="name"
                    label="Nome"
                    required
                    defaultValue={employee.name}
                />

                <ShiftsField
                    classes={{ root: classes.field }}
                    value={weekWorkingShifts}
                    onSelect={setWeekWorkingShifts}
                />

                <HolidaysField classes={{ root: classes.field }} value={holidays} onSelect={setHolidays} />

                <div className={classes.submitButton}>
                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                        data-testid="submit-button"
                    >
                        {loading ? 'Caricamento' : 'Applica modifiche'}
                    </Button>
                    <Button variant="contained" color="primary" disabled={loading} onClick={() => history.goBack()}>
                        Annulla
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default React.memo(
    AddEmployee,
    (prevProps, nextProps) => prevProps.location.pathname === nextProps.location.pathname,
);
