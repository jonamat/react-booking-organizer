import { DialogCreator, DialogStatus } from '../../types';

/**
 * Open a Dialog with a given content and title
 * @param content An object containing a title and content
 */
const openDialog: DialogCreator = ({ title, content }: Required<Omit<DialogStatus, 'open'>>) => (dispatch): void => {
    dispatch({
        type: 'CHANGE_DIALOG_STATUS',
        dialog: {
            open: true,
            title,
            content,
        },
    });
};

export default openDialog;
