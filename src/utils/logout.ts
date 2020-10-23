import firebase from 'firebase/app';
import 'firebase/auth';

/**
 * Log out the current logged user
 */
const logout = () => {
    firebase.auth().signOut();
};

export default logout;
