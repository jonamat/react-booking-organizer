import firebase from 'firebase/app';
import 'firebase/auth';

/**
 * Validates user inputs and send them to auth system
 * @param formData Raw data from form
 */
const login = async (formData: FormData) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const persistence = !!formData.get('remember');

    if (!email || !password) throw new Error('Compila i campi obbligatori');

    // Shallow check of email format
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Email non valida');

    try {
        if (persistence) await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        else await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

        await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
        switch (error.code) {
            case 'auth/invalid-email':
                throw new Error('Email non valida');

            case 'auth/user-not-found':
                throw new Error('Utente non trovato');

            case 'auth/wrong-password':
                throw new Error('Password errata');

            default:
                throw error;
        }
    }
};

export default login;
