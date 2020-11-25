import React, { FC } from 'react';
import { bindActionCreators } from 'redux';
import { useDispatch } from 'react-redux';
import { Typography, Paper } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import classNames from 'classnames';

import { WeekWorkingShifts, WeekDays } from '../../types';
import { translateWeekDays, hourMinuteToReadableString } from '../../utils';
import { openDialog } from '../../redux';
import { WEEK_DAYS } from '../../config';
import WeekWorkingShiftsDialog from './WeekWorkingShiftsDialog';
import useStyles from './style';

type ShiftsFieldClassKey = 'root' | 'label' | 'text';

interface ShiftsFieldProps {
    onSelect: (weekWorkingShifts: WeekWorkingShifts | null) => void;
    value: WeekWorkingShifts | null;
    classes?: Partial<ClassNameMap<ShiftsFieldClassKey>>;
}

const ShiftsField: FC<ShiftsFieldProps> = ({ value, onSelect, classes }) => {
    const defaultClasses = useStyles();
    const actions = bindActionCreators({ openDialog }, useDispatch());

    const handleDialogOpening = () => {
        actions.openDialog({
            title: 'Aggiungi turni di lavoro',
            content: <WeekWorkingShiftsDialog value={value} onSelect={onSelect} />,
        });
    };

    return (
        <Paper onClick={handleDialogOpening} className={classNames(defaultClasses.root, classes?.root)}>
            <div className={defaultClasses.spacing}>
                <Typography variant="button" className={classNames(defaultClasses.strong, classes?.label)}>
                    Turni di lavoro:
                </Typography>
                {value ? (
                    (Object.keys(value) as Array<WeekDays>)
                        .sort((dayA, dayB) => WEEK_DAYS.indexOf(dayA) - WEEK_DAYS.indexOf(dayB))
                        .map((day) => (
                            <div key={day}>
                                <Typography variant="body1" display="inline" className={defaultClasses.strong}>
                                    {translateWeekDays(day)}:{' '}
                                </Typography>
                                <Typography variant="body1" display="inline">
                                    {value?.[day]
                                        ?.map(
                                            (shift) =>
                                                `dalle ${hourMinuteToReadableString(
                                                    shift.startTime,
                                                )} alle ${hourMinuteToReadableString(shift.endTime)}`,
                                        )
                                        .join(' e ')}
                                </Typography>
                            </div>
                        ))
                ) : (
                    <Typography variant="body2" className={classNames(classes?.text)}>
                        Non definiti
                    </Typography>
                )}
            </div>
        </Paper>
    );
};

export default ShiftsField;
