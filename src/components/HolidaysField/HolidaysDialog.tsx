import React, { FC, useState } from 'react';
import { bindActionCreators } from 'redux';
import { useDispatch } from 'react-redux';
import { Typography, DialogContent, DialogActions, Button, Grid, IconButton, Tooltip } from '@material-ui/core';
import { DatePicker, DatePickerView } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { toast } from 'react-toastify';

import { closeDialog } from '../../redux';
import { Holiday } from '../../types';
import useStyles from './style';

// Icons
import AddCircleOutlineRoundedIcon from '@material-ui/icons/AddCircleOutlineRounded';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';

interface HolidaysDialogProps {
    onSelect: (weekWorkingShifts: Array<Holiday> | null) => void;
    value: Array<Holiday> | null;
}

const now = new Date();
const defaultHoliday: Holiday = {
    startDay: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
    endDay: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
};

const HolidaysDialog: FC<HolidaysDialogProps> = ({ onSelect, value }) => {
    const classes = useStyles();
    const [tempHolidays, setTempHolidays] = useState<Array<Holiday>>(value || [{ ...defaultHoliday }]);
    const actions = bindActionCreators({ closeDialog }, useDispatch());

    const handleDateChange = (index: number, key: keyof Holiday, newDate: MaterialUiPickersDate) => {
        if (!newDate) return;

        // Check if selected date is after the start hour
        if (key === 'endDay' && tempHolidays[index]['startDay'].getTime() > newDate.getTime())
            toast.warn('Stai impostando un giorno di fine ferie precedente a quello di inizio ferie');

        const newState = [...tempHolidays];
        newState[index][key] = newDate;
        setTempHolidays(newState);
    };

    const handleConfirm = () => {
        if (tempHolidays.some((holiday) => holiday.endDay.getTime() < holiday.startDay.getTime())) {
            toast.error('Non puoi impostare un giorno di fine ferie precedente a quello di inizio ferie');
            return;
        }

        actions.closeDialog();
        onSelect(tempHolidays.length ? tempHolidays : null);
    };
    const addHoliday = () => setTempHolidays([...tempHolidays].concat({ ...defaultHoliday }));
    const removeHoliday = () =>
        setTempHolidays(tempHolidays.length ? tempHolidays.slice(0, tempHolidays.length - 1) : []);

    const pickerProps = {
        disablePast: true,
        openTo: 'year' as DatePickerView,
        format: 'dd/MM/yyyy',
        views: ['year', 'month', 'date'] as Array<DatePickerView>,
        cancelLabel: 'Annulla',
    };

    return (
        <>
            <DialogContent className={classes.dialog}>
                {tempHolidays
                    .sort((intA, intB) => intA.startDay.getTime() - intB.startDay.getTime())
                    .map((holiday, index) => (
                        <Grid
                            key={index}
                            container
                            wrap="nowrap"
                            alignItems="center"
                            justify="space-around"
                            className={classes.pickers}
                        >
                            <DatePicker
                                {...pickerProps}
                                label="Data inizio"
                                value={holiday.startDay}
                                onChange={(date) => handleDateChange(index, 'startDay', date)}
                            />
                            <DatePicker
                                {...pickerProps}
                                label="Data fine"
                                value={holiday.endDay}
                                onChange={(date) => handleDateChange(index, 'endDay', date)}
                            />
                        </Grid>
                    ))}

                <Grid container wrap="nowrap" alignItems="center" justify="flex-end">
                    {tempHolidays.length > 0 && (
                        <Tooltip title="Rimuovi ferie">
                            <IconButton onClick={removeHoliday}>
                                <RemoveCircleOutlineIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Aggiungi ferie">
                        <IconButton onClick={addHoliday}>
                            <AddCircleOutlineRoundedIcon />
                        </IconButton>
                    </Tooltip>
                </Grid>
                <Typography variant="caption">*Il giorno di fine ferie è inteso come non lavorativo</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={actions.closeDialog} color="primary">
                    Annulla
                </Button>
                <Button onClick={handleConfirm} color="primary" autoFocus>
                    Conferma
                </Button>
            </DialogActions>
        </>
    );
};

export default HolidaysDialog;
