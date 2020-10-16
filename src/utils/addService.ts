import firebase from 'firebase/app';

import { NewService, isNewService, Service } from '../types';
import { PROGRESSIVE_MINS_WITHIN_MAX_SERVICE, SERVICES_COLLECTION } from '../config';

const REQUIRED_FIELDS = ['name', 'averageDuration'];

/**
 * Validate user inputs and send them to database
 * @param formData Raw data from form
 */
const addService = async (formData: FormData): Promise<Service> => {
    if (REQUIRED_FIELDS.some((fieldName) => !formData.get(fieldName))) throw new Error('Compila i campi obbligatori');

    const newService: any = {
        name: formData.get('name') || undefined,
        averageDuration: parseInt(formData.get('averageDuration') as string) || undefined,
    };

    if (!isNewService(newService) || !PROGRESSIVE_MINS_WITHIN_MAX_SERVICE.includes(newService.averageDuration))
        throw new Error('Errore interno. Contatta il supporto tecnico');

    (Object.keys(newService) as Array<keyof NewService>).forEach((key) => {
        if (newService[key] === undefined) delete newService[key];
    });

    try {
        return {
            id: (await firebase.firestore().collection(SERVICES_COLLECTION).add(newService)).id,
            ...newService,
        };
    } catch (error) {
        console.error(error);
        throw new Error('Connessione al database fallita');
    }
};

export default addService;
