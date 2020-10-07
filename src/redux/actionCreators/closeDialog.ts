import { DialogCreator } from '../../types';

/**
 * Hide the ConnectedDialog component
 */
const closeDialog: DialogCreator = () => (dispatch, getState) => {
    const { dialog } = getState().status;

    dispatch({
        type: 'CHANGE_DIALOG_STATUS',
        dialog: {
            // Keep content for closing transition
            ...dialog,
            open: false,
        },
    });
};

export default closeDialog;
