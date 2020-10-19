import firebase from 'firebase/app';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

import { NewReservation, Customer, Reservation, isNewReservation, Employee, Service } from '../types';
import { PROGRESSIVE_MINS_WITHIN_HOUR, MIN_STEP, TIME_DATE_FORMAT, RESERVATIONS_COLLECTION } from '../config';
import { isEmployeeBusy, isEmployeeOnDuty } from '.';

const REQUIRED_FIELDS = ['serviceId'];

interface ReduxStore {
    employees: Array<Employee>;
    services: Array<Service>;
    reservations: Array<Reservation>;
}

/**
 * Validate user inputs and send them to database
 * @param id Document id to edit
 * @param formData Raw data from form
 * @param customer Valid Customer object requesting the reservation
 * @param selectedDate Date of the reservation
 * @param validationData Redux data from store.database for validation
 * @param forceAssignment Force assignment even if employee in not on duty
 */
const editReservation = async (
    id: string,
    formData: FormData,
    customer: Customer | null,
    selectedDate: MaterialUiPickersDate,
    { employees, services, reservations }: ReduxStore,
    forceAssignament?: boolean,
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

    if (!id || !isNewReservation(newReservation)) throw new Error('Errore interno. Contatta il supporto tecnico');

    const humanReadableDate = newReservation.date.toLocaleDateString('it-IT', TIME_DATE_FORMAT);

    const employee = employees.find((employee) => employee.id === newReservation.employeeId);
    if (!employee) throw new Error('Errore interno - Dipendente non trovato');

    if (isEmployeeBusy(newReservation, services, reservations, id))
        throw new Error(`${employee?.name} è già impegnato/a con un altro appuntamento ${humanReadableDate}.`);

    if (!forceAssignament && !isEmployeeOnDuty(newReservation.date, employee)) throw new Error('EMPLOYEE_NOT_ON_DUTY');

    (Object.keys(newReservation) as Array<keyof NewReservation>).forEach((key) => {
        if (newReservation[key] === undefined) delete newReservation[key];
    });

    try {
        await firebase.firestore().collection(RESERVATIONS_COLLECTION).doc(id).set(newReservation);
        return {
            id,
            ...newReservation,
        };
    } catch (error) {
        console.error(error);
        throw new Error('Connessione al database fallita');
    }
};

export default editReservation;
