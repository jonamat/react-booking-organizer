import React, { FormEvent, ReactNode, FC, useRef, useState, useEffect } from 'react';
import { useStore, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import queryString from 'query-string';
import { KeyboardDateTimePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { RouteComponentProps } from 'react-router';
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
import Autocomplete from '@material-ui/lab/Autocomplete';

import { Customer, Service, Employee, RootState } from '../../types';
import { closeDialog, openDialog } from '../../redux';
import { MIN_STEP, PROGRESSIVE_MINS_WITHIN_HOUR, TIME_DATE_FORMAT } from '../../config';
import { bindActionCreators } from 'redux';
import { generateClosestValidDate, addReservation } from '../../utils';
import Alert from '../../components/Alert';
import useStyles from './style';

interface ParsedInfo {
    customer?: Customer; // Autocomplete needs the whole object
    employeeId?: string;
    date?: Date;
}

const AddReservation: FC<RouteComponentProps> = ({ history, location }) => {
    const classes = useStyles();
    const inputForm = useRef<HTMLFormElement>(null);
    const {
        database: { customers, employees, services, reservations },
    } = useStore<RootState>().getState();
    const actions = bindActionCreators({ openDialog, closeDialog }, useDispatch());

    if (!customers || !employees || !services || !reservations)
        throw new Error('Internal error - Resources loading logic broken');

    const [loading, setLoading] = useState<boolean>(false);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [employeeId, setEmployeeId] = useState<string | null>(employees[0].id);
    const [selectedDate, setSelectedDate] = useState<MaterialUiPickersDate>(generateClosestValidDate());

    useEffect(() => {
        /* Check & validate search query if provided */
        const query = queryString.parse(location.search);
        const parsed: ParsedInfo = {};

        // Get customer
        if (query.customerId) {
            const parsedCustomer = customers.find((customer) => customer.id === query.customerId);
            if (!parsedCustomer) toast.error('Cliente non presente nel database');
            else parsed.customer = parsedCustomer;
        }

        // Get employee
        if (query.employeeId) {
            if (!employees.find((employee) => employee.id === query.employeeId))
                toast.error('Dipendente non presente nel database');
            else parsed.employeeId = query.employeeId as string;
        }

        // Get date
        if (query.hour && query.date) {
            /* Query format date=yyyy-mm-dd hour=HH:MM military time */
            const date = new Date(query.date + 'T' + query.hour);

            if (isNaN(date.getTime())) {
                toast.error('Formato data e ora non regolari');
            } else if (!PROGRESSIVE_MINS_WITHIN_HOUR.includes(date.getMinutes())) {
                toast.error(`L'orario indicano non rispetta lo scaglionamento orario dell'agenda.
                Utilizza intervalli di ${MIN_STEP} minuti.`);
            } else if (date.getTime() < Date.now()) {
                toast.warn(`Attenzione! Stai assegnando questo appuntamento nel passato`);
                parsed.date = date;
            } else parsed.date = date;
        }

        // Update local state to pre fill the fields
        if (parsed.customer) setCustomer(parsed.customer);
        if (parsed.date) setSelectedDate(parsed.date);
        if (parsed.employeeId) setEmployeeId(parsed.employeeId);
    }, []);

    const handleSubmit = (event: FormEvent<HTMLFormElement>, forceAssignment?: boolean) => {
        event.preventDefault();
        if (!inputForm.current || !selectedDate) return;

        // Disable user interactions
        setLoading(true);

        addReservation(
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
                    'Aggiunto nuovo appuntamento per ' + reservation.date.toLocaleDateString('it-IT', TIME_DATE_FORMAT),
                );
                history.push(`/reservations?date=${reservation.date.toISOString().slice(0, 10)}`);
            })
            .catch((error: Error) => {
                // If employee is not on duty that day, ask for confirmation and calls recursively the fn
                if (error.message === 'EMPLOYEE_NOT_ON_DUTY') {
                    actions.openDialog({
                        title: `Il dipendente selezionato non è in servizio ${selectedDate.toLocaleDateString(
                            'it-IT',
                            TIME_DATE_FORMAT,
                        )}.`,
                        content: (
                            <Alert
                                cancelText="Annulla"
                                onCancel={actions.closeDialog}
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
    const handleChangeDate = (selectedDate: MaterialUiPickersDate) => setSelectedDate(selectedDate);
    const handleChangeCustomer = (_e: React.ChangeEvent<any>, customer: Customer | null) => setCustomer(customer);
    const handleChangeEmployeeId = (event) => setEmployeeId(event.target.value);

    // Case: user hasn't yet added services, customers or employees
    if (!services.length || !customers.length || !employees.length)
        return (
            <div className={classes.container} data-testid="add-reservation">
                <Typography variant="body1">
                    Devi aggiungere clienti, dipendenti e servizi prima di poter fissare appuntamenti
                </Typography>
            </div>
        );

    return (
        <div className={classes.container} data-testid="add-reservation">
            <Typography variant="h6">Aggiungi appuntamento</Typography>
            <Divider className={classes.divider} />
            <form className={classes.form} ref={inputForm} onSubmit={handleSubmit} data-testid="form">
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
                        defaultValue={services[0].id}
                        inputProps={{
                            'data-testid': 'service',
                        }}
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
                        value={employeeId}
                        onChange={handleChangeEmployeeId}
                        inputProps={{
                            'data-testid': 'employee',
                        }}
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
    AddReservation,
    (prevProps, nextProps) => prevProps.location.search === nextProps.location.search,
);
