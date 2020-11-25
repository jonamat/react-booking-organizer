import React, { FC } from 'react';
import { bindActionCreators } from 'redux';
import { useDispatch } from 'react-redux';
import { Typography, Paper } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import classNames from 'classnames';

import { Holiday } from '../../types';
import { openDialog } from '../../redux';
import HolidaysDialog from './HolidaysDialog';
import useStyles from './style';

type HolidaysFieldClassKey = 'root' | 'label' | 'text';

interface HolidaysFieldProps {
    onSelect: (holidays: Array<Holiday> | null) => void;
    value: Array<Holiday> | null;
    classes?: Partial<ClassNameMap<HolidaysFieldClassKey>>;
}

const HolidaysField: FC<HolidaysFieldProps> = ({ value, onSelect, classes }) => {
    const defClasses = useStyles();
    const actions = bindActionCreators({ openDialog }, useDispatch());

    const handleDialogOpening = () => {
        actions.openDialog({
            title: 'Aggiungi ferie',
            content: <HolidaysDialog value={value} onSelect={onSelect} />,
        });
    };

    return (
        <Paper onClick={handleDialogOpening} className={classNames(defClasses.root, classes?.root)}>
            <div className={defClasses.spacing}>
                <Typography variant="button" className={classNames(defClasses.strong, classes?.label)}>
                    Ferie in programma:
                </Typography>
                {value ? (
                    value
                        .sort((intA, intB) => intA.startDay.getTime() - intB.startDay.getTime())
                        .map((holiday, index) => (
                            <div key={index}>
                                <Typography variant="body1" display="inline" className={defClasses.strong}>
                                    {'Dal '}
                                </Typography>
                                <Typography variant="body1" display="inline">
                                    {holiday.startDay.toLocaleDateString('it-IT', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </Typography>
                                <Typography variant="body1" display="inline" className={defClasses.strong}>
                                    {' al '}
                                </Typography>
                                <Typography variant="body1" display="inline">
                                    {holiday.endDay.toLocaleDateString('it-IT', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </Typography>
                            </div>
                        ))
                ) : (
                    <Typography variant="body2" className={classNames(classes?.text)}>
                        Non definite
                    </Typography>
                )}
            </div>
        </Paper>
    );
};

export default HolidaysField;
