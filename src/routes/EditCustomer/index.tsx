import React, { FC, useRef, FormEvent, useState } from 'react';
import { Typography, TextField, Button, Divider, TextFieldProps, CircularProgress } from '@material-ui/core';
import { RouteComponentProps } from 'react-router';
import { useStore } from 'react-redux';
import { toast } from 'react-toastify';

import { RootState } from '../../types';
import { editCustomer } from '../../utils';
import useStyles from './style';
import { DatePicker, DatePickerView } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

const EditCustomer: FC<RouteComponentProps<{ customerId: string }>> = ({ history, match }) => {
    const classes = useStyles();
    const [loading, setLoading] = useState<boolean>(false);
    const inputForm = useRef<HTMLFormElement>(null);
    const {
        database: { customers },
    } = useStore<RootState>().getState();

    const fieldProps: TextFieldProps = {
        className: classes.field,
        variant: 'outlined',
        autoComplete: 'off',
    };

    if (!customers) throw new Error('Internal error - Resources loading logic broken');

    // Get customer to edit
    const customerId = match.params.customerId;
    const customer = customers.find((customer) => customer.id === customerId);

    if (!customer) {
        toast.error('Cliente non presente nel database');
        history.push('/customers');
        return null;
    }

    const [birthday, setBirthday] = useState<MaterialUiPickersDate>(customer?.birthday || null);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!inputForm.current) return;

        // Disable user interactions
        setLoading(true);

        editCustomer(customerId, new FormData(inputForm.current), birthday)
            .then((customer) => {
                toast.success('Modificato cliente: ' + customer.name);
                history.push('/customers');
            })
            .catch((error) => {
                toast.error(error.message);
                setLoading(false);
            });
    };

    return (
        <div className={classes.container} data-testid="edit-customer">
            <Typography variant="h6">Modifica cliente</Typography>
            <Divider className={classes.divider} />
            <form className={classes.form} ref={inputForm} onSubmit={handleSubmit} data-testid="form">
                <TextField {...fieldProps} name="id" label="ID" required disabled defaultValue={customer.id} />
                <TextField
                    {...fieldProps}
                    inputProps={{ 'data-testid': 'name' }}
                    name="name"
                    label="Nome"
                    required
                    defaultValue={customer.name}
                />
                <TextField
                    {...fieldProps}
                    inputProps={{ 'data-testid': 'surname' }}
                    name="surname"
                    label="Cognome"
                    defaultValue={customer.surname || ''}
                />
                <TextField
                    {...fieldProps}
                    inputProps={{ 'data-testid': 'additionalIdentifier' }}
                    name="additionalIdentifier"
                    label="Identificatore aggiuntivo"
                    defaultValue={customer.additionalIdentifier || ''}
                />
                <TextField
                    {...fieldProps}
                    inputProps={{ 'data-testid': 'phone' }}
                    name="phone"
                    label="Telefono"
                    defaultValue={customer.phone || ''}
                />
                <DatePicker
                    className={classes.field}
                    variant={'dialog'}
                    inputVariant={'outlined'}
                    disableFuture={true}
                    openTo={'year' as DatePickerView}
                    format={'dd/MM/yyyy'}
                    views={['year', 'month', 'date'] as Array<DatePickerView>}
                    label="Data di nascita"
                    inputProps={{ 'data-testid': 'birthday' }}
                    value={birthday}
                    onChange={(date) => setBirthday(date)}
                    clearable={true}
                    clearLabel="Elimina"
                    cancelLabel="Annulla"
                />

                <TextField
                    {...fieldProps}
                    inputProps={{ 'data-testid': 'notes' }}
                    name="notes"
                    label="Note"
                    multiline
                    rows={4}
                    defaultValue={customer.notes || ''}
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
    EditCustomer,
    (prevProps, nextProps) => prevProps.location.pathname === nextProps.location.pathname,
);
