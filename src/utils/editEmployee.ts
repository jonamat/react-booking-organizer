import firebase from 'firebase/app';

import { NewEmployee, isNewEmployee, Employee, WeekWorkingShifts, Holiday } from '../types';
import { EMPLOYEES_COLLECTION } from '../config';

const REQUIRED_FIELDS = ['name'];

/**
 * Validate user inputs and send them to database
 * @param id Document id to edit
 * @param formData Raw data from form
 * @param weekWorkingShifts Valid WeekWorkingShift object
 * @param holidays Valid Holiday array
 */
const editEmployee = async (
    id: string,
    formData: FormData,
    weekWorkingShifts?: WeekWorkingShifts | null,
    holidays?: Array<Holiday> | null,
): Promise<Employee> => {
    if (REQUIRED_FIELDS.some((fieldName) => !formData.get(fieldName))) throw new Error('Compila i campi obbligatori');

    const newEmployee: any = {
        name: formData.get('name') || undefined,
        weekWorkingShifts: weekWorkingShifts,
        holidays,
    };

    if (!id || !isNewEmployee(newEmployee)) throw new Error('Errore interno. Contatta il supporto tecnico');

    (Object.keys(newEmployee) as Array<keyof NewEmployee>).forEach((key) => {
        if (newEmployee[key] === undefined) delete newEmployee[key];
    });

    try {
        await firebase.firestore().collection(EMPLOYEES_COLLECTION).doc(id).set(newEmployee);
        return {
            id,
            ...newEmployee,
        };
    } catch (error) {
        console.error(error);
        throw new Error('Connessione al database fallita');
    }
};

export default editEmployee;
