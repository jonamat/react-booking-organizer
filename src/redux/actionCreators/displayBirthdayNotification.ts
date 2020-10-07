import React from 'react';
import { DialogContent, DialogContentText } from '@material-ui/core';
import { isToday, isValid } from 'date-fns';

import { BirthdaysNotificationDisplayedCreator } from '../../types';
import openDialog from './openDialog';

/**
 * Open a Dialog informing the user that there are customers that have birthdays today
 */
const displayBirthdayNotification: BirthdaysNotificationDisplayedCreator = () => (dispatch): void => {
    const lastBirthdayNotification = new Date(parseInt(localStorage.getItem('lastBirthdayNotification') || ''));

    if (!isValid(lastBirthdayNotification) || !isToday(lastBirthdayNotification)) {
        dispatch(
            openDialog({
                title: 'Un cliente compie gli anni oggi 🎉',
                content: React.createElement(
                    DialogContent,
                    null,
                    React.createElement(DialogContentText, null, 'Controlla la pagina dei compleanni'),
                ),
            }),
        );

        localStorage.setItem('lastBirthdayNotification', new Date().getTime().toString());
    }

    dispatch({
        type: 'BIRTHDAYS_NOTIFICATION_DISPLAYED',
        birthdayNotificationWasDisplayed: true,
    });
};

export default displayBirthdayNotification;
