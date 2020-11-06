import React, { FC, useRef, FormEvent, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import {
    Typography,
    TextField,
    Button,
    Divider,
    TextFieldProps,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
} from '@material-ui/core';
import { toast } from 'react-toastify';

import { PROGRESSIVE_MINS_WITHIN_MAX_SERVICE } from '../../config';
import { addService, formatMinutes } from '../../utils';
import useStyles from './style';

const AddService: FC<RouteComponentProps> = ({ history }) => {
    const classes = useStyles();
    const [loading, setLoading] = useState<boolean>(false);
    const inputForm = useRef<HTMLFormElement>(null);
    const fieldProps: TextFieldProps = {
        className: classes.field,
        variant: 'outlined',
        autoComplete: 'off',
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!inputForm.current) return;

        // Disable user interactions
        setLoading(true);

        addService(new FormData(inputForm.current))
            .then((service) => {
                toast.success('Aggiunto nuovo servizio: ' + service.name);
                history.push('/services');
            })
            .catch((error) => {
                toast.error(error.message);
                setLoading(false);
            });
    };

    return (
        <div className={classes.container} data-testid="add-customer">
            <Typography variant="h6">Aggiungi servizio</Typography>
            <Divider className={classes.divider} />
            <form className={classes.form} ref={inputForm} onSubmit={handleSubmit} data-testid="form">
                <TextField {...fieldProps} name="name" label="Nome" inputProps={{ 'data-testid': 'name' }} required />

                <FormControl variant="outlined" className={classes.field} required>
                    <InputLabel className={classes.label} id="averageDurationLabel">
                        Durata media del servizio
                    </InputLabel>
                    <Select
                        labelId="averageDurationLabel"
                        name="averageDuration"
                        defaultValue={PROGRESSIVE_MINS_WITHIN_MAX_SERVICE[0]}
                        inputProps={{ 'data-testid': 'averageDuration' }}
                    >
                        {PROGRESSIVE_MINS_WITHIN_MAX_SERVICE.map((valueInMins) => (
                            <MenuItem key={valueInMins} value={valueInMins}>
                                {formatMinutes(valueInMins)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <div className={classes.submitButton}>
                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                        data-testid="submit-button"
                    >
                        {loading ? 'Caricamento' : 'Aggiungi'}
                    </Button>
                    <Button variant="contained" color="primary" disabled={loading} onClick={() => history.goBack()}>
                        Annulla
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default React.memo(
    AddService,
    (prevProps, nextProps) => prevProps.location.search === nextProps.location.search,
);
