import firebase from 'firebase/app';

import { NewService, Service, isNewService } from '../types';
import { SERVICES_COLLECTION } from '../config';

const REQUIRED_FIELDS = ['name', 'averageDuration'];

/**
 * Validate user inputs and send them to database
 * @param id Document id to edit
 * @param formData Raw data from form
 */
const editService = async (id: string, formData: FormData): Promise<Service> => {
    if (REQUIRED_FIELDS.some((fieldName) => !formData.get(fieldName))) throw new Error('Compila i campi obbligatori');

    const newService: any = {
        name: formData.get('name') || undefined,
        averageDuration: parseInt(formData.get('averageDuration') as string),
    };

    if (!id || !isNewService(newService)) throw new Error('Errore interno. Contatta il supporto tecnico');

    (Object.keys(newService) as Array<keyof NewService>).forEach((key) => {
        if (newService[key] === undefined) delete newService[key];
    });

    try {
        await firebase.firestore().collection(SERVICES_COLLECTION).doc(id).set(newService);
        return {
            id,
            ...newService,
        };
    } catch (error) {
        console.error(error);
        throw new Error('Connessione al database fallita');
    }
};

export default editService;
