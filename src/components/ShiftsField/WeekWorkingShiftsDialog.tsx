import React, { FC, useState } from 'react';
import { bindActionCreators } from 'redux';
import { useDispatch } from 'react-redux';
import { TimePicker } from '@material-ui/pickers';
import { toast } from 'react-toastify';
import {
    Typography,
    Switch,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Collapse,
    IconButton,
    Tooltip,
} from '@material-ui/core';

import { closeDialog } from '../../redux';
import { MIN_STEP, WEEK_DAYS } from '../../config';
import { translateWeekDays } from '../../utils';
import { WeekWorkingShifts, WeekDays, WorkingShift, HourMinute } from '../../types';
import useStyles from './style';

// Icons
import AddCircleOutlineRoundedIcon from '@material-ui/icons/AddCircleOutlineRounded';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';

const hourMinuteToDate = (hourMinute: HourMinute): Date => {
    const date = new Date();
    date.setHours(hourMinute.hour);
    date.setMinutes(hourMinute.minute);
    return date;
};

const dateToHourMinute = (date: Date): HourMinute => {
    return { hour: date.getHours(), minute: date.getMinutes() };
};

interface WeekWorkingShiftsDialogProps {
    onSelect: (weekWorkingShifts: WeekWorkingShifts | null) => void;
    value: WeekWorkingShifts | null;
}

const defaultWorkingShift: WorkingShift = {
    startTime: { hour: 8, minute: 0 },
    endTime: { hour: 20, minute: 0 },
};

const WeekWorkingShiftsDialog: FC<WeekWorkingShiftsDialogProps> = ({ onSelect, value }) => {
    const classes = useStyles();
    const [tempWeekWorkingShifts, setTempDates] = useState<WeekWorkingShifts>(value || {});
    const actions = bindActionCreators({ closeDialog }, useDispatch());

    const handleTimeChange = (key: keyof WorkingShift, dayName: WeekDays, newDate: Date, shiftIndex: number) => {
        const newState = { ...tempWeekWorkingShifts };
        if (!(newState[dayName] && newState[dayName]?.[shiftIndex] && newState[dayName]?.[shiftIndex]?.[key]))
            throw new Error('Attempt to change dates before initialization of related day in WeekWorkingShift');

        if (
            key === 'endTime' &&
            hourMinuteToDate((newState[dayName] as WorkingShift[])[shiftIndex].startTime).getTime() >= newDate.getTime()
        )
            toast.warn('Stai impostando una orario di fine turno precedente a quello di inizio turno');

        (newState[dayName] as WorkingShift[])[shiftIndex][key] = dateToHourMinute(newDate);
        setTempDates(newState);
    };

    const handleConfirm = () => {
        if (
            Object.values(tempWeekWorkingShifts).some(
                (weekWorkingShifts) =>
                    weekWorkingShifts &&
                    weekWorkingShifts.some(
                        (workingShift) =>
                            hourMinuteToDate(workingShift.endTime).getTime() <
                            hourMinuteToDate(workingShift.startTime).getTime(),
                    ),
            )
        ) {
            toast.error('Non puoi impostare una orario di fine turno precedente a quello di inizio turno');
            return;
        }

        actions.closeDialog();
        if (Object.keys(tempWeekWorkingShifts).length) onSelect(tempWeekWorkingShifts);
        else onSelect(null);
    };

    const handleAddShift = (dayName: WeekDays) => {
        const prevShifts = tempWeekWorkingShifts[dayName];

        if (!prevShifts) setTempDates({ ...tempWeekWorkingShifts, [dayName]: [{ ...defaultWorkingShift }] });
        else
            setTempDates({
                ...tempWeekWorkingShifts,
                [dayName]: [...prevShifts, { ...defaultWorkingShift }],
            });
    };

    const handleRemoveLastShift = (dayName: WeekDays) => {
        const prevShifts = tempWeekWorkingShifts[dayName];

        if (prevShifts && prevShifts?.length > 1) {
            const newState = { ...tempWeekWorkingShifts };
            newState[dayName]?.pop();
            setTempDates(newState);
        } else {
            const newState = { ...tempWeekWorkingShifts };
            delete newState[dayName];
            setTempDates(newState);
        }
    };

    const handleToggleDay = (dayName: WeekDays) => {
        if (tempWeekWorkingShifts?.[dayName]) {
            const newState = { ...tempWeekWorkingShifts };
            delete newState[dayName];
            setTempDates(newState);
        } else handleAddShift(dayName);
    };

    return (
        <>
            <DialogContent className={classes.dialog}>
                {WEEK_DAYS.map((dayName) => (
                    <div key={dayName} className={classes.day}>
                        <Grid container wrap="nowrap" alignItems="center" justify="space-between">
                            <Typography variant="body1">{translateWeekDays(dayName)}</Typography>
                            <Switch
                                checked={!!tempWeekWorkingShifts?.[dayName]}
                                onChange={() => handleToggleDay(dayName)}
                            />
                        </Grid>
                        <Collapse in={!!tempWeekWorkingShifts?.[dayName]}>
                            {tempWeekWorkingShifts?.[dayName]?.map((shift, index) => (
                                <Grid
                                    key={index}
                                    container
                                    wrap="nowrap"
                                    alignItems="center"
                                    justify="space-around"
                                    className={classes.pickers}
                                >
                                    <TimePicker
                                        autoOk
                                        minutesStep={MIN_STEP}
                                        ampm={false}
                                        label="Ora inizio"
                                        value={hourMinuteToDate(shift.startTime)}
                                        onChange={(newDate) =>
                                            newDate && handleTimeChange('startTime', dayName, newDate, index)
                                        }
                                        cancelLabel="Annulla"
                                    />
                                    <TimePicker
                                        autoOk
                                        minutesStep={MIN_STEP}
                                        ampm={false}
                                        label="Ora fine"
                                        value={hourMinuteToDate(shift.endTime)}
                                        onChange={(newDate) =>
                                            newDate && handleTimeChange('endTime', dayName, newDate, index)
                                        }
                                        cancelLabel="Annulla"
                                    />
                                </Grid>
                            ))}
                            <Grid container wrap="nowrap" alignItems="center" justify="flex-end">
                                {(tempWeekWorkingShifts?.[dayName]?.length ?? 0) > 1 && (
                                    <Tooltip title="Rimuovi turno">
                                        <IconButton onClick={() => handleRemoveLastShift(dayName)}>
                                            <RemoveCircleOutlineIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip title="Aggiungi turno">
                                    <IconButton onClick={() => handleAddShift(dayName)}>
                                        <AddCircleOutlineRoundedIcon />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        </Collapse>
                    </div>
                ))}
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

export default WeekWorkingShiftsDialog;
