import { Employee, Service, Customer, isNewReservation, NewReservation, Reservation } from '../types';
import firebase from 'firebase/app';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

import { PROGRESSIVE_MINS_WITHIN_HOUR, MIN_STEP, TIME_DATE_FORMAT, RESERVATIONS_COLLECTION } from '../config';
import { isEmployeeBusy, isEmployeeOnDuty } from '.';

const REQUIRED_FIELDS = ['serviceId'];

interface Database {
    employees: Array<Employee>;
    services: Array<Service>;
    reservations: Array<Reservation>;
}

/**
 * Validate user inputs and send them to database
 * @param formData Raw data from form
 * @param customer Customer requesting the reservation
 * @param selectedDate Date of the reservation
 * @param validationData Redux data from store.database for validation
 * @param forceAssignment Force assignment even if employee in not on duty
 */
const addReservation = async (
    formData: FormData,
    customer: Customer | null,
    selectedDate: MaterialUiPickersDate,
    { employees, services, reservations }: Database,
    forceAssignment?: boolean,
): Promise<Reservation> => {
    if (REQUIRED_FIELDS.some((fieldName) => !formData.get(fieldName)) || !customer)
        throw new Error('Compila i campi obbligatori');

    if (!selectedDate || (typeof selectedDate === 'number' && isNaN(selectedDate)))
        throw new Error('Seleziona una data valida');

    if (!PROGRESSIVE_MINS_WITHIN_HOUR.includes(selectedDate.getMinutes()))
        throw new Error(`L'orario indicano non rispetta lo scaglionamento orario dell'agenda.
        Utilizza intervalli di ${MIN_STEP} minuti.`);

    const newReservation: any = {
        date: selectedDate,
        customerId: customer.id,
        serviceId: formData.get('serviceId') || undefined,
        employeeId: formData.get('employeeId') || undefined,
        notes: formData.get('notes') || undefined,
    };

    if (!isNewReservation(newReservation)) throw new Error('Errore interno. Contatta il supporto tecnico');

    const humanReadableDate = newReservation.date.toLocaleDateString('it-IT', TIME_DATE_FORMAT);

    const employee = employees.find((employee) => employee.id === newReservation.employeeId);
    if (!employee) throw new Error('Errore interno - Dipendente non trovato');

    if (isEmployeeBusy(newReservation, services, reservations))
        throw new Error(`${employee?.name} è già impegnato/a con un altro appuntamento ${humanReadableDate}.`);

    if (!forceAssignment && !isEmployeeOnDuty(newReservation.date, employee)) throw new Error('EMPLOYEE_NOT_ON_DUTY');

    (Object.keys(newReservation) as Array<keyof NewReservation>).forEach((key) => {
        if (newReservation[key] === undefined) delete newReservation[key];
    });

    try {
        return {
            id: (await firebase.firestore().collection(RESERVATIONS_COLLECTION).add(newReservation)).id,
            ...newReservation,
        };
    } catch (error) {
        console.error(error);
        throw new Error('Connessione al database fallita');
    }
};

export default addReservation;
