import firebase from 'firebase/app';

import { NewEmployee, Employee, isNewEmployee, WeekWorkingShifts, Holiday } from '../types';
import { EMPLOYEES_COLLECTION } from '../config';

const REQUIRED_FIELDS = ['name'];

/**
 * Validate user inputs and send them to database
 * @param formData Raw data from form
 * @param weekWorkingShifts Valid WeekWorkingShift object
 * @param holidays Valid Holiday array
 */
const addEmployee = async (
    formData: FormData,
    weekWorkingShifts?: WeekWorkingShifts | null,
    holidays?: Array<Holiday> | null,
): Promise<Employee> => {
    if (REQUIRED_FIELDS.some((fieldName) => !formData.get(fieldName))) throw new Error('Compila i campi obbligatori');

    const newEmployee: any = {
        name: formData.get('name') || undefined,
        weekWorkingShifts,
        holidays,
    };

    if (!isNewEmployee(newEmployee)) throw new Error('Errore interno. Contatta il supporto tecnico');

    (Object.keys(newEmployee) as Array<keyof NewEmployee>).forEach((key) => {
        if (newEmployee[key] === undefined) delete newEmployee[key];
    });

    try {
        return {
            id: (await firebase.firestore().collection(EMPLOYEES_COLLECTION).add(newEmployee)).id,
            ...newEmployee,
        };
    } catch (error) {
        console.error(error);
        throw new Error('Connessione al database fallita');
    }
};

export default addEmployee;
