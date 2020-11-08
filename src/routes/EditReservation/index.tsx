import React, { FormEvent, ReactNode, FC, useRef, useState } from 'react';
import {
    Typography,
    TextField,
    Button,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
} from '@material-ui/core';
import { RouteComponentProps } from 'react-router';
import { useStore, useDispatch } from 'react-redux';
import { KeyboardDateTimePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { bindActionCreators } from 'redux';
import { toast } from 'react-toastify';

import { RootState, Customer, Service, Employee } from '../../types';
import { editReservation } from '../../utils';
import { openDialog, closeDialog } from '../../redux';
import { TIME_DATE_FORMAT } from '../../config';
import useStyles from './style';
import Alert from '../../components/Alert';

const EditReservation: FC<RouteComponentProps<{ reservationId: string }>> = ({ history, match }) => {
    const classes = useStyles();
    const inputForm = useRef<HTMLFormElement>(null);
    const {
        database: { customers, employees, services, reservations },
    } = useStore<RootState>().getState();
    const actions = bindActionCreators({ openDialog, closeDialog }, useDispatch());

    if (!services || !customers || !employees || !reservations)
        throw new Error('Internal error - Resources loading logic broken');

    const reservationId = match.params.reservationId;
    const reservation = reservations.find((reservation) => reservation.id === reservationId);
    const recordedCustomer = customers.find((customer) => customer.id === reservation?.customerId);

    if (!reservation) {
        toast.error('Appuntamento non presente nel database');
        history.push('/reservations');
        return null;
    }

    if (!recordedCustomer) {
        toast.error('Cliente non presente nel database');
        history.push('/reservations');
        return null;
    }

    const [loading, setLoading] = useState<boolean>(false);
    const [customer, setCustomer] = useState<Customer | null>(recordedCustomer);
    const [selectedDate, setSelected] = useState<MaterialUiPickersDate>(reservation.date);

    const handleSubmit = (event: FormEvent<HTMLFormElement>, forceAssignment?: boolean) => {
        event.preventDefault();
        if (!inputForm.current) return;

        // Disable user interactions
        setLoading(true);

        editReservation(
            reservationId,
            new FormData(inputForm.current),
            customer,
            selectedDate,
            {
                employees,
                services,
                reservations,
            },
            forceAssignment,
        )
            .then((reservation) => {
                toast.success(
                    "Modificato l'appuntamento per " + reservation.date.toLocaleDateString('it-IT', TIME_DATE_FORMAT),
                );
                history.push(`/reservations?date=${reservation.date.toISOString().slice(0, 10)}`);
            })
            .catch((error: Error) => {
                // If employee is not on duty that day, ask for confirmation and calls recursively the fn
                if (error.message === 'EMPLOYEE_NOT_ON_DUTY') {
                    actions.openDialog({
                        title: `Il dipendente selezionato non è in servizio ${selectedDate?.toLocaleDateString(
                            'it-IT',
                            TIME_DATE_FORMAT,
                        )}.`,
                        content: (
                            <Alert
                                cancelText="Annulla"
                                onCancel={() => {
                                    actions.closeDialog();
                                    setLoading(false);
                                }}
                                confirmText="Conferma"
                                onConfirm={() => {
                                    actions.closeDialog();

                                    // Re call the fn forcing the assignment
                                    handleSubmit(event, true);
                                }}
                                contentText="Vuoi assegnare comunque l'appuntamento?"
                            />
                        ),
                    });
                } else {
                    toast.error(error.message);
                    setLoading(false);
                }
            });
    };

    // Controlled components handlers
    const handleChangeDate = (selectedDate: MaterialUiPickersDate) => {
        setSelected(selectedDate);
    };
    const handleChangeCustomer = (_e: React.ChangeEvent<any>, customer: Customer | null) => {
        setCustomer(customer);
    };

    return (
        <div className={classes.container} data-testid="edit-reservation">
            <Typography variant="h6">Modifica appuntamento</Typography>
            <Divider className={classes.divider} />
            <form className={classes.form} ref={inputForm} onSubmit={handleSubmit} data-testid="form">
                <TextField
                    className={classes.field}
                    variant="outlined"
                    autoComplete="off"
                    name="id"
                    label="ID"
                    disabled
                    defaultValue={reservation.id}
                />

                <Autocomplete
                    classes={{
                        root: classes.field,
                        popupIndicator: classes.autocompleteIndicators,
                        clearIndicator: classes.autocompleteIndicators,
                    }}
                    value={customer}
                    options={customers}
                    getOptionLabel={(customer: Customer): string =>
                        customer.name +
                        (customer.surname ? ' ' + customer.surname : '') +
                        (customer.additionalIdentifier ? ' ' + customer.additionalIdentifier : '')
                    }
                    autoHighlight
                    noOptionsText="Cliente non trovato"
                    renderInput={(params): ReactNode => (
                        <TextField
                            {...params}
                            variant="outlined"
                            InputProps={{
                                ...params.InputProps,
                            }}
                            inputProps={{
                                ...params.inputProps,
                                'data-testid': 'customer',
                            }}
                            placeholder="Cliente"
                        />
                    )}
                    onChange={handleChangeCustomer}
                />

                <KeyboardDateTimePicker
                    className={classes.field}
                    variant="dialog"
                    inputVariant="outlined"
                    format="dd/MM/yyyy HH:mm"
                    ampm={false}
                    label="Data *"
                    invalidDateMessage="Data non valida"
                    minutesStep={15}
                    value={selectedDate}
                    onChange={handleChangeDate}
                    inputProps={{
                        'data-testid': 'date',
                    }}
                />

                <FormControl variant="outlined" className={classes.field} required>
                    <InputLabel className={classes.label} id="servicesIdLabel">
                        Servizio
                    </InputLabel>
                    <Select
                        labelId="servicesIdLabel"
                        name="serviceId"
                        inputProps={{
                            'data-testid': 'service',
                        }}
                        defaultValue={reservation.serviceId}
                    >
                        {services.map((service: Service) => (
                            <MenuItem key={service.id} value={service.id}>
                                {service.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl variant="outlined" className={classes.field} required>
                    <InputLabel className={classes.label} id="employeeIdLabel">
                        Assegnato a
                    </InputLabel>
                    <Select
                        labelId="employeeIdLabel"
                        name="employeeId"
                        inputProps={{
                            'data-testid': 'employee',
                        }}
                        defaultValue={reservation.employeeId}
                    >
                        {employees.map((employee: Employee) => (
                            <MenuItem key={employee.id} value={employee.id}>
                                {employee.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    className={classes.field}
                    variant="outlined"
                    autoComplete="off"
                    name="notes"
                    label="Note"
                    multiline
                    rows={4}
                    defaultValue={reservation.notes || ''}
                    inputProps={{
                        'data-testid': 'notes',
                    }}
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
    EditReservation,
    (prevProps, nextProps) => prevProps.location.pathname === nextProps.location.pathname,
);
