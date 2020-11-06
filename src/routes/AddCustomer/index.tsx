import React, { FC, useRef, FormEvent, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { Typography, TextField, Button, Divider, TextFieldProps, CircularProgress } from '@material-ui/core';
import { toast } from 'react-toastify';
import { DatePicker, DatePickerView } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

import { addCustomer } from '../../utils';
import useStyles from './style';

const AddCustomer: FC<RouteComponentProps> = ({ history }) => {
    const classes = useStyles();
    const [loading, setLoading] = useState<boolean>(false);
    const [birthday, setBirthday] = useState<MaterialUiPickersDate>(null);
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

        addCustomer(new FormData(inputForm.current), birthday)
            .then((customer) => {
                toast.success('Aggiunto nuovo cliente: ' + customer.name);
                history.push('/customers');
            })
            .catch((error) => {
                toast.error(error.message);
                setLoading(false);
            });
    };

    return (
        <div className={classes.container} data-testid="add-customer">
            <Typography variant="h6">Aggiungi cliente</Typography>

            <Divider className={classes.divider} />

            <form className={classes.form} ref={inputForm} onSubmit={handleSubmit} data-testid="form">
                <TextField {...fieldProps} inputProps={{ 'data-testid': 'name' }} name="name" label="Nome" required />
                <TextField {...fieldProps} inputProps={{ 'data-testid': 'surname' }} name="surname" label="Cognome" />
                <TextField
                    {...fieldProps}
                    inputProps={{ 'data-testid': 'additionalIdentifier' }}
                    name="additionalIdentifier"
                    label="Identificatore aggiuntivo"
                />
                <TextField {...fieldProps} inputProps={{ 'data-testid': 'phone' }} name="phone" label="Telefono" />

                <DatePicker
                    className={classes.field}
                    variant={'dialog'}
                    inputVariant={'outlined'}
                    disableFuture={true}
                    openTo={'year' as DatePickerView}
                    format={'dd/MM/yyyy'}
                    views={['year', 'month', 'date'] as Array<DatePickerView>}
                    label="Data di nascita"
                    value={birthday}
                    onChange={(date) => setBirthday(date)}
                    clearable={true}
                    clearLabel="Elimina"
                    cancelLabel="Annulla"
                    inputProps={{ 'data-testid': 'birthday' }}
                />

                <TextField
                    {...fieldProps}
                    inputProps={{ 'data-testid': 'notes' }}
                    name="notes"
                    label="Note"
                    multiline
                    rows={4}
                />

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
    AddCustomer,
    (prevProps, nextProps) => prevProps.location.search === nextProps.location.search,
);
