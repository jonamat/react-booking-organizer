import React, { FC, useRef, FormEvent, useState } from 'react';
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
import { RouteComponentProps } from 'react-router';
import { toast } from 'react-toastify';
import { useStore } from 'react-redux';

import { editService, formatMinutes } from '../../utils';
import { PROGRESSIVE_MINS_WITHIN_MAX_SERVICE } from '../../config';
import { RootState } from '../../types';
import useStyles from './style';

const AddService: FC<RouteComponentProps<{ serviceId: string }>> = ({ history, match }) => {
    const classes = useStyles();
    const [loading, setLoading] = useState<boolean>(false);
    const inputForm = useRef<HTMLFormElement>(null);
    const {
        database: { services },
    } = useStore<RootState>().getState();

    const fieldProps: TextFieldProps = {
        className: classes.field,
        variant: 'outlined',
        autoComplete: 'off',
    };

    if (!services) throw new Error('Internal error - Resources loading logic broken');

    const serviceId = match.params.serviceId;
    const service = services.find((service) => service.id === serviceId);

    if (!service) {
        toast.error('Servizio non presente nel database');
        history.push('/services');
        return null;
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!inputForm.current) return;

        // Disable user interactions
        setLoading(true);

        editService(serviceId, new FormData(inputForm.current))
            .then((service) => {
                toast.success('Modificato servizio: ' + service.name);
                history.push('/services');
            })
            .catch((error) => {
                toast.error(error.message);
                setLoading(false);
            });
    };

    return (
        <div className={classes.container} data-testid="edit-service">
            <Typography variant="h6">Aggiungi servizio</Typography>
            <Divider className={classes.divider} />
            <form className={classes.form} ref={inputForm} onSubmit={handleSubmit} data-testid="form">
                <TextField {...fieldProps} name="id" label="ID" required disabled defaultValue={service.id} />
                <TextField
                    {...fieldProps}
                    inputProps={{ 'data-testid': 'name' }}
                    name="name"
                    label="Nome"
                    required
                    defaultValue={service.name}
                />

                <FormControl variant="outlined" className={classes.field} required>
                    <InputLabel className={classes.label} id="averageDurationLabel">
                        Durata media del servizio
                    </InputLabel>
                    <Select
                        labelId="averageDurationLabel"
                        name="averageDuration"
                        inputProps={{ 'data-testid': 'averageDuration' }}
                        defaultValue={service.averageDuration}
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
                        {loading ? 'Caricamento' : 'Applica modifiche'}
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
    (prevProps, nextProps) => prevProps.location.pathname === nextProps.location.pathname,
);
