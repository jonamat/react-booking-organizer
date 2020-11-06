import React, { FC, useRef, FormEvent, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { Typography, TextField, Button, Divider, TextFieldProps, CircularProgress } from '@material-ui/core';
import { toast } from 'react-toastify';

import { WeekWorkingShifts, Holiday } from '../../types';
import { addEmployee } from '../../utils';
import HolidaysField from '../../components/HolidaysField';
import ShiftsField from '../../components/ShiftsField';
import useStyles from './style';

const AddEmployee: FC<RouteComponentProps> = ({ history }) => {
    const classes = useStyles();
    const [loading, setLoading] = useState<boolean>(false);
    const [weekWorkingShifts, setWeekWorkingShifts] = useState<WeekWorkingShifts | null>(null);
    const [holidays, setHolidays] = useState<Array<Holiday> | null>(null);
    const inputForm = useRef<HTMLFormElement>(null);
    const fieldProps: TextFieldProps = {
        className: classes.field,
        variant: 'outlined',
        autoComplete: 'off',
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!inputForm.current) return;

        // Disable user interactions
        setLoading(true);

        addEmployee(new FormData(inputForm.current), weekWorkingShifts, holidays)
            .then((employee) => {
                toast.success('Aggiunto al personale: ' + employee.name);
                history.push('/employees');
            })
            .catch((error) => {
                toast.error(error.message);
                setLoading(false);
            });
    };

    return (
        <div className={classes.container} data-testid="add-employee">
            <Typography variant="h6">Aggiungi dipendente</Typography>
            <Divider className={classes.divider} />
            <form className={classes.form} ref={inputForm} onSubmit={handleSubmit}>
                <TextField {...fieldProps} inputProps={{ 'data-testid': 'name' }} name="name" label="Nome" required />

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
                        {loading ? 'Caricamento' : 'Aggiungi'}
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
    (prevProps, nextProps) => prevProps.location.search === nextProps.location.search,
);
